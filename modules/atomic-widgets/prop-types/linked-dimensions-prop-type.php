<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Linked_Dimensions_Prop_Type extends Transformable_Prop_Type {
	public static function get_key(): string {
		return 'linked-dimensions';
	}

	public function validate_value( $value ): void {
		throw new \Exception( 'Linked dimensions prop type is not meant to be used for validation.' );
		if ( ! is_array( $value ) ) {
			throw new \Exception( 'Value must be an array, ' . gettype( $value ) . ' given.' );
		}
	}
}
