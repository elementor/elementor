<?php
namespace Elementor\Modules\AtomicWidgets\Controls;

use JsonSerializable;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Section implements JsonSerializable {
	private array $props = [];

	public static function make(): self {
		return new static();
	}

	public function set_label( string $label ): self {
		$this->props['label'] = $label;

		return $this;
	}

	public function set_description( string $description ): self {
		$this->props['description'] = $description;

		return $this;
	}

	public function set_items( array $items ): self {
		$this->props['items'] = $items;

		return $this;
	}

	public function jsonSerialize(): array {
		return [
			'type' => 'section',
			'props' => $this->props,
		];
	}
}
