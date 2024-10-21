<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Primitives;

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

		if ( $this->validate_value( $value ) ) {
			return true;
		}

		return (
			$this->is_transformable( $value ) &&
			$this->validate_value( $value['value'] )
		);
	}

	/**
	 * @param $value
	 *
	 * @return $this
	 */
	public function default( $value ) {
		$this->default = $value;

		return $this;
	}
}
