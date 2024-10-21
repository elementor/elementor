<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Concerns;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @mixin Prop_Type
 * @mixin Has_Settings
 */
trait Has_Required_Validation {
	protected function validate_required( $value ) {
		if ( is_null( $value ) ) {
			return ! $this->get_setting( 'required', false );
		}

		return true;
	}

	public function required() {
		$this->setting( 'required', true );

		return $this;
	}

	public function optional() {
		$this->setting( 'required', false );

		return $this;
	}
}
