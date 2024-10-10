<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Utils;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Primitive_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @mixin Primitive_Prop_Type
 */
trait Primitive_Shortcut {
	public function validate( $value ): bool {
		return $this->validate_value( $value ) || parent::validate( $value );
	}

	public function default( $default ): self {
		$this->default = $default;

		return $this;
	}

	public function generate_value( $value ) {
		return $value;
	}
}
