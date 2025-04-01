<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Link_Control_Url_Prop_Type extends Plain_Prop_Type {
	public static function get_key(): string {
		return 'url';
	}

	public static function validate_url( $value ): bool {
		return true;
	}

	protected function validate_value( $value ): bool {
		return self::validate_url( $value );
	}

	protected function sanitize_value( $value ) {
		$url = trim( $value );

		return filter_var( $url, FILTER_SANITIZE_URL );
	}
}
