<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Array_Prop_Type extends Transformable_Prop_Type {
	public static function get_key(): string {
		return 'array';
	}

	public function delimiter( string $delimiter ): self {
		$this->settings['delimiter'] = $delimiter;

		return $this;
	}

	public function validate_value( $value ): void {
		if ( ! is_array( $value ) ) {
			throw new \Exception( 'Value must be an array, ' . gettype( $value ) . ' given.' );
		}
	}
}
