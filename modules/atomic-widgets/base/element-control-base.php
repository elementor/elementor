<?php

namespace Elementor\Modules\AtomicWidgets\Base;

use JsonSerializable;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Element_Control_Base implements JsonSerializable {
	private $label = null;
	private $meta = null;
	private $child_elements = [];

	abstract public function get_type(): string;

	abstract public function get_props(): array;

	public static function make(): self {
		return new static();
	}

	public function set_label( string $label ): self {
		$this->label = $label;

		return $this;
	}

	public function get_label(): string {
		return $this->label;
	}

	public function set_meta( $meta ): self {
		$this->meta = $meta;

		return $this;
	}

	public function get_meta(): array {
		return $this->meta;
	}
	
	public function set_child_element( string $element_type, string $target_container_selector ): self {
		$this->child_elements[] = [
			'type' => $element_type,
			'target_container_selector' => $target_container_selector,
		];

		return $this;
	}

	public function get_child_elements(): array {
		return $this->child_elements;
	}

	public function jsonSerialize(): array {
		return [
			'type' => 'element',
			'value' => [
				'label' => $this->get_label(),
				'meta' => $this->get_meta(),
				'type' => $this->get_type(),
				'props' => $this->get_props(),
				'childElements' => $this->get_child_elements(),
			],
		];
	}
}
