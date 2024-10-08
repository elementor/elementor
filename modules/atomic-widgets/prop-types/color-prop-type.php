<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Color_Prop_Type extends Transformable_Prop_Type {
	public function __construct() {
		$this->internal_types['color'] = String_Prop_Type::make();
	}

	public static function get_key(): string {
		return 'color';
	}

	protected function validate_value( $value ): void {
		if ( ! is_array( $value ) ) {
			throw new \Exception( 'Value must be an array, ' . gettype( $value ) . ' given.' );
		}

		$this->internal_types['color']->validate_with_additional( $value['color'] );
	}
}
