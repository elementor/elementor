<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
const LENGTH_UNITS = [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax' ];
const ANGLE_UNITS = [ 'deg', 'rad', 'grad', 'turn' ];
const TIME_UNITS = [ 's', 'ms' ];
const EXTENDED_UNITS = [ 'auto', 'custom' ];

class Size_Prop_Type extends Object_Prop_Type {

	public static function get_supported_units(): array {
		return array_merge( LENGTH_UNITS, ANGLE_UNITS, TIME_UNITS, EXTENDED_UNITS );
	}

	public static function get_key(): string {
		return 'size';
	}

	protected function validate_value( $value ): bool {
		if ( ! is_array( $value ) ||
			! array_key_exists( 'size', $value ) ||
			! array_key_exists( 'unit', $value ) ||
			empty( $value['unit'] ) ||
			! in_array( $value['unit'], static::get_supported_units(), true )
		) {
			return false;
		}

		switch ( $value['unit'] ) {
			case 'custom':
				return null !== $value['size'];
			case 'auto':
				return ! $value['size'];
			default:
				return (
					! in_array( $value['unit'], [ 'auto', 'custom' ], true ) &&
					( ! empty( $value['size'] ) || 0 === $value['size'] ) &&
					is_numeric( $value['size'] )
				);
		}
	}

	public function sanitize_value( $value ) {
		$unit = sanitize_text_field( $value['unit'] );

		if ( ! in_array( $value['unit'], [ 'auto', 'custom' ] ) ) {
			return [
				// The + operator cast the $value['size'] to numeric (either int or float - depends on the value)
				'size' => +$value['size'],
				'unit' => $unit,
			];
		}

		return [
			'size' => 'auto' === $value['unit'] ? '' : sanitize_text_field( $value['size'] ),
			'unit' => $unit,
		];
	}

	protected function define_shape(): array {
		return [
			'unit' => String_Prop_Type::make()->enum( static::get_supported_units() )
				->required(),
			'size' => Union_Prop_Type::make()
				->add_prop_type( String_Prop_Type::make() )
				->add_prop_type( Number_Prop_Type::make() ),
		];
	}
}
