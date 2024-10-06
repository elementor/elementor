<?php

namespace Elementor\Modules\AtomicWidgets\Validators;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Styles_Validator {

	private array $schema;

	public function __construct( array $schema ) {
		$this->schema = $schema;
	}

	public static function make( array $schema ): self {
		return new static( $schema );
	}

	/**
	 * @param array $styles
	 *
	 * @return array{
	 *     0: bool,
	 *     1: array<string, mixed>,
	 *     2: array<string>
	 * }
	 */
	public function validate( array $styles ): array {
		$errors = [];

		foreach ( $styles as $style_id => $style ) {
			foreach ( $style['variants'] as $variant_index => $variant ) {
				[,$validated_props, $variant_errors] = Props_Validator::make( $this->schema )->validate( $variant['props'] );
				$styles[ $style_id ]['variants'][ $variant_index ]['props'] = $validated_props;
				$errors = array_merge( $errors, $variant_errors );
			}
		}

		$is_valid = empty( $errors );

		return [
			$is_valid,
			$styles,
			$errors,
		];
	}
}
