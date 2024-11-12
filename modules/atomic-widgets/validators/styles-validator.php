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
		$errors_bag = [];
		foreach ( $styles as $style_id => $style ) {
			if ( $style_id !== $style['id'] ) {
				$errors_bag[] = 'id';
				$styles[ $style_id ] = [];
				continue;
			}

			[, $style, $errors_bag] = $this->validate_style( $style, $errors_bag );

			$styles[ $style_id ] = $style;
			$errors_bag = array_merge( $errors_bag );
		}

		$is_valid = empty( $errors_bag );

		return [
			$is_valid,
			$styles,
			$errors_bag,
		];
	}

	public function validate_style( $style, $errors_bag = [] ): array {
		if ( ! isset( $style['id'] ) || ! is_string( $style['id'] ) ) {
			$errors_bag[] = 'id';

			return [
				false,
				[],
				$errors_bag,
			];
		}

		foreach ( $style['variants'] as $variant_index => $variant ) {
			if ( ! isset( $variant['meta'] ) ) {
				$errors_bag[] = 'meta';
				continue;
			}

			$errors_bag = $this->validate_meta( $variant['meta'] );

			[,$validated_props, $variant_errors] = Props_Validator::make( $this->schema )->validate( $variant['props'] );
			$style['variants'][ $variant_index ]['props'] = $validated_props;

			$errors_bag = array_merge( $errors_bag, $variant_errors );
		}

		$is_valid = empty( $errors_bag );

		return [
			$is_valid,
			$style,
			$errors_bag,
		];
	}

	public function validate_meta( $meta, $errors_bag = [] ) {
		if ( ! is_array( $meta ) ) {
			$errors_bag[] = 'meta';
		}

		if ( ! array_key_exists( 'state', $meta ) || ! in_array( $meta['state'], self::VALID_STATES, true ) ) {
			$errors_bag[] = 'meta';
		}

		// TODO: Validate breakpoint based on the existing breakpoints in the system [EDS-528]
		if ( ! isset( $meta['breakpoint'] ) || ! is_string( $meta['breakpoint'] ) ) {
			$errors_bag[] = 'meta';
		}

		return $errors_bag;
	}
}
