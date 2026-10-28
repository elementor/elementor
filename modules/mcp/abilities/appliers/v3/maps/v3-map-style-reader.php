<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Controls_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Props_To_Css;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\V3_Control_Adapter_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Responsive_Key_Resolver;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\V3_Block_Accumulator;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Control_Visibility;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Map_Style_Reader {

	private V3_Control_Adapter_Registry $adapters;
	private V3_Color_Variables $color_variables;

	public function __construct( V3_Control_Adapter_Registry $adapters, ?V3_Color_Variables $color_variables = null ) {
		$this->adapters = $adapters;
		$this->color_variables = $color_variables ?? V3_Color_Variables::create_default();
	}

	/**
	 * @param Compiled_V3_Map      $map
	 * @param array<string, mixed> $settings
	 * @param array<string, mixed> $controls
	 * @param callable|null        $is_visible `( array $control, array $values, array $controls ): bool`; hidden controls are not rendered.
	 * @return array<string, V3_Block_Accumulator> Alias => blocks of that style target.
	 */
	public function read( Compiled_V3_Map $map, array $settings, array $controls, ?callable $is_visible = null ): array {
		$is_key_visible = $this->key_visibility( $settings, $controls, $is_visible );

		return array_map(
			fn( Compiled_Style_Target $target ) => $this->read_target( $target->get_bindings(), $settings, $controls, $is_key_visible ),
			$map->get_targets()
		);
	}

	/**
	 * Setting keys {@see self::read()} renders from, so a replace clears exactly what was read.
	 *
	 * @param Compiled_V3_Map      $map
	 * @param array<string, mixed> $settings
	 * @param array<string, mixed> $controls
	 * @param callable|null        $is_visible `( array $control, array $values, array $controls ): bool`.
	 * @return string[]
	 */
	public function readable_keys( Compiled_V3_Map $map, array $settings, array $controls, ?callable $is_visible = null ): array {
		$is_key_visible = $this->key_visibility( $settings, $controls, $is_visible );
		$suffixes = array_keys( [ '' => Responsive_Key_Resolver::BASE_BREAKPOINT ] + Responsive_Key_Resolver::RESPONSIVE_SUFFIXES );
		$keys = [];

		foreach ( $map->get_targets() as $target ) {
			foreach ( $target->get_bindings() as $binding ) {
				foreach ( $suffixes as $suffix ) {
					$keys[] = $this->readable_key( $binding, $settings, $controls, (string) $suffix, $is_key_visible );
				}
			}
		}

		return array_values( array_unique( array_filter( $keys ) ) );
	}

	/**
	 * @param Compiled_Style_Binding[] $bindings
	 */
	private function read_target( array $bindings, array $settings, array $controls, callable $is_key_visible ): V3_Block_Accumulator {
		$blocks = new V3_Block_Accumulator();
		$suffixes = [ '' => Responsive_Key_Resolver::BASE_BREAKPOINT ] + Responsive_Key_Resolver::RESPONSIVE_SUFFIXES;

		foreach ( $suffixes as $suffix => $breakpoint ) {
			foreach ( $this->props_by_state( $bindings, $settings, $controls, $suffix, $is_key_visible ) as $state => $props ) {
				$block_state = Style_Target::DEFAULT_STATE === $state ? null : $state;

				foreach ( Style_Props_To_Css::to_map( $props ) as $property => $value ) {
					$blocks->push( $breakpoint, $block_state, (string) $property, (string) $value );
				}
			}
		}

		return $blocks;
	}

	/**
	 * @return array<string, array<string, array<string, mixed>>>
	 */
	private function props_by_state( array $bindings, array $settings, array $controls, string $suffix, callable $is_key_visible ): array {
		$props = [];

		foreach ( $bindings as $binding ) {
			$prop_value = $this->read_binding( $binding, $settings, $controls, $suffix, $is_key_visible );

			if ( null === $prop_value ) {
				continue;
			}

			$existing = $props[ $binding->get_state() ][ $binding->get_prop() ] ?? null;
			$props[ $binding->get_state() ][ $binding->get_prop() ] = null === $existing
				? $prop_value
				: $this->merge( $existing, $prop_value );
		}

		return $props;
	}

	private function readable_key( Compiled_Style_Binding $binding, array $settings, array $controls, string $suffix, callable $is_key_visible ): ?string {
		if ( '' !== $suffix && ! $binding->is_responsive() ) {
			return null;
		}

		if ( ! $this->are_dependencies_met( $binding->get_dependency_values(), $settings, $controls, $suffix ) ) {
			return null;
		}

		$key = $binding->get_setting() . $suffix;

		return $is_key_visible( $key, $binding->get_setting() ) ? $key : null;
	}

	private function read_binding( Compiled_Style_Binding $binding, array $settings, array $controls, string $suffix, callable $is_key_visible ): ?array {
		$key = $this->readable_key( $binding, $settings, $controls, $suffix, $is_key_visible );

		if ( null === $key ) {
			return null;
		}

		$prop_value = $this->linked_color_variable( $binding, $settings, $key ) ?? $this->stored_prop_value( $binding, $settings, $key );

		if ( null === $prop_value || null === $binding->get_part() ) {
			return $prop_value;
		}

		return [
			'$$type' => $binding->get_part_of(),
			'value' => [ $binding->get_part() => $prop_value ],
		];
	}

	private function stored_prop_value( Compiled_Style_Binding $binding, array $settings, string $key ): ?array {
		$stored = $settings[ $key ] ?? null;
		$adapter = $this->adapters->find( $binding->get_read_type(), $binding->get_control_type(), null !== $binding->get_sides() );

		if ( is_array( $stored ) && Controls_Manager::BOX_SHADOW === $binding->get_control_type() && V3_Map_Style_Writer::SHADOW_INSET === ( $settings[ $key . V3_Map_Style_Writer::SHADOW_POSITION_SUFFIX ] ?? '' ) ) {
			$stored['position'] = V3_Map_Style_Writer::SHADOW_INSET;
		}

		return null === $stored || null === $adapter ? null : $adapter->from_control_value( $stored, $binding->get_sides() );
	}

	private function linked_color_variable( Compiled_Style_Binding $binding, array $settings, string $key ): ?array {
		if ( Controls_Manager::COLOR !== $binding->get_control_type() ) {
			return null;
		}

		$variable_id = $this->color_variables->variable_id_for_global_link( $settings[ V3_Settings_Patch::GLOBALS_KEY ][ $key ] ?? null );

		if ( null === $variable_id ) {
			return null;
		}

		$color = Color_Variable_Prop_Type::generate( $variable_id );

		return Background_Prop_Type::get_key() === $binding->get_read_type()
			? Background_Prop_Type::generate( [ 'color' => $color ] )
			: $color;
	}

	/**
	 * @return callable `( string $key, string $base_key ): bool`
	 */
	private function key_visibility( array $settings, array $controls, ?callable $is_visible ): callable {
		if ( null === $is_visible ) {
			return fn(): bool => true;
		}

		$values = V3_Control_Visibility::values_with_defaults( $controls, $settings );
		$values_by_suffix = [];

		return function ( string $key, string $base_key ) use ( $is_visible, $values, $controls, &$values_by_suffix ): bool {
			if ( isset( $controls[ $key ] ) || $key === $base_key ) {
				return ! is_array( $controls[ $key ] ?? null ) || $is_visible( $controls[ $key ], $values, $controls );
			}

			if ( ! is_array( $controls[ $base_key ] ?? null ) ) {
				return true;
			}

			$suffix = substr( $key, strlen( $base_key ) );
			$values_by_suffix[ $suffix ] ??= self::device_values( $values, $suffix );

			return $is_visible( $controls[ $base_key ], $values_by_suffix[ $suffix ], $controls );
		};
	}

	/**
	 * A single `is_responsive` control is duplicated per device only when the page CSS is
	 * rendered, and each duplicate checks its condition against that device's value, falling
	 * back to the desktop value when the device is unset.
	 *
	 * @param array<string, mixed> $values
	 * @param string               $suffix
	 * @return array<string, mixed>
	 */
	private static function device_values( array $values, string $suffix ): array {
		foreach ( $values as $setting => $value ) {
			$device_value = $values[ $setting . $suffix ] ?? '';

			if ( '' !== $device_value ) {
				$values[ $setting ] = $device_value;
			}
		}

		return $values;
	}

	/**
	 * Elementor does not store settings left at their default, so an unset dependency falls
	 * back to the desktop value and then the control default. A multi-select dependency is met
	 * when its list contains the value.
	 *
	 * @param array<string, mixed> $dependency_values
	 * @param array<string, mixed> $settings
	 * @param array<string, mixed> $controls
	 * @param string               $suffix
	 */
	private function are_dependencies_met( array $dependency_values, array $settings, array $controls, string $suffix ): bool {
		foreach ( $dependency_values as $setting => $value ) {
			$current = $settings[ $setting . $suffix ] ?? $settings[ $setting ] ?? $controls[ $setting ]['default'] ?? '';
			$is_met = is_array( $current )
				? in_array( (string) $value, array_map( 'strval', $current ), true )
				: (string) $current === (string) $value;

			if ( ! $is_met ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * @param array<string, mixed> $existing
	 * @param array<string, mixed> $addition
	 * @return array<string, mixed>
	 */
	private function merge( array $existing, array $addition ): array {
		$value = array_merge( $existing['value'] ?? [], $addition['value'] ?? [] );

		if ( Dimensions_Prop_Type::get_key() === ( $existing['$$type'] ?? null ) ) {
			return Dimensions_Prop_Type::generate( $value );
		}

		return [
			'$$type' => $existing['$$type'] ?? null,
			'value' => $value,
		];
	}
}
