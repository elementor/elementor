<?php

namespace Elementor\Core\Utils\Api;

class Error_Builder {
	private string $message;
	private int $status;
	private string $code;

	private function __construct( $code, $status = 500 ) {
		$this->code = $code;
		$this->status = $status;
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

	public function build() {
		return new \WP_Error( $this->code, $this->message, [ 'status' => $this->status ] );
	}
}
