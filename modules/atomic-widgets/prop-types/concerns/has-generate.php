<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Concerns;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Transformable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @mixin Transformable_Prop_Type
 */
trait Has_Generate {
	public static function generate( $value ) {
		return [
			'$$type' => static::get_key(),
			'value' => $value,
		];
	}
}
