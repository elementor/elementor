<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters;

use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Dimensions_Sides_Slider_Adapter implements V3_Control_Adapter {

	const CONTROL_TYPE = 'slider';

	public function supports( string $prop_type, string $control_type, bool $has_sides ): bool {
		return in_array( $prop_type, [ Dimensions_Prop_Type::get_key(), Size_Prop_Type::get_key() ], true )
			&& self::CONTROL_TYPE === $control_type
			&& $has_sides;
	}

	public function to_control_value( array $prop_value, ?array $sides, array $control ) {
		$size = $this->shared_size( $prop_value, $sides ?? [] );

		return null !== $size && Size_Values::is_unit_allowed( $size, $control ) ? $size : null;
	}

	public function from_control_value( $control_value, ?array $sides ): ?array {
		$size = Size_Values::to_prop( $control_value );

		if ( null === $size || empty( $sides ) ) {
			return null;
		}

		return Dimensions_Prop_Type::generate( array_fill_keys( $sides, $size ) );
	}

	/**
	 * @return array{unit: string, size: mixed}|null
	 */
	private function shared_size( array $prop_value, array $sides ): ?array {
		$single = Size_Values::from_prop( $prop_value );

		if ( null !== $single ) {
			return $single;
		}

		if ( empty( $sides ) || Dimensions_Prop_Type::get_key() !== ( $prop_value['$$type'] ?? null ) ) {
			return null;
		}

		$sizes = [];

		foreach ( $sides as $side ) {
			$size = Size_Values::from_prop( $prop_value['value'][ $side ] ?? null );

			if ( null === $size ) {
				return null;
			}

			$sizes[] = $size;
		}

		return Size_Values::are_equal( $sizes ) ? $sizes[0] : null;
	}
}
