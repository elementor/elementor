<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Core\Kits\Documents\Tabs\Global_Typography;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\V3_Control_Adapter_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Responsive_Key_Resolver;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\Block_Renderer;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\Serializers\Base_Property_Serializer;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\V3_Block_Accumulator;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * What a map-driven V3 widget paints before any of its style settings are set, in the same
 * target CSS as its styles, layered in cascade order: the widget stylesheet, the kit globals
 * Elementor prints for every widget of the type, then the element's control defaults.
 */
class V3_Map_Default_Styles {

	const COLOR = 'color';

	const TYPOGRAPHY = 'typography';

	const LAYER_SEPARATOR = "\n";

	private V3_Map_Style_Reader $reader;

	/**
	 * @var callable(string): mixed
	 */
	private $resolve_global;

	/**
	 * @var string[]
	 */
	private array $enabled_global_types;

	private Block_Renderer $renderer;

	/**
	 * @param V3_Map_Style_Reader     $reader
	 * @param callable(string): mixed $resolve_global       Kit value of a global key such as `globals/colors?id=primary`.
	 * @param string[]                $enabled_global_types {@see self::COLOR} and {@see self::TYPOGRAPHY} when the kit defaults of that type are on.
	 * @param Block_Renderer|null     $renderer
	 */
	public function __construct( V3_Map_Style_Reader $reader, callable $resolve_global, array $enabled_global_types, ?Block_Renderer $renderer = null ) {
		$this->reader = $reader;
		$this->resolve_global = $resolve_global;
		$this->enabled_global_types = $enabled_global_types;
		$this->renderer = $renderer ?? new Block_Renderer();
	}

	public static function create_default(): self {
		$kits_manager = Plugin::$instance->kits_manager;

		return new self(
			new V3_Map_Style_Reader( V3_Control_Adapter_Registry::create_default() ),
			fn( string $global_key ) => Plugin::$instance->data_manager_v2->run( $global_key )['value'] ?? null,
			array_keys( array_filter( [
				self::COLOR => $kits_manager->is_custom_colors_enabled(),
				self::TYPOGRAPHY => $kits_manager->is_custom_typography_enabled(),
			] ) )
		);
	}

	/**
	 * @param Compiled_V3_Map      $map
	 * @param array<string, mixed> $settings   The element settings; only the ones that decide which controls show are used.
	 * @param array<string, mixed> $controls
	 * @param callable|null        $is_visible {@see V3_Map_Style_Reader::read()}.
	 */
	public function render( Compiled_V3_Map $map, array $settings, array $controls, ?callable $is_visible = null ): string {
		$bound_keys = $this->bound_keys( $map, $controls );
		$unstyled = array_diff_key( $settings, array_flip( $bound_keys ), [ V3_Settings_Patch::GLOBALS_KEY => true ] );

		$layers = [
			$this->render_targets( $this->stylesheet_blocks( $map ), $map ),
			$this->render_targets( $this->reader->read( $map, $this->kit_global_values( $map, $bound_keys, $controls ) + $unstyled, $controls ), $map ),
			$this->render_targets( $this->reader->read( $map, $this->control_defaults( $bound_keys, $controls ) + $unstyled, $controls, $is_visible ), $map ),
		];

		return implode( self::LAYER_SEPARATOR, array_filter( $layers ) );
	}

	/**
	 * @return array<string, V3_Block_Accumulator>
	 */
	private function stylesheet_blocks( Compiled_V3_Map $map ): array {
		return array_map( function ( Compiled_Style_Target $target ): V3_Block_Accumulator {
			$blocks = new V3_Block_Accumulator();

			foreach ( $target->get_defaults() as $property => $value ) {
				$blocks->push( Responsive_Key_Resolver::BASE_BREAKPOINT, null, (string) $property, $value );
			}

			return $blocks;
		}, $map->get_targets() );
	}

	/**
	 * @param array<string, V3_Block_Accumulator> $blocks
	 */
	private function render_targets( array $blocks, Compiled_V3_Map $map ): string {
		return $this->renderer->render_targets( $blocks, $map->get_default_target() );
	}

	/**
	 * @return string[] Registered setting keys the map's style bindings read, with their device keys.
	 */
	private function bound_keys( Compiled_V3_Map $map, array $controls ): array {
		$suffixes = array_merge( [ '' ], array_keys( Base_Property_Serializer::RESPONSIVE_SUFFIXES ) );
		$keys = [];

		foreach ( $map->get_targets() as $target ) {
			foreach ( $target->get_bindings() as $binding ) {
				foreach ( $suffixes as $suffix ) {
					$keys[] = $binding->get_setting() . $suffix;
				}
			}
		}

		return array_values( array_intersect( array_unique( $keys ), array_keys( $controls ) ) );
	}

	/**
	 * @param string[] $bound_keys
	 * @return array<string, mixed>
	 */
	private function control_defaults( array $bound_keys, array $controls ): array {
		$defaults = [];

		foreach ( $bound_keys as $key ) {
			$default = $controls[ $key ]['default'] ?? null;

			if ( null !== $default && '' !== $default && [] !== $default ) {
				$defaults[ $key ] = $default;
			}
		}

		return $defaults;
	}

	/**
	 * Mirrors {@see \Elementor\Core\Files\CSS\Post::render_element_global_styles()}: a control with
	 * selectors takes the kit value of its own global default, or of its group's, whatever its conditions,
	 * so the binding dependencies those conditions became are met too.
	 *
	 * @param Compiled_V3_Map $map
	 * @param string[]        $bound_keys
	 * @param array           $controls
	 * @return array<string, mixed>
	 */
	private function kit_global_values( Compiled_V3_Map $map, array $bound_keys, array $controls ): array {
		$values = [];

		foreach ( $bound_keys as $key ) {
			$value = $this->kit_global_value( $key, $controls );

			if ( null !== $value && '' !== $value ) {
				$values[ $key ] = $value;
			}
		}

		$dependencies = [];

		foreach ( $map->get_targets() as $target ) {
			foreach ( $target->get_bindings() as $binding ) {
				if ( isset( $values[ $binding->get_setting() ] ) ) {
					$dependencies += $binding->get_dependency_values();
				}
			}
		}

		return $values + $dependencies;
	}

	/**
	 * @return mixed
	 */
	private function kit_global_value( string $key, array $controls ) {
		$control = $controls[ $key ];
		$group_type = $control['groupType'] ?? null;
		$type = null === $group_type ? $control['type'] ?? null : $group_type;
		$global_control = null === $group_type ? $control : $controls[ ( $control['groupPrefix'] ?? '' ) . $group_type ] ?? [];
		$global_key = $global_control['global']['default'] ?? null;

		if ( empty( $control['selectors'] ) || ! is_string( $global_key ) || ! in_array( $type, $this->enabled_global_types, true ) ) {
			return null;
		}

		$global_value = ( $this->resolve_global )( $global_key );

		if ( null === $group_type ) {
			return is_string( $global_value ) ? $global_value : null;
		}

		$field = Global_Typography::TYPOGRAPHY_GROUP_PREFIX . substr( $key, strlen( $control['groupPrefix'] ?? '' ) );

		return is_array( $global_value ) ? $global_value[ $field ] ?? null : null;
	}
}
