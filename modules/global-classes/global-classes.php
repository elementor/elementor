<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\Global_Classes\Usage\Applied_Global_Classes_Usage;


class Global_Classes {
	private Collection $items;
	private Collection $order;

	private function __construct( array $data = array(), array $order = array() ) {
		$this->items = Collection::make( $data );
		$this->order = Collection::make( $order );
	}

	public static function make( array $items = array(), array $order = array() ) {
		return new static( $items, $order );
	}

	public function get() {
		return array(
			'items' => $this->get_items()->all(),
			'order' => $this->get_order()->all(),
		);
	}

	public function get_items() {
		return $this->items;
	}

	public function get_order() {
		return $this->order;
	}

}
