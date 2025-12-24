<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Migration_Context {
	private array $element_data = [];
	private ?string $current_path = null;
	private $current_value = null;
	private array $wildcard_values = [];

	private function __construct() {}

	public static function make(): self {
		return new self();
	}

	public function set_element_data( array $data ): self {
		$clone = clone $this;
		$clone->element_data = $data;

		return $clone;
	}

	public function get_element_data(): array {
		return $this->element_data;
	}

	public function set_current_path( ?string $path ): self {
		$clone = clone $this;
		$clone->current_path = $path;

		return $clone;
	}

	public function get_current_path(): ?string {
		return $this->current_path;
	}

	public function set_current_value( $value ): self {
		$clone = clone $this;
		$clone->current_value = $value;

		return $clone;
	}

	public function get_current_value() {
		return $this->current_value;
	}

	public function set_wildcard_values( array $wildcard_values ): self {
		$clone = clone $this;
		$clone->wildcard_values = $wildcard_values;

		return $clone;
	}

	public function get_wildcard_values(): array {
		return $this->wildcard_values;
	}
}
