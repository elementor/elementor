<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Primitives;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Boolean_Prop_Type extends Plain_Prop_Type {
	use Supports_Shorthanded_Value;

	public static function get_key(): string {
		return 'boolean';
	}

	protected function validate_value( $value ): bool {
		return is_bool( $value );
	}
}
