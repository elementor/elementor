<?php

namespace Elementor\Modules\Components;

use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Components {
	private Collection $items;

	public static function make( array $components = [] ) {
		return new static( $components );
	}

	private function __construct( array $components = [] ) {
		$this->items = Collection::make( $components );
	}

	public function get_items() {
		return $this->items;
	}

	public function get() {
		return [
			'items' => $this->get_items()->all(),
		];
	}

	public function to_array() {
		return $this->get_items()->all();
	}
} 