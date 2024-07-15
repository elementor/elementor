<?php
namespace Elementor\Modules\AtomicWidgets\AtomicControls;

use JsonSerializable;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Atomic_Section implements JsonSerializable {
	private array $value = [];

	public static function make(): self {
		return new static();
	}

	public function set_label( string $label ): self {
		$this->value['label'] = $label;

		return $this;
	}

	public function set_description( string $description ): self {
		$this->value['description'] = $description;

		return $this;
	}

	public function set_items( array $items ): self {
		$this->value['items'] = $items;

		return $this;
	}

	public function get_label(): string {
		return $this->value['label'];
	}

	public function get_description(): string {
		return $this->value['description'];
	}

	public function get_items(): array {
		return $this->value['items'];
	}

	public function jsonSerialize(): array {
		return [
			'type' => 'section',
			'value' => $this->value,
		];
	}
}
