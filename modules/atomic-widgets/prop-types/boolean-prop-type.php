<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Boolean_Prop_Type extends Prop_Type {

	public static function get_key(): string {
		return 'boolean';
	}

	public function validate( $value ): void {
		if ( ! is_bool( $value ) ) {
			throw new \Exception( 'Value must be a boolean, ' . gettype( $value ) . ' given.' );
		}
	}
}
