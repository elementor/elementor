<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Corners_Prop_Type extends Transformable_Prop_Type {
	public function __construct() {
		$this->internal_types['dimension'] = Size_Prop_Type::make();
	}

	public static function get_key(): string {
		return 'corners';
	}

	public function validate_value( $value ): void {
		if ( ! is_array( $value ) ) {
			throw new \Exception( 'Value must be an array, ' . gettype( $value ) . ' given.' );
		}

		$dimensions = [ 'topLeft', 'topRight', 'bottomRight', 'bottomLeft' ];

		foreach ( $dimensions as $dimension ) {
			if ( ! isset( $value[ $dimension ] ) ) {
				continue;
			}

			$this->internal_types['dimension']->validate_with_additional( $value[ $dimension ] );
		}

	}
}
