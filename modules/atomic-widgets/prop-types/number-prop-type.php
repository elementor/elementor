<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Number_Prop_Type extends Prop_Type {

	public static function get_key(): string {
		return 'number';
	}

	public function validate( $value ): void {
		if ( ! is_numeric( $value ) ) {
			throw new \Exception( 'Value must be a number, ' . gettype( $value ) . ' given.' );
		}
	}
}
