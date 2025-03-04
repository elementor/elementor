<?php

namespace Elementor\Modules\AtomicWidgets\Parsers;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Parse_Errors {

	/**
	 * @var array<array{key: string, error: string}>
	 */
	private array $errors = [];

	public static function make() {
		return new static();
	}

	public function add( string $key, string $error ): self {
		$this->errors[] = [
			'key' => $key,
			'error' => $error,
		];

		return $this;
	}

	public function empty(): bool {
		return empty( $this->errors );
	}

	public function all(): array {
		return $this->errors;
	}

	public function to_string(): string {
		$errors = [];

		foreach ( $this->errors as $error ) {
			$errors[] = $error['key'] . ': ' . $error['error'];
		}

		return implode( ', ', $errors );
	}

	public function merge( Parse_Errors $errors ): self {
		$this->errors = array_merge( $this->errors, $errors->all() );

		return $this;
	}
}
