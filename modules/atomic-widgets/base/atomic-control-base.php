<?php

namespace Elementor\Modules\AtomicWidgets\Base;

use JsonSerializable;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Atomic_Control_Base implements JsonSerializable {
	private string $bind;
	private $label = null;
	private $description = null;
	private $meta = null;
	private $top_divider = false;

	abstract public function get_type(): string;

	abstract public function get_props(): array;

	public static function bind_to( string $prop_name ) {
		return new static( $prop_name );
	}

	protected function __construct( string $prop_name ) {
		$this->bind = $prop_name;
	}

	public function get_bind() {
		return $this->bind;
	}

	public function set_label( string $label, bool $is_stack = true ): self {
		$this->label = $label;

		return $this;
	}

	public function set_description( string $description ): self {
		$this->description = $description;

		return $this;
	}

	public function set_meta( $meta ): self {
		$this->meta = $meta;

		return $this;
	}

	public function add_top_divider(): self {
		$this->top_divider = true;

		return $this;
	}

	public function jsonSerialize(): array {
		return [
			'type' => 'control',
			'value' => [
				'type' => $this->get_type(),
				'bind' => $this->get_bind(),
				'label' => $this->label,
				'description' => $this->description,
				'props' => $this->get_props(),
				'meta' => $this->meta,
				'topDivider' => $this->top_divider,
			],
		];
	}
}
