<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Concerns;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Persistable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @mixin Persistable_Prop_Type
 */
trait Has_Default {
	protected $default = null;

	public function default( $value ): self {
		$this->default = [
			'$$type' => static::get_key(),
			'value' => $value,
		];

		return $this;
	}

	public function get_default() {
		return $this->default;
	}
}
