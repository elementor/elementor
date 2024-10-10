<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Primitive_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Url_Prop_Type extends Primitive_Prop_Type {
	public static function get_key(): string {
		return 'url';
	}

	protected function validate_value( $value ): bool {
		return is_string( $value ) && wp_http_validate_url( $value );
	}
}
