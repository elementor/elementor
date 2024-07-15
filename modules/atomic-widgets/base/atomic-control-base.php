<?php

namespace Elementor\Modules\AtomicWidgets\Base;

use JsonSerializable;

abstract class Atomic_Control_Base implements JsonSerializable {
	private array $value = [];

	abstract public function get_type(): string;

	abstract public function get_props(): array;

	public static function bind_to( string $prop_name ) {
		return new static( $prop_name );
	}

	protected function __construct( string $prop_name ) {
		$this->value['bind'] = $prop_name;
	}

	public function set_label( string $label ): self {
		$this->value['label'] = $label;

		return $this;
	}

	public function set_description( string $description ): self {
		$this->value['description'] = $description;

		return $this;
	}

	public function jsonSerialize(): array {
		return [
			'type' => 'control',
			'value' => $this->value,
		];
	}
}
