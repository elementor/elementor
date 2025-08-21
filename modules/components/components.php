<?php

namespace Elementor\Modules\Components;

use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Components {
	private Collection $components;
	private Collection $styles;

	public static function make( array $components = [], array $styles = [] ) {
		return new static( $components, $styles );
	}

	private function __construct( array $components = [], array $styles = [] ) {
		$this->components = Collection::make( $components );
		$this->styles = Collection::make( $styles );
	}

	public function get_components() {
		return $this->components;
	}

	public function get_styles() {
		return $this->styles;
	}
}
