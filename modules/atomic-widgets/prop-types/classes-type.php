<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\DynamicTags\Module as DynamicTags;

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

		if ( ! $this->all_are_strings( $value ) ) {
			throw new \Exception( 'All classes must be strings.' );
		}
	}

	private function all_are_strings( array $values ) {
		return array_reduce( $values, function ( $carry, $item ) {
			return $carry && is_string( $item );
		}, true );
	}

	public function get_dynamic_categories(): array {
		return [
			DynamicTags::IMAGE_CATEGORY,
		];
	}
}
