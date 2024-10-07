<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Linked_Dimensions_Prop_Type extends Transformable_Prop_Type {
	public function __construct() {
		$this->internal_types['top'] = Size_Prop_Type::make();
		$this->internal_types['right'] = Size_Prop_Type::make();
		$this->internal_types['bottom'] = Size_Prop_Type::make();
		$this->internal_types['left'] = Size_Prop_Type::make();
	}

	public static function get_key(): string {
		return 'linked-dimensions';
	}

	public function validate_value( $value ): void {
		if ( isset( $value['top'] ) ) {
			$this->internal_types['top']->validate( $value['top'] );
		}

		if ( isset( $value['right'] ) ) {
			$this->internal_types['right']->validate( $value['right'] );
		}

		if ( isset( $value['bottom'] ) ) {
			$this->internal_types['bottom']->validate( $value['bottom'] );
		}

		if ( isset( $value['left'] ) ) {
			$this->internal_types['left']->validate( $value['left'] );
		}

		if ( ! is_array( $value ) ) {
			throw new \Exception( 'Value must be an array, ' . gettype( $value ) . ' given.' );
		}
	}
}
