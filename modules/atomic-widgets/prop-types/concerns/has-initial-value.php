<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Concerns;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

trait Has_Initial_Value {
	protected $initial_value = null;

	/**
	 * @param $value
	 *
	 * @return $this
	 */
	public function initial_value( $value ): self {
		$this->initial_value = static::generate( $value );

		return $this;
	}

	public function get_initial_value(): ?array {
		return $this->initial_value;
	}

	abstract public static function generate( $value, $disable = false ): array;
}
