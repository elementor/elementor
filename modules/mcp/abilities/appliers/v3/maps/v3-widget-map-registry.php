<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\Logger\Logger;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Advanced_Wrapper;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\Mcp\Abilities\Utils\V3_Json_Schema_Builder;
use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;
use Elementor\Modules\Mcp\Module as Mcp_Module;
use Elementor\Plugin;
use Elementor\Widget_Base;
use Elementor\Widget_Common_Base;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Widget_Map_Registry {

	const MAPS_DIR = __DIR__;
	const REGISTERED_MAPS_FILE = __DIR__ . '/registered-maps.php';

	const DIAGNOSTICS_LOG_MESSAGE = 'V3 widget map entries were dropped while compiling against the registered controls.';

	const COMMON_WIDGET_TYPE = 'common';

	/**
	 * @var self|null
	 */
	private static $instance = null;

	/**
	 * @var V3_Widget_Map_Compiler
	 */
	private $compiler;

	/**
	 * @var callable
	 */
	private $is_experiment_active;

	/**
	 * @var callable
	 */
	private $is_atomic_active;

	/**
	 * @var callable
	 */
	private $get_controls;

	/**
	 * @var array<string, V3_Widget_Map>
	 */
	private $maps;

	/**
	 * @var callable|null
	 */
	private $has_advanced_tab;

	/**
	 * @var array<string, Compiled_V3_Map|WP_Error|null>
	 */
	private $cache = [];

	private V3_Map_Diagnostics $diagnostics;

	/**
	 * @param V3_Widget_Map_Compiler                        $compiler
	 * @param callable(): bool                              $is_experiment_active
	 * @param callable(): bool                              $is_atomic_active
	 * @param callable(string): (array<string, mixed>|null) $get_controls
	 * @param array<string, V3_Widget_Map>                  $maps
	 * @param (callable(string): bool)|null                 $has_advanced_tab Widgets that get the {@see Advanced_Wrapper} target.
	 */
	public function __construct(
		V3_Widget_Map_Compiler $compiler,
		callable $is_experiment_active,
		callable $is_atomic_active,
		callable $get_controls,
		array $maps = [],
		?callable $has_advanced_tab = null
	) {
		$this->compiler = $compiler;
		$this->is_experiment_active = $is_experiment_active;
		$this->is_atomic_active = $is_atomic_active;
		$this->get_controls = $get_controls;
		$this->maps = $maps;
		$this->has_advanced_tab = $has_advanced_tab;
		$this->diagnostics = new V3_Map_Diagnostics();
	}

	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = self::create_default();
		}

		return self::$instance;
	}

	public static function set_instance( self $registry ): void {
		self::$instance = $registry;
	}

	/**
	 * @param array<string, V3_Widget_Map>|null $maps Defaults to the maps listed in registered-maps.php.
	 */
	public static function create_default( ?array $maps = null ): self {
		return new self(
			new V3_Widget_Map_Compiler(),
			static fn() => class_exists( \Elementor\Plugin::class )
				&& isset( Plugin::$instance->experiments )
				&& Plugin::$instance->experiments->is_feature_active( Mcp_Module::V3_STANDARDIZED_MAPS_EXPERIMENT_NAME ),
			static fn() => class_exists( \Elementor\Plugin::class )
				&& isset( Plugin::$instance->experiments )
				&& Plugin::$instance->experiments->is_feature_active( Atomic_Widgets_Module::EXPERIMENT_NAME ),
			static function ( string $widget_type ): ?array {
				$source = Plugin::$instance->widgets_manager->get_widget_types( $widget_type )
					?? Plugin::$instance->elements_manager->get_element_types( $widget_type );

				if ( ! $source || ! method_exists( $source, 'get_stack' ) ) {
					return null;
				}

				$stack = $source->get_stack( false );

				return ( $stack['controls'] ?? [] ) + ( $stack['style_controls'] ?? [] ) + self::advanced_tab_controls( $source );
			},
			$maps ?? self::load_map_files(),
			static fn( string $widget_type ): bool => self::has_advanced_tab( Plugin::$instance->widgets_manager->get_widget_types( $widget_type ) )
		);
	}

	/**
	 * Every widget except the common widget itself renders the common widget's Advanced tab.
	 *
	 * @param mixed $source
	 */
	private static function has_advanced_tab( $source ): bool {
		return $source instanceof Widget_Base && ! $source instanceof Widget_Common_Base;
	}

	/**
	 * `get_stack( false )` leaves out the shared Advanced tab, so its controls are read from the common widget.
	 *
	 * @param mixed $source
	 * @return array<string, mixed>
	 */
	private static function advanced_tab_controls( $source ): array {
		if ( ! self::has_advanced_tab( $source ) ) {
			return [];
		}

		$common_widget = Plugin::$instance->widgets_manager->get_widget_types( self::COMMON_WIDGET_TYPE );

		return $common_widget instanceof Widget_Common_Base ? $common_widget->get_controls() : [];
	}

	/**
	 * @return array<string, V3_Widget_Map>
	 */
	private static function load_map_files(): array {
		$maps = [];
		$files = is_readable( self::REGISTERED_MAPS_FILE ) ? require self::REGISTERED_MAPS_FILE : [];

		if ( ! is_array( $files ) ) {
			return $maps;
		}

		foreach ( $files as $widget_type => $path ) {
			if ( ! is_readable( $path ) ) {
				continue;
			}

			$map = require $path;

			if ( $map instanceof V3_Widget_Map ) {
				$maps[ $widget_type ] = $map;
			}
		}

		return $maps;
	}

	public static function reset_instance(): void {
		self::$instance = null;
	}

	public function has_registered_map( string $widget_type ): bool {
		return isset( $this->maps[ $widget_type ] );
	}

	public function is_experiment_active(): bool {
		$callback = $this->is_experiment_active;

		return (bool) $callback();
	}

	public function is_supported( string $widget_type ): bool {
		if ( ! $this->is_experiment_active() ) {
			return Widget_Context_Helper::is_v3_allowlisted( $widget_type );
		}

		return null !== $this->get_map( $widget_type );
	}

	/**
	 * The single gate for map-driven behavior: null whenever the standardized maps experiment
	 * or atomic elements are off, the widget has no map, or the map shape is invalid.
	 */
	public function get_map( string $widget_type ): ?Compiled_V3_Map {
		if ( ! $this->is_experiment_active() || ! $this->is_atomic_active() ) {
			return null;
		}

		$compiled = $this->compile( $widget_type );

		return $compiled instanceof Compiled_V3_Map ? $compiled : null;
	}

	/**
	 * @return array<int, array{widget_type: string, entry: string, reason: string, detail: string}>
	 */
	public function get_diagnostics( string $widget_type ): array {
		return $this->diagnostics->for_widget( $widget_type );
	}

	/**
	 * Full control stack (content and style buckets) the map was compiled against.
	 * `get_config()['controls']` omits split style controls, so responsive style keys
	 * must be looked up here.
	 *
	 * @return array<string, mixed>
	 */
	public function get_registered_controls( string $widget_type ): array {
		$get_controls = $this->get_controls;

		return $get_controls( $widget_type ) ?? [];
	}

	/**
	 * Public shape exposed to the LLM as the widget contract.
	 *
	 * @return array{description: string, properties: array<string, array<string, mixed>>, default_style_target: string, style_targets: array<string, array{label: string, states: string[], properties: string[]}>}|null
	 */
	public function get_llm_contract( string $widget_type ): ?array {
		$map = $this->get_map( $widget_type );

		if ( null === $map ) {
			return null;
		}

		return [
			'description' => $map->get_description(),
			'properties' => V3_Json_Schema_Builder::build_from_map( $map->get_setting_schemas() )['properties'],
			'default_style_target' => $map->get_default_target(),
			'style_targets' => array_map(
				fn( Compiled_Style_Target $target ) => [
					'label' => $target->get_label(),
					'states' => $target->get_states(),
					'properties' => $target->get_props(),
				],
				$map->get_targets()
			),
		];
	}

	private function is_atomic_active(): bool {
		$callback = $this->is_atomic_active;

		return (bool) $callback();
	}

	/**
	 * @return Compiled_V3_Map|WP_Error|null
	 */
	private function compile( string $widget_type ) {
		if ( ! isset( $this->maps[ $widget_type ] ) ) {
			return null;
		}

		if ( array_key_exists( $widget_type, $this->cache ) ) {
			return $this->cache[ $widget_type ];
		}

		$get_controls = $this->get_controls;
		$controls = $get_controls( $widget_type );

		$this->cache[ $widget_type ] = null === $controls
			? null
			: $this->compiler->compile( $this->map_with_shared_targets( $widget_type ), $controls, $this->diagnostics, $widget_type );

		$this->log_diagnostics( $widget_type );

		return $this->cache[ $widget_type ];
	}

	private function map_with_shared_targets( string $widget_type ): V3_Widget_Map {
		$map = $this->maps[ $widget_type ];
		$has_advanced_tab = $this->has_advanced_tab;

		if ( null === $has_advanced_tab || ! $has_advanced_tab( $widget_type ) ) {
			return $map;
		}

		return ( clone $map )->targets( Advanced_Wrapper::target() );
	}

	private function log_diagnostics( string $widget_type ): void {
		$diagnostics = $this->get_diagnostics( $widget_type );

		if ( empty( $diagnostics ) || ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) {
			return;
		}

		Logger::warning( self::DIAGNOSTICS_LOG_MESSAGE, [ 'entries' => $diagnostics ] );
	}
}
