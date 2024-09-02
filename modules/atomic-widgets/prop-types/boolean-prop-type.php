<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Boolean_Prop_Type extends Prop_Type {

	public static function get_key(): string {
		return 'boolean';
	}

	public function validate( $value ): void {
		if ( ! is_bool( $value ) ) {
			Utils::safe_throw( 'Value must be a boolean, ' . gettype( $value ) . ' given.' );
		}
	}
}
