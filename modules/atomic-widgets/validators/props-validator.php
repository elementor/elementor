<?php

namespace Elementor\Modules\AtomicWidgets\Validators;

use Elementor\Modules\AtomicWidgets\PropTypes\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Props_Validator {

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

		foreach ( $props as $key => $value ) {
			$prop_type = $this->schema[ $key ] ?? null;

			if ( ! ( $prop_type instanceof Prop_Type ) ) {
				continue;
			}

			try {
				$prop_type->validate_with_additional( $value );
			} catch ( \Exception $e ) {
				$this->errors_bag[] = $key;
				continue;
			}

			$validated[ $key ] = $value;
		}

		$is_valid = empty( $this->errors_bag );

		return [
			$is_valid,
			$validated,
			$this->errors_bag,
		];
	}
}
