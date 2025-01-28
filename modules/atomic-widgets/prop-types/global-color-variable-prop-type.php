<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Color_Variable_Prop_Type extends Plain_Prop_Type {
	public static function get_key(): string {
		return 'global-color-variable';
	}

	protected function validate_value( $value ): bool {
		return ! empty( $value );
	}

	protected function sanitize_value( $value ) {
		return $value;
	}
}
