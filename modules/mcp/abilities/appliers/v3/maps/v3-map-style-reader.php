<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Flex_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Props_To_Css;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\V3_Control_Adapter_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Responsive_Key_Resolver;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\Serializers\Base_Property_Serializer;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\V3_Block_Accumulator;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Choice_Values;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Map_Style_Reader {

	private V3_Control_Adapter_Registry $adapters;

	public function __construct( V3_Control_Adapter_Registry $adapters ) {
		$this->adapters = $adapters;
	}

	public function read( V3_Block_Accumulator $blocks, array $bindings, array $settings, array $controls, ?string $default_target = null ): void {
		$suffixes = [ '' => Responsive_Key_Resolver::BASE_BREAKPOINT ] + Base_Property_Serializer::RESPONSIVE_SUFFIXES;
		$by_target = [];

		foreach ( $bindings as $binding ) {
			$by_target[ (string) ( $binding['target'] ?? '' ) ][] = $binding;
		}

		foreach ( $by_target as $target => $target_bindings ) {
			$view = null !== $default_target && '' !== $target && $target !== $default_target
				? $blocks->for_target( $target )
				: $blocks;

			foreach ( $suffixes as $suffix => $breakpoint ) {
				foreach ( $this->props_by_state( $target_bindings, $settings, $controls, $suffix ) as $state => $props ) {
					$block_state = Style_Target::DEFAULT_STATE === $state ? null : $state;

					foreach ( Style_Props_To_Css::to_map( $props ) as $property => $value ) {
						$view->push( $breakpoint, $block_state, (string) $property, (string) $value );
					}
				}
			}
		}
	}

	/**
	 * @return array<string, array<string, array<string, mixed>>>
	 */
	private function props_by_state( array $bindings, array $settings, array $controls, string $suffix ): array {
		$props = [];

		foreach ( $bindings as $binding ) {
			$prop_value = $this->read_binding( $binding, $settings, $controls, $suffix );

			if ( null === $prop_value ) {
				continue;
			}

			$prop_value = $this->wrap_part( $binding, $prop_value );
			$existing = $props[ $binding['state'] ][ $binding['prop'] ] ?? null;
			$props[ $binding['state'] ][ $binding['prop'] ] = null === $existing
				? $prop_value
				: $this->merge_prop( $existing, $prop_value );
		}

		return $props;
	}

	private function read_binding( array $binding, array $settings, array $controls, string $suffix ): ?array {
		if ( '' !== $suffix && ! $binding['responsive'] ) {
			return null;
		}

		if ( ! $this->are_dependencies_met( $binding['dependency_values'], $settings, $controls, $suffix ) ) {
			return null;
		}

		$stored = $settings[ $binding['setting'] . $suffix ] ?? null;

		if ( null === $stored ) {
			return null;
		}

		if ( is_array( $binding['value_map'] ?? null ) ) {
			$css_value = V3_Choice_Values::format( $binding['value_map'], $stored );

			return null === $css_value ? null : String_Prop_Type::generate( $css_value );
		}

		$adapter = $this->adapters->find( $binding['read_type'], $binding['control_type'], null !== $binding['sides'] );

		if ( null === $adapter ) {
			return null;
		}

		return $adapter->from_control_value( $stored, $binding['sides'] );
	}

	/**
	 * Elementor does not store settings left at their default, so an unset dependency
	 * falls back to the control default.
	 *
	 * @param array<string, mixed> $dependency_values
	 * @param array<string, mixed> $settings
	 * @param array<string, mixed> $controls
	 */
	private function are_dependencies_met( array $dependency_values, array $settings, array $controls, string $suffix ): bool {
		foreach ( $dependency_values as $setting => $spec ) {
			$expected = is_array( $spec ) && array_key_exists( 'value', $spec ) ? $spec['value'] : $spec;
			$responsive = is_array( $spec ) && ! empty( $spec['responsive'] );
			$key = '' !== $suffix && $responsive ? $setting . $suffix : $setting;
			$current = $settings[ $key ] ?? ( '' === $suffix ? null : ( $settings[ $setting ] ?? null ) );

			if ( null === $current ) {
				$current = $controls[ $setting ]['default'] ?? '';
			}

			if ( (string) $current !== (string) $expected ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * @param array<string, mixed> $binding
	 * @param array<string, mixed> $prop_value
	 * @return array<string, mixed>
	 */
	private function wrap_part( array $binding, array $prop_value ): array {
		$part = $binding['part'] ?? null;

		if ( ! is_string( $part ) || '' === $part || 'flex' !== ( $binding['prop'] ?? null ) ) {
			return $prop_value;
		}

		return Flex_Prop_Type::generate( [ $part => $prop_value ] );
	}

	/**
	 * @param array<string, mixed> $existing
	 * @param array<string, mixed> $addition
	 * @return array<string, mixed>
	 */
	private function merge_prop( array $existing, array $addition ): array {
		if ( Flex_Prop_Type::get_key() === ( $existing['$$type'] ?? null ) && Flex_Prop_Type::get_key() === ( $addition['$$type'] ?? null ) ) {
			return Flex_Prop_Type::generate( array_merge( $existing['value'] ?? [], $addition['value'] ?? [] ) );
		}

		return Dimensions_Prop_Type::generate( array_merge( $existing['value'] ?? [], $addition['value'] ?? [] ) );
	}
}
