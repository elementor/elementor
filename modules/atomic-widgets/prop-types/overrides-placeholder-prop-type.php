<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Overrides_Placeholder_Prop_Type extends Plain_Prop_Type {
	public static function get_key(): string {
		return 'overrides-placeholder';
	}

	protected function validate_value( $value ): bool {
		return true;
	}

	protected function sanitize_value( $value ) {
		return $value;
	}
}
