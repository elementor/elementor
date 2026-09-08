<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\Mcp\Module as Mcp_Module;
use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;
use Elementor\Plugin;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Widget_Map_Registry {

	const MAPS_DIR = __DIR__;

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
	 * @var array<string, array<string, mixed>>
	 */
	private $maps;

	/**
	 * @var array<string, array<string, mixed>|WP_Error>
	 */
	private $cache = [];

	/**
	 * @param V3_Widget_Map_Compiler                        $compiler
	 * @param callable(): bool                              $is_experiment_active
	 * @param callable(): bool                              $is_atomic_active
	 * @param callable(string): (array<string, mixed>|null) $get_controls
	 * @param array<string, array<string, mixed>>           $maps
	 */
	public function __construct(
		V3_Widget_Map_Compiler $compiler,
		callable $is_experiment_active,
		callable $is_atomic_active,
		callable $get_controls,
		array $maps = []
	) {
		$this->compiler = $compiler;
		$this->is_experiment_active = $is_experiment_active;
		$this->is_atomic_active = $is_atomic_active;
		$this->get_controls = $get_controls;
		$this->maps = $maps;
	}

	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = self::create_default();
		}

		return self::$instance;
	}

	public static function create_default(): self {
		return new self(
			new V3_Widget_Map_Compiler(),
			static fn() => Plugin::$instance->experiments->is_feature_active( Mcp_Module::V3_STANDARDIZED_MAPS_EXPERIMENT_NAME ),
			static fn() => Plugin::$instance->experiments->is_feature_active( Atomic_Widgets_Module::EXPERIMENT_NAME ),
			static function ( string $widget_type ): ?array {
				$widget = Plugin::$instance->widgets_manager->get_widget_types( $widget_type );

				if ( ! $widget || ! method_exists( $widget, 'get_stack' ) ) {
					return null;
				}

				$widget->get_stack();
				$controls = $widget->get_controls();

				return is_array( $controls ) ? $controls : null;
			},
			self::load_map_files()
		);
	}

	/**
	 * @return array<string, array<string, mixed>>
	 */
	private static function load_map_files(): array {
		$maps = [];
		$files = [
			'heading' => self::MAPS_DIR . '/heading-map.php',
		];

		foreach ( $files as $widget_type => $path ) {
			if ( ! is_readable( $path ) ) {
				continue;
			}

			$map = require $path;

			if ( is_array( $map ) ) {
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

		$compiled = $this->get_compiled_map( $widget_type );

		if ( null === $compiled || $compiled instanceof WP_Error ) {
			return false;
		}

		if ( V3_Widget_Map_Compiler::CATALOG_VISIBILITY_ALWAYS === $compiled['catalog_visibility'] ) {
			return true;
		}

		$is_atomic_active = $this->is_atomic_active;

		return ! (bool) $is_atomic_active();
	}

	/**
	 * @return array<string, mixed>|WP_Error|null
	 */
	public function get_compiled_map( string $widget_type ) {
		if ( ! $this->is_experiment_active() ) {
			return null;
		}

		if ( ! isset( $this->maps[ $widget_type ] ) ) {
			return null;
		}

		if ( array_key_exists( $widget_type, $this->cache ) ) {
			return $this->cache[ $widget_type ];
		}

		$get_controls = $this->get_controls;
		$controls = $get_controls( $widget_type ) ?? [];
		$compiled = $this->compiler->compile( $this->maps[ $widget_type ], $controls, $widget_type );

		$this->cache[ $widget_type ] = $compiled;

		return $compiled;
	}

	/**
	 * @param array<string, mixed> $compiled_map
	 * @return array{targets: array<string, string[]>}
	 */
	public function build_public_style_targets( array $compiled_map ): array {
		$targets = [];

		foreach ( $compiled_map['style_targets'] as $alias => $target ) {
			if ( ! is_string( $alias ) || ! is_array( $target['css_properties'] ?? null ) ) {
				continue;
			}

			$targets[ $alias ] = array_values( array_map( 'strval', array_keys( $target['css_properties'] ) ) );
		}

		return [ 'targets' => $targets ];
	}
}
