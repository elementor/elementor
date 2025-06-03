<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Size_Prop_Type extends Object_Prop_Type {
	const SUPPORTED_UNITS = [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax', 'auto', 'custom' ];

	public static function get_key(): string {
		return 'size';
	}

	protected function validate_value( $value ): bool {
		return (
			is_array( $value ) &&
			array_key_exists( 'size', $value ) &&
			! empty( $value['unit'] ) &&
			in_array( $value['unit'], static::SUPPORTED_UNITS, true ) &&
			( $this->validate_numeric_size( $value ) || $this->validate_string_size( $value ) )
		);
	}

	public function sanitize_value( $value ) {
		return [
			// The + operator cast the $value['size'] to numeric (either int or float - depends on the value)
			'size' => +$value['size'],
			'unit' => sanitize_text_field( $value['unit'] ),
		];
	}

	protected function define_shape(): array {
		return [
			'size' => String_Prop_Type::make()->enum( self::SUPPORTED_UNITS )
				->required(),
			'unit' => Union_Prop_Type::make()
				->add_prop_type( String_Prop_Type::make() )
				->add_prop_type( Number_Prop_Type::make() ),
		];
	}

	private function validate_string_size( $value ): bool {
		return ( 'custom' === $value['unit'] && null !== $value['size'] ) ||
			( 'auto' === $value['unit'] && empty( $value['size'] ) );
	}

	private function validate_numeric_size( $value ): bool {
		return ( ! in_array( $value['unit'], [ 'auto', 'custom' ], true ) && ( ! empty( $value['size'] ) || 0 === $value['size'] ) && is_numeric( $value['size'] ) );
	}
}
