<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

class Style_Definition implements \JsonSerializable {
	private string $id;
	private string $type = 'class';
	private string $label = '';
	private array $variants = [];


	private function __construct( string $id ) {
		$this->id = $id;
	}

	public static function make( string $id ): self {
		return new self( $id );
	}

	public function get_id(): string {
		return $this->id;
	}

	public function set_type( string $type ): self {
		$this->type = $type;
		return $this;
	}

	public function set_label( string $label ): self {
		$this->label = $label;
		return $this;
	}

	public function add_variant( Style_Variant $variant ): self {
		$this->variants[] = $variant->get();
		return $this;
	}


	public function get(): array {
		return [
			'id' => $this->id,
			'type' => $this->type,
			'label' => $this->label,
			'variants' => $this->variants,
		];
	}

	public function jsonSerialize(): array {
		return $this->get();
	}
}
