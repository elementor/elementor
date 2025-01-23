<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

class Default_Style implements \JsonSerializable {
	private string $key;
	private array $variants;
	private Style_Definition $style_definition;


	private function __construct( string $key ) {
		$this->key = $key;
	}

	public static function key( string $key ): Default_Style {
		return new self( $key );
	}

	public function add_variant( Style_Variant $variant ) {
		$this->variants[] = $variant;
		return $this;
	}

	public function build( string $name ) {
		$id = $name . '-' . $this->key;

		$this->style_definition = Style_Definition::make( $id )
			->set_label( $name );

		foreach ( $this->variants as $variant ) {
			$this->style_definition->add_variant( $variant );
		}

		return $this->style_definition;
	}

	public function get(): array {
		return $this->style_definition->get();
	}

	public function get_key() {
		return $this->key;
	}

	public function jsonSerialize(): array {
		return $this->get();
	}

}
