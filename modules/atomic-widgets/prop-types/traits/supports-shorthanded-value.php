<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Traits;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @mixin Plain_Prop_Type
 */
trait Supports_Shorthanded_Value {
	public function validate( $value ): bool {
		if ( is_null( $value ) ) {
			return ! $this->is_required();
		}

		return (
			$this->validate_value( $value ) ||
			$this->validate_transformable( $value )
		);
	}

	public function default( $value ): self {
		$this->default = $value;

		return $this;
	}
}
