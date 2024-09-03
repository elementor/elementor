<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Prop_Type implements \JsonSerializable {

	protected $default = null;

	protected array $settings = [];

	abstract public static function get_key(): string;

	abstract public function validate( $value ): void;

	/**
	 * @return $this
	 */
	public static function make(): self {
		return new static();
	}

	public function default( $default ): self {
		$this->default = $default;

		return $this;
	}

	public function get_default() {
		return $this->default;
	}

	public function jsonSerialize(): array {
		return [
			'type' => static::get_key(),
			'default' => $this->default,
			'settings' => (object) $this->settings,
		];
	}
}
