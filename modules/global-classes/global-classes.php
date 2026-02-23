<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Utils\Collection;

class Global_Classes {
	private Collection $items;
	private Collection $order;
	private Collection $ordered_items;

	public static function make( array $items = [], array $order = [] ) {
		return new static( $items, $order );
	}

	private function __construct( array $data = [], array $order = [] ) {
		$this->items = Collection::make( $data );
		$this->order = Collection::make( $order );
		$this->ordered_items = $this->items->map( function( $item ) {
			return $item;
		});
	}

	public function get_items() {
		return $this->items;
	}

	public function get_order() {
		return $this->order;
	}

	public function get_ordered_items() {
		return $this->ordered_items;
	}

	public function get() {
		return [
			'items' => $this->get_items()->all(),
			'order' => $this->get_order()->all(),
		];
	}
}
