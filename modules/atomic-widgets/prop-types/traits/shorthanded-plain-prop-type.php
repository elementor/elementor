<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Traits;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @mixin Plain_Prop_Type
 */
trait Shorthanded_Plain_Prop_Type {
	protected function validate_self( $value ): bool {
		return $this->validate_value( $value ) || parent::validate_self( $value );
	}

	public function generate_value( $value ) {
		return $value;
	}
}
