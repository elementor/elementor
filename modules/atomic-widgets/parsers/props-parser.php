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
	 *     1: array<string, bool>,
	 *     2: array<string>,
	 *     3: array<string, mixed>
	 * }
	 */
	public function parse( array $props ): array {
		$validated = [];
		$sanitized = [];

		foreach ( $this->schema as $key => $prop_type ) {
			if ( ! ( $prop_type instanceof Prop_Type ) ) {
				continue;
			}

			$value = $props[ $key ] ?? null;

			$is_valid = $prop_type->validate( $value ?? $prop_type->get_default() );

			if ( ! $is_valid ) {
				$this->errors_bag[] = $key;
				$validated[ $key ] = false;

				continue;
			}

			$validated[ $key ] = true;

			if ( $value ) {
				$sanitized[ $key ] = $prop_type->sanitize( $value );
			}
		}

		$is_valid = empty( $this->errors_bag );

		return [
			$is_valid,
			$validated,
			$this->errors_bag,
			$sanitized,
		];
	}
}
