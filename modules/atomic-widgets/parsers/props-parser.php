<?php

namespace Elementor\Modules\AtomicWidgets\Parsers;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Props_Parser {

	private array $schema;
	private array $errors_bag = [];

	public function __construct( array $schema ) {
		$this->schema = $schema;
	}

	public static function make( array $schema ): self {
		return new static( $schema );
	}

	/**
	 * @param array $props
	 * The key of each item represents the prop name (should match the schema),
	 * and the value is the prop value to validate
	 *
	 * @return array{
	 *     0: bool,
	 *     1: array<string, mixed>,
	 *     2: array<string>
	 * }
	 */
	public function validate( array $props ): array {
		$validated = [];

		foreach ( $this->schema as $key => $prop_type ) {
			if ( ! ( $prop_type instanceof Prop_Type ) ) {
				continue;
			}

			$value = $props[ $key ] ?? null;

			$is_valid = $prop_type->validate( $value ?? $prop_type->get_default() );

			if ( ! $is_valid ) {
				$this->errors_bag[] = $key;

				continue;
			}

			if ( ! is_null( $value ) ) {
				$validated[ $key ] = $value;
			}
		}

		$is_valid = empty( $this->errors_bag );

		return [
			$is_valid,
			$validated,
			$this->errors_bag,
		];
	}

	/**
	 * @param array $props
	 * The key of each item represents the prop name (should match the schema),
	 * and the value is the prop value to sanitize
	 *
	 * @return array<string, mixed>
	 */
	public function sanitize( array $props ): array {
		$sanitized = [];

		foreach ( $this->schema as $key => $prop_type ) {
			if ( ! isset( $props[ $key ] ) ) {
				continue;
			}

			$sanitized[ $key ] = $prop_type->sanitize( $props[ $key ] );
		}

		return $sanitized;
	}

	/**
	 * @param array $props
	 * The key of each item represents the prop name (should match the schema),
	 * and the value is the prop value to parse
	 *
	 * @return array{
	 *      0: bool,
	 *      1: array<string, mixed>,
	 *      2: array<string>
	 *  }
	 */
	public function parse( array $props ): array {
		[ $is_valid, $validated, $errors_bag  ] = $this->validate( $props );

		return [
			$is_valid,
			$this->sanitize( $validated ),
			$errors_bag,
		];
	}
}
