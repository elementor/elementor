<?php

namespace Elementor\Modules\AtomicWidgets\Parsers;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Style_Parser {
	const VALID_TYPES = [
		'class',
	];

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
	 * @param array $style
	 * the style object to validate
	 */
	public function validate( array $style ): Result {
		$validated_style = $style;
		$result = Result::make();

		if ( ! isset( $style['id'] ) || ! is_string( $style['id'] ) ) {
			$result->add_error( 'id', 'missing_or_invalid' );
		}

		if ( ! isset( $style['type'] ) || ! in_array( $style['type'], self::VALID_TYPES, true ) ) {
			$result->add_error( 'type', 'missing_or_invalid' );
		}

		if ( ! isset( $style['label'] ) || ! is_string( $style['label'] ) ) {
			$result->add_error( 'label', 'missing_or_invalid' );
		}

		if ( ! isset( $style['variants'] ) || ! is_array( $style['variants'] ) ) {
			$result->add_error( 'variants', 'missing_or_invalid' );

			unset( $validated_style['variants'] );

			return $result->with( $validated_style );
		}

		$props_parser = Props_Parser::make( $this->schema );

		foreach ( $style['variants'] as $variant_index => $variant ) {
			if ( ! isset( $variant['meta'] ) ) {
				$result->add_error( 'meta', 'missing' );

				continue;
			}

			$meta_validation = $this->validate_meta( $variant['meta'] );

			$result->merge( $meta_validation );

			if ( $meta_validation->is_valid() ) {
				$variant_validation = $props_parser->validate( $variant['props'] );

				$result->merge( $variant_validation );

				$validated_style['variants'][ $variant_index ]['props'] = $variant_validation->value();
			} else {
				unset( $validated_style['variants'][ $variant_index ] );
			}
		}

		return $result;
	}

	public function validate_meta( $meta ): Result {
		$result = Result::make();

		if ( ! is_array( $meta ) ) {
			return $result->add_error( 'meta', 'invalid' );
		}

		if ( ! array_key_exists( 'state', $meta ) || ! in_array( $meta['state'], self::VALID_STATES, true ) ) {
			return $result->add_error( 'state', 'missing_or_invalid' );
		}

		// TODO: Validate breakpoint based on the existing breakpoints in the system [EDS-528]
		if ( ! isset( $meta['breakpoint'] ) || ! is_string( $meta['breakpoint'] ) ) {
			return $result->add_error( 'breakpoint', 'missing_or_invalid' );
		}

		return $result;
	}

	/**
	 * @param array $style
	 * the style object to sanitize
	 *
	 * @return array<string, mixed>
	 */
	public function sanitize( array $style ): array {
		$props_parser = Props_Parser::make( $this->schema );

		if ( ! empty( $style['variants'] ) ) {
			foreach ( $style['variants'] as $variant_index => $variant ) {
				$style['variants'][ $variant_index ]['props'] = $props_parser->sanitize( $variant['props'] );
			}
		}

		return $style;
	}

	/**
	 * @param array $style
	 * the style object to parse
	 */
	public function parse( array $style ): Result {
		$result = $this->validate( $style );
		$sanitized = $this->sanitize( $result->value() );

		return $result->with( $sanitized );
	}
}
