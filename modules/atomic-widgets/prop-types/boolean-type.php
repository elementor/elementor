<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Boolean_Type extends Prop_Type {

	public function get_type(): string {
		return 'boolean';
	}

	public function validate( $value ): void {
		if ( ! is_bool( $value ) ) {
			throw new \Exception( 'Value must be a boolean, ' . gettype( $value ) . ' given.' );
		}
	}
}
