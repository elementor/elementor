<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Transformable_Type extends Prop_Type {

	public function validate( $value ): void {
		if ( ! $this->is_transformable_of_type( $this->get_type(), $value ) ) {
			throw new \Exception( "Value must be a transformable of type `{$this->get_type()}`." );
		}

		$this->validate_value( $value['value'] );
	}

	abstract protected function validate_value( $value ): void;

	private function is_transformable_of_type( string $type, $value ): bool {
		return (
			isset( $value['$$type'], $value['value'] ) &&
			is_string( $value['$$type'] ) &&
			$value['$$type'] === $type
		);
	}
}
