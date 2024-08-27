<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\DynamicTags\Module as DynamicTags;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Number_Type extends Prop_Type {

	public function get_type(): string {
		return 'number';
	}

	public function validate( $value ): void {
		if ( ! is_numeric( $value ) ) {
			throw new \Exception( 'Value must be a number, ' . gettype( $value ) . ' given.' );
		}
	}

	/**
	 * @return array<string>
	 */
	public function get_dynamic_categories(): array {
		return [
			DynamicTags::NUMBER_CATEGORY,
		];
	}
}
