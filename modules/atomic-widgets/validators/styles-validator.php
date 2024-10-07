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
	 * The key of each item represents the style id,
	 * and the value is the style object to validate
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
			try {
				$this->validate_id( $style['id'] );
			} catch ( \Exception $e ) {
				$errors[] = 'id';
			}

			foreach ( $style['variants'] as $variant_index => $variant ) {
				try {
					$this->validate_meta( $variant['meta'] );
				} catch ( \Exception $e ) {
					$errors[] = 'meta';
				}

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

	public function validate_id( string $style_id ) {
		if ( strpos( $style_id, 's-' ) !== 0 ) {
			throw new \Exception( 'Style ID should start with "s-"' );
		}
	}

	public function validate_meta( array $meta ) {
		$valid_states = [
			'hover',
			'active',
			'focus',
			null,
		];

		if ( ! is_array( $meta ) ) {
			throw new \Exception( 'Meta should be an array' );
		}

		if ( ( ! is_null( $meta['state'] ) && ! isset( $meta['state'] ) ) || ! in_array( $meta['state'], $valid_states, true ) ) {
			throw new \Exception( 'Meta state is required and should be one of: ' . implode( ', ', $valid_states ) );
		}

		if ( ! isset( $meta['breakpoint'] ) || ! is_string( $meta['breakpoint'] ) ) {
			throw new \Exception( 'Meta breakpoint is required and should be a string' );
		}
	}
}
