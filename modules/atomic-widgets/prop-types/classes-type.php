<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Classes_Type extends Transformable_Type {

	public function get_type(): string {
		return 'classes';
	}

	public function validate_value( $value ): void {
		if ( ! is_array( $value ) ) {
			throw new \Exception( 'Value must be an array, ' . gettype( $value ) . ' given.' );
		}

		if ( ! $this->all_are_valid_classes( $value ) ) {
			throw new \Exception( 'All classes must start with an english letter, and contain only english letters, numbers, hyphens, and underscores.' );
		}
	}

	private function all_are_valid_classes( array $values ) {
		return array_reduce( $values, function ( $carry, $item ) {
			return $carry && is_string( $item ) && preg_match( '/^[a-z][a-z-_0-9]*$/i', $item );
		}, true );
	}
}
