<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Concerns;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Transformable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @mixin Transformable_Prop_Type
 */
trait Has_Default {
	protected $default = null;

	public static function generate( $value ) {
		return [
			'$$type' => static::get_key(),
			'value' => $value,
		];
	}

	/**
	 * @param $value
	 *
	 * @return $this
	 */
	public function default( $value ) {
		$this->default = $this::generate( $value );

		return $this;
	}

	public function get_default() {
		return $this->default;
	}
}
