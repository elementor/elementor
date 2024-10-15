<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Concerns;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Persistable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @mixin Persistable_Prop_Type
 */
trait Has_Transformable_Validation {
	protected function validate_transformable( $value ): bool {
		return (
			isset( $value['$$type'] ) &&
			static::get_key() === $value['$$type'] &&
			isset( $value['value'] ) &&
			( ! isset( $value['disabled'] ) || is_bool( $value['disabled'] ) ) &&
			$this->validate_value( $value['value'] )
		);
	}

	abstract protected function validate_value( $value ): bool;
}
