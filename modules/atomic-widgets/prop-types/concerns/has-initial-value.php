<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Concerns;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
// dont forget to create a poll for this task  Has_Required_Setting
// is it relevant to validate the initial_value
trait Has_Initial_Value {
	protected array | null $initial_value = null;

	/**
	 * @param $value
	 *
	 * @return $this
	 */
	public function initial_value( $value ): self {
		$this->initial_value = static::generate( $value );

		return $this;
	}
// 	public function get_default(): ?array {
	public function get_initial_value(): ?array {
		return $this->initial_value;
	}

	abstract public static function generate( $value, $disable = false ): array;
}
