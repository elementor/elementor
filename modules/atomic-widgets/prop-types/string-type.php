<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\DynamicTags\Module as DynamicTags;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class String_Type extends Prop_Type {

	public function get_type(): string {
		return 'string';
	}

	public function validate( $value ): void {
		if ( ! is_string( $value ) ) {
			throw new \Exception( 'Value must be a string, ' . gettype( $value ) . ' given.' );
		}
	}

	/**
	 * @return array<string>
	 */
	public function get_dynamic_categories(): array {
		return [
			DynamicTags::TEXT_CATEGORY,
		];
	}
}
