<?php

namespace Elementor\Modules\Sdk\V4\Builder\Elements;

use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;

class Styles_Builder {


	private array $schema = [];
	private array $props = [];

	public function __construct( array $schema ) {
		$style = $schema['style'] ?? [];
		$this->schema = $style;
	}

	public function build() {
		foreach ( $this->schema as $key => $value ) {
			$this->build_style( $key, $value );
		}
		return $this->props;
	}

	protected function build_style( $key, $value ) {
		switch ( $key ) {
			case 'color':
				$this->props[] = [ $value, Color_Prop_Type::generate( $value ) ];
		}
	}
}
