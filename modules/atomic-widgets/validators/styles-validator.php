<?php

namespace Elementor\Modules\AtomicWidgets\Validators;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Styles_Validator {
	const VALID_STATES = [
		'hover',
		'active',
		'focus',
		null,
	];

	private array $schema;

	private array $errors_bag = [];

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
		foreach ( $styles as $style_id => $style ) {
			if ( ! isset( $style['id'] ) || ! is_string( $style['id'] ) ) {
				$this->errors_bag[] = 'id';
				$styles[ $style_id ] = [];
				continue;
			}

			foreach ( $style['variants'] as $variant_index => $variant ) {
				if ( ! isset( $variant['meta'] ) ) {
					$this->errors_bag[] = 'meta';
					continue;
				}

				$this->validate_meta( $variant['meta'] );

				[,$validated_props, $variant_errors] = Props_Validator::make( $this->schema )->validate( $variant['props'] );
				$styles[ $style_id ]['variants'][ $variant_index ]['props'] = $validated_props;

				$this->errors_bag = array_merge( $this->errors_bag, $variant_errors );
			}
		}

		$is_valid = empty( $this->errors_bag );

		return [
			$is_valid,
			$styles,
			$this->errors_bag,
		];
	}

	public function validate_meta( $meta ) {
		if ( ! is_array( $meta ) ) {
			$this->errors_bag[] = 'meta';
		}

		if ( ! array_key_exists( 'state', $meta ) || ! in_array( $meta['state'], self::VALID_STATES, true ) ) {
			$this->errors_bag[] = 'meta';
		}

		// TODO: Validate breakpoint based on the existing breakpoints in the system [EDS-528]
		if ( ! isset( $meta['breakpoint'] ) || ! is_string( $meta['breakpoint'] ) ) {
			$this->errors_bag[] = 'meta';
		}
	}
}
