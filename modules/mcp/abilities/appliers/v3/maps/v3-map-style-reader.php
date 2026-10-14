<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Props_To_Css;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\V3_Control_Adapter_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Responsive_Key_Resolver;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\Serializers\Base_Property_Serializer;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\V3_Block_Accumulator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Map_Style_Reader {

	private V3_Control_Adapter_Registry $adapters;

	public function __construct( V3_Control_Adapter_Registry $adapters ) {
		$this->adapters = $adapters;
	}

	public function read( V3_Block_Accumulator $blocks, array $bindings, array $settings, array $controls ): void {
		$suffixes = [ '' => Responsive_Key_Resolver::BASE_BREAKPOINT ] + Base_Property_Serializer::RESPONSIVE_SUFFIXES;

		foreach ( $suffixes as $suffix => $breakpoint ) {
			foreach ( $this->props_by_state( $bindings, $settings, $controls, $suffix ) as $state => $props ) {
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
	private function props_by_state( array $bindings, array $settings, array $controls, string $suffix ): array {
		$props = [];

		foreach ( $bindings as $binding ) {
			$prop_value = $this->read_binding( $binding, $settings, $controls, $suffix );

			if ( null === $prop_value ) {
				continue;
			}

			$existing = $props[ $binding['state'] ][ $binding['prop'] ] ?? null;
			$props[ $binding['state'] ][ $binding['prop'] ] = null === $existing
				? $prop_value
				: $this->merge_sides( $existing, $prop_value );
		}

		return $props;
	}

	private function read_binding( array $binding, array $settings, array $controls, string $suffix ): ?array {
		if ( '' !== $suffix && ! $binding['responsive'] ) {
			return null;
		}

		if ( ! $this->are_dependencies_met( $binding['dependency_values'], $settings, $controls ) ) {
			return null;
		}

		$stored = $settings[ $binding['setting'] . $suffix ] ?? null;
		$adapter = $this->adapters->find( $binding['read_type'], $binding['control_type'], null !== $binding['sides'] );

		if ( null === $stored || null === $adapter ) {
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
