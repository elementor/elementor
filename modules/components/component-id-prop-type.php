<?php

namespace Elementor\Modules\Components;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_Id_Prop_Type extends Plain_Prop_Type {
	public static function get_key(): string {
		return 'component-id';
	}

	protected function validate_value( $value ): bool {
		return is_numeric( $value );
	}

	protected function sanitize_value( $value ) {
		return (int) $value;
	}
}
