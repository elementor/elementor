<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Traits\Shorthanded_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Boolean_Prop_Type extends Plain_Prop_Type {
	use Shorthanded_Prop_Type;

	public static function get_key(): string {
		return 'boolean';
	}

	protected function validate_value( $value ): bool {
		return ! is_bool( $value );
	}
}
