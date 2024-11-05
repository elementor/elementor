<?php

namespace Elementor\Modules\EditorGlobalClasses;

use Elementor\Core\Utils\Collection;

class Global_Classes implements \JsonSerializable {
	private Collection $data;
	private Collection $order;

	public static function make( array $data = [], array $order = [] ) {
		return new static( $data, $order );
	}

	private function __construct( array $data = [], array $order = [] ) {
		$this->data = Collection::make( $data );
		$this->order = Collection::make( $order );
	}

	public function get_data() {
		return $this->data;
	}

	public function get_order() {
		return $this->order;
	}

	public function get() {
		return [
			'data' => $this->get_data()->all(),
			'order' => $this->get_order()->all(),
		];
	}

	public function jsonSerialize() {
		$this->get();
	}
}
