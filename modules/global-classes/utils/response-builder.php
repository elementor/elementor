<?php

namespace Elementor\Modules\GlobalClasses\Utils;

class Response_Builder {
	private $data;
	private int $status;
	private array $meta = [];

	private function __construct( $data, $status ) {
		$this->data = $data;
		$this->status = $status;
	}

	public static function make( $data = null, $status = 200 ) {
		return new self( $data, $status );
	}

	public function set_meta( array $meta ) {
		$this->meta = $meta;

		return $this;
	}

	public function set_status( int $status ) {
		$this->status = $status;

		return $this;
	}

	public function build() {
		$res_data = [
			'data' => $this->data,
			'meta' => $this->meta,
		];

		return new \WP_REST_Response( $res_data, $this->status );
	}
}
