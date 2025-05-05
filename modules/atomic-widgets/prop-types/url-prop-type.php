<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Url_Prop_Type extends Plain_Prop_Type {
	public static function get_key(): string {
		return 'url';
	}

	protected function validate_value( $value ): bool {
		return (bool) wp_http_validate_url( $value );
	}

	protected function sanitize_value( $value ) {
		return esc_url_raw( $value );
	}
}
