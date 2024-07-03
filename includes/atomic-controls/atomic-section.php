<?php

namespace Elementor;

use JsonSerializable;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Atomic_Section implements JsonSerializable {
	private string $label = '';
	private string $description = '';
	private array $items = [];

	public static function make(): self {
		return new static();
	}

	public function set_label( string $label ): self {
		$this->label = $label;

		return $this;
	}

	public function set_description( string $description ): self {
		$this->description = $description;

		return $this;
	}

	public function set_items( array $items ): self {
		$this->items = $items;

		return $this;
	}

	public function get_label(): string {
		return $this->label;
	}

	public function get_description(): string {
		return $this->description;
	}

	public function get_items(): array {
		return $this->items;
	}

	public function jsonSerialize(): array {
		return [
			'type' => 'section',
			'value' => [
				'label' => $this->get_label(),
				'description' => $this->get_description(),
				'items' => $this->get_items(),
			],
		];
	}
}
