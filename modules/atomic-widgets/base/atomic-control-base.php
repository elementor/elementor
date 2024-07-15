<?php

namespace Elementor\Modules\AtomicWidgets\Base;

use JsonSerializable;

abstract class Atomic_Control_Base implements JsonSerializable {
	private string $bind;
	private string $label = '';
	private string $description = '';

	abstract public function get_type(): string;

	abstract public function get_props(): array;

	public static function bind_to( string $prop_name ) {
		return new static( $prop_name );
	}

	protected function __construct( string $prop_name ) {
		$this->bind = $prop_name;
	}

	public function set_label( string $label ): self {
		$this->label = $label;

		return $this;
	}

	public function set_description( string $description ): self {
		$this->description = $description;

		return $this;
	}

	public function get_bind(): string {
		return $this->bind;
	}

	public function get_label(): string {
		return $this->label;
	}

	public function get_description(): string {
		return $this->description;
	}

	public function jsonSerialize(): array {
		return [
			'type' => 'control',
			'value' => [
				'bind' => $this->get_bind(),
				'label' => $this->get_label(),
				'description' => $this->get_description(),
				'type' => $this->get_type(),
				'props' => $this->get_props(),
			],
		];
	}
}
