<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Transformable_Type extends Prop_Type {

	public function validate( $value ): void {
		if ( ! isset( $value['$$type'] ) ) {
			throw new \Exception( 'Value must have a `$$type` key.' );
		}

		if ( ! is_string( $value['$$type'] ) ) {
			throw new \Exception( 'Key `$$type` must be a string, ' . gettype( $value['$$type'] ) . ' given.' );
		}

		if ( $value['$$type'] !== $this->get_type() ) {
			throw new \Exception( '`$$type` must be `' . $this->get_type() . '`, `' . $value['$$type'] . '` given.' );
		}

		if ( ! isset( $value['value'] ) ) {
			throw new \Exception( 'Value must have a `value` key.' );
		}

		$this->validate_value( $value['value'] );
	}

	abstract protected function validate_value( $value ): void;
}
