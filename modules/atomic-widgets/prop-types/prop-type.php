<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Prop_Type implements \JsonSerializable {

	protected $default = null;

	// TODO: Find a real name!
	protected array $settings = [];

	abstract public function get_key(): string;

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

	/**
	 * @return array<string>
	 */
	public function get_dynamic_categories(): array {
		return [];
	}

	public function jsonSerialize(): array {
		return array_merge( [
			'key' => $this->get_key(),
			'dynamic_categories' => $this->get_dynamic_categories(),
			'default' => $this->default,
		], $this->settings );
	}
}
