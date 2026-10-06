<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Props_To_Css;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\V3_Control_Adapter_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Responsive_Key_Resolver;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\Serializers\Base_Property_Serializer;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\V3_Block_Accumulator;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Control_Visibility;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Map_Style_Reader {

	private V3_Control_Adapter_Registry $adapters;

	public function __construct( V3_Control_Adapter_Registry $adapters ) {
		$this->adapters = $adapters;
	}

	/**
	 * @param V3_Block_Accumulator     $blocks
	 * @param Compiled_Style_Binding[] $bindings
	 * @param array<string, mixed>     $settings
	 * @param array<string, mixed>     $controls
	 * @param callable|null            $is_visible `( array $control, array $values, array $controls ): bool`; hidden controls are not rendered.
	 */
	public function read( V3_Block_Accumulator $blocks, array $bindings, array $settings, array $controls, ?callable $is_visible = null ): void {
		$suffixes = [ '' => Responsive_Key_Resolver::BASE_BREAKPOINT ] + Base_Property_Serializer::RESPONSIVE_SUFFIXES;
		$is_key_visible = $this->key_visibility( $settings, $controls, $is_visible );

		foreach ( $suffixes as $suffix => $breakpoint ) {
			foreach ( $this->props_by_state( $bindings, $settings, $controls, $suffix, $is_key_visible ) as $state => $props ) {
				$block_state = Style_Target::DEFAULT_STATE === $state ? null : $state;

				foreach ( Style_Props_To_Css::to_map( $props ) as $property => $value ) {
					$blocks->push( $breakpoint, $block_state, (string) $property, (string) $value );
				}
			}
		}
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
				: $this->merge_sides( $existing, $prop_value );
		}

		return $props;
	}

	private function read_binding( Compiled_Style_Binding $binding, array $settings, array $controls, string $suffix, callable $is_key_visible ): ?array {
		if ( '' !== $suffix && ! $binding->is_responsive() ) {
			return null;
		}

		if ( ! $this->are_dependencies_met( $binding->get_dependency_values(), $settings, $controls ) ) {
			return null;
		}

		$key = $binding->get_setting() . $suffix;

		if ( ! $is_key_visible( $key, $binding->get_setting() ) ) {
			return null;
		}

		$stored = $settings[ $key ] ?? null;
		$adapter = $this->adapters->find( $binding->get_read_type(), $binding->get_control_type(), null !== $binding->get_sides() );

		if ( null === $stored || null === $adapter ) {
			return null;
		}

		return $adapter->from_control_value( $stored, $binding->get_sides() );
	}

	/**
	 * @return callable `( string $key, string $base_key ): bool`
	 */
	private function key_visibility( array $settings, array $controls, ?callable $is_visible ): callable {
		if ( null === $is_visible ) {
			return fn(): bool => true;
		}

		$values = V3_Control_Visibility::values_with_defaults( $controls, $settings );

		return function ( string $key, string $base_key ) use ( $is_visible, $values, $controls ): bool {
			$control = $controls[ $key ] ?? $controls[ $base_key ] ?? null;

			return ! is_array( $control ) || $is_visible( $control, $values, $controls );
		};
	}

	/**
	 * Elementor does not store settings left at their default, so an unset dependency
	 * falls back to the control default.
	 *
	 * @param array<string, mixed> $dependency_values
	 * @param array<string, mixed> $settings
	 * @param array<string, mixed> $controls
	 */
	private function are_dependencies_met( array $dependency_values, array $settings, array $controls ): bool {
		foreach ( $dependency_values as $setting => $value ) {
			$current = $settings[ $setting ] ?? $controls[ $setting ]['default'] ?? '';

			if ( (string) $current !== (string) $value ) {
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
	private function merge_sides( array $existing, array $addition ): array {
		return Dimensions_Prop_Type::generate( array_merge( $existing['value'] ?? [], $addition['value'] ?? [] ) );
	}
}
