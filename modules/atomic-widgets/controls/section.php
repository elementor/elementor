<?php
namespace Elementor\Modules\AtomicWidgets\Controls;

use JsonSerializable;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Section implements JsonSerializable {
	private $label = null;
	private $description = null;
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

	public function add_item( $item ): self {
		$this->items[] = $item;

		return $this;
	}

	public function get_items() {
		return $this->items;
	}

	public function jsonSerialize(): array {
		return [
			'type' => 'section',
			'value' => [
				'label' => $this->label,
				'description' => $this->description,
				'items' => $this->items,
			],
		];
	}
}
