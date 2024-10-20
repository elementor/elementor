<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Concerns;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Transformable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @mixin Transformable_Prop_Type
 */
trait Has_Transformable_Validation {
	protected function is_transformable( $value ): bool {
		return (
			isset( $value['$$type'] ) &&
			static::get_key() === $value['$$type'] &&
			isset( $value['value'] ) &&
			( ! isset( $value['disabled'] ) || is_bool( $value['disabled'] ) )
		);
	}
}
