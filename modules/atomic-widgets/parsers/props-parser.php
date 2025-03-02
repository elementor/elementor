<?php

namespace Elementor\Modules\AtomicWidgets\Parsers;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Props_Parser {

	private array $schema;

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
	 */
	public function validate( array $props ): Result {
		$result = Result::make();

		$validated = [];

		foreach ( $this->schema as $key => $prop_type ) {
			if ( ! ( $prop_type instanceof Prop_Type ) ) {
				continue;
			}

			$value = $props[ $key ] ?? null;

			$is_valid = $prop_type->validate( $value ?? $prop_type->get_default() );

			if ( ! $is_valid ) {
				$result->add_error( $key, 'invalid' );

				continue;
			}

			if ( ! is_null( $value ) ) {
				$validated[ $key ] = $value;
			}
		}

		return $result->with( $validated );
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
	 */
	public function parse( array $props ): Result {
		$result = $this->validate( $props );

		$sanitized = $this->sanitize( $result->value() );

		return $result->with( $sanitized );
	}
}
