<?php
namespace Elementor\Modules\CssConverter\Services\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Widget_Creation_Result {
	private bool $success;
	private ?string $error_message;
	private array $data;

	private function __construct( bool $success, ?string $error_message = null, array $data = [] ) {
		$this->success = $success;
		$this->error_message = $error_message;
		$this->data = $data;
	}

	public static function success( array $data = [] ): self {
		return new self( true, null, $data );
	}

	public static function failure( string $error_message, array $data = [] ): self {
		return new self( false, $error_message, $data );
	}

	public function is_success(): bool {
		return $this->success;
	}

	public function is_failure(): bool {
		return ! $this->success;
	}

	public function get_error_message(): ?string {
		return $this->error_message;
	}

	public function get_data(): array {
		return $this->data;
	}

	public function get_data_value( string $key, $default = null ) {
		return $this->data[ $key ] ?? $default;
	}
}
