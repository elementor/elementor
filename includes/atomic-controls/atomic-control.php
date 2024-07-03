<?php

namespace Elementor;

use JsonSerializable;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Atomic_Control implements JsonSerializable {
	private string $bind;
	private string $label = '';
	private string $description = '';
	private string $type;
	private array $props = [];

	public static function bind_to( string $prop_name ): self {
		return new static( $prop_name );
	}

	private function __construct( string $prop_name ) {
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

	public function set_type( string $type ): self {
		$this->type = $type;

		return $this;
	}

	public function set_props( array $props ): self {
		$this->props = $props;

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

	public function get_type(): string {
		return $this->type;
	}

	public function get_props(): array {
		return $this->props;
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
