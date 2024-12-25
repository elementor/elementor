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

		if ( ! $this->is_transformable( $value ) ) {
			return $this->validate_value( $value );
		}

		return $this->validate_value( $value['value'] );
	}

	public function sanitize( $value ) {
		if ( $this->is_transformable( $value ) ) {
			$value['value'] = $this->sanitize_value( $value['value'] );

			return $value;
		}

		return $this->sanitize_value( $value );
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
