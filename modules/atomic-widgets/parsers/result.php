<?php

namespace Elementor\Modules\AtomicWidgets\Parsers;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Result {
	/**
	 * @var array<array{key: string, error: string}>
	 */
	private array $errors = [];

	private $value;

	public static function make() {
		return new static();
	}

	public function value() {
		return $this->value;
	}

	public function with( $value ): self {
		$this->value = $value;

		return $this;
	}

	public function is_valid(): bool {
		return empty( $this->errors );
	}

	public function errors() {
		return $this->errors;
	}

	public function add_error( string $key, string $error ): self {
		$this->errors[] = [
			'key' => $key,
			'error' => $error,
		];

		return $this;
	}

	public function get_errors() {
		return $this->errors;
	}

	public function to_readable_error(): string {
		$errors = [];

		foreach ( $this->errors as $error ) {
			$errors[] = $error['key'] . ': ' . $error['error'];
		}

		return implode( ', ', $errors );
	}

	public function merge( Result $result ): self {
		$this->errors = array_merge( $this->errors, $result->errors() );

		return $this;
	}
}
