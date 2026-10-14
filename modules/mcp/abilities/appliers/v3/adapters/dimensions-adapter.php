<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters;

use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Dimensions_Adapter implements V3_Control_Adapter {

	const CONTROL_TYPE = 'dimensions';

	const LOGICAL_TO_PHYSICAL_SIDES = [
		'block-start' => 'top',
		'inline-end' => 'right',
		'block-end' => 'bottom',
		'inline-start' => 'left',
	];

	public function supports( string $prop_type, string $control_type, bool $has_sides ): bool {
		return in_array( $prop_type, [ Dimensions_Prop_Type::get_key(), Size_Prop_Type::get_key() ], true )
			&& self::CONTROL_TYPE === $control_type
			&& ! $has_sides;
	}

	public function to_control_value( array $prop_value, ?array $sides, array $control ) {
		$sizes = $this->sizes_by_physical_side( $prop_value );

		if ( null === $sizes || ! Size_Values::is_unit_allowed( reset( $sizes ), $control ) ) {
			return null;
		}

		$stored = array_map( fn( array $size ) => (string) $size['size'], $sizes );
		$stored['unit'] = reset( $sizes )['unit'];
		$stored['isLinked'] = Size_Values::are_equal( $sizes );

		return $stored;
	}

	public function from_control_value( $control_value, ?array $sides ): ?array {
		if ( ! is_array( $control_value ) ) {
			return null;
		}

		$value = [];

		foreach ( self::LOGICAL_TO_PHYSICAL_SIDES as $logical => $physical ) {
			$size = Size_Values::to_prop( [
				'size' => $control_value[ $physical ] ?? null,
				'unit' => $control_value['unit'] ?? null,
			] );

			if ( null === $size ) {
				return null;
			}

			$value[ $logical ] = $size;
		}

		return Dimensions_Prop_Type::generate( $value );
	}

	/**
	 * @return array<string, array{unit: string, size: mixed}>|null
	 */
	private function sizes_by_physical_side( array $prop_value ): ?array {
		$single = Size_Values::from_prop( $prop_value );

		if ( null !== $single ) {
			return array_fill_keys( array_values( self::LOGICAL_TO_PHYSICAL_SIDES ), $single );
		}

		if ( Dimensions_Prop_Type::get_key() !== ( $prop_value['$$type'] ?? null ) ) {
			return null;
		}

		$sizes = [];

		foreach ( self::LOGICAL_TO_PHYSICAL_SIDES as $logical => $physical ) {
			$size = Size_Values::from_prop( $prop_value['value'][ $logical ] ?? null );

			if ( null === $size ) {
				return null;
			}

			$sizes[ $physical ] = $size;
		}

		return $this->have_same_unit( $sizes ) ? $sizes : null;
	}

	/**
	 * @param array<string, array{unit: string, size: mixed}> $sizes
	 */
	private function have_same_unit( array $sizes ): bool {
		return 1 === count( array_unique( array_column( $sizes, 'unit' ) ) );
	}
}
