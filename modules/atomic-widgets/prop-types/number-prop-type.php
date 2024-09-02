<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\DynamicTags\Module as DynamicTags;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Number_Prop_Type extends Prop_Type {

	public static function get_key(): string {
		return 'number';
	}

	public function validate( $value ): void {
		if ( ! is_numeric( $value ) ) {
			Utils::safe_throw( 'Value must be a number, ' . gettype( $value ) . ' given.' );
		}
	}
}