<?php

namespace Elementor\Core\Utils\Api;

class Error_Builder {
	private string $message;
	private int $status;
	private string $code;
	private array $meta;

	private function __construct( $code, $status = 500 ) {
		$this->code = $code;
		$this->status = $status;
		$this->message = '';
		$this->meta = [];
	}

	public static function make( $code, $status = 500 ) {
		return new self( $code, $status );
	}

	public function set_status( int $status ) {
		$this->status = $status;

		return $this;
	}

	public function set_message( string $message ) {
		$this->message = $message;

		return $this;
	}

	public function set_meta( array $meta ) {
		$this->meta = $meta;

		return $this;
	}

	public function build() {
		$response_data = [
			'code' => $this->code,
			'message' => $this->message,
			'data' => array_merge(
				[ 'status' => $this->status ],
				$this->meta
			),
		];

		return new \WP_REST_Response( $response_data, $this->status );
	}
}
