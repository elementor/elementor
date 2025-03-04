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
	private function validate( array $style ): Parse_Result {
		$validated_style = $style;
		$result = Parse_Result::make();

		if ( ! isset( $style['id'] ) || ! is_string( $style['id'] ) ) {
			$result->errors()->add( 'id', 'missing_or_invalid' );
		}

		if ( ! isset( $style['type'] ) || ! in_array( $style['type'], self::VALID_TYPES, true ) ) {
			$result->errors()->add( 'type', 'missing_or_invalid' );
		}

		if ( ! isset( $style['label'] ) || ! is_string( $style['label'] ) ) {
			$result->errors()->add( 'label', 'missing_or_invalid' );
		}

		if ( ! isset( $style['variants'] ) || ! is_array( $style['variants'] ) ) {
			$result->errors()->add( 'variants', 'missing_or_invalid' );

			unset( $validated_style['variants'] );

			return $result->wrap( $validated_style );
		}

		$props_parser = Props_Parser::make( $this->schema );

		foreach ( $style['variants'] as $variant_index => $variant ) {
			if ( ! isset( $variant['meta'] ) ) {
				$result->errors()->add( 'meta', 'missing' );

				continue;
			}

			$meta_result = $this->validate_meta( $variant['meta'] );

			$result->errors()->merge( $meta_result->errors() );

			if ( $meta_result->is_valid() ) {
				$variant_result = $props_parser->validate( $variant['props'] );

				$result->errors()->merge( $variant_result->errors() );

				$validated_style['variants'][ $variant_index ]['props'] = $variant_result->unwrap();
			} else {
				unset( $validated_style['variants'][ $variant_index ] );
			}
		}

		return $result->wrap( $validated_style );
	}

	private function validate_meta( $meta ): Parse_Result {
		$result = Parse_Result::make();

		if ( ! is_array( $meta ) ) {
			$result->errors()->add( 'meta', 'invalid_type' );

			return $result;
		}

		if ( ! array_key_exists( 'state', $meta ) || ! in_array( $meta['state'], self::VALID_STATES, true ) ) {
			$result->errors()->add( 'meta.state', 'missing_or_invalid_value' );

			return $result;
		}

		// TODO: Validate breakpoint based on the existing breakpoints in the system [EDS-528]
		if ( ! isset( $meta['breakpoint'] ) || ! is_string( $meta['breakpoint'] ) ) {
			$result->errors()->add( 'meta.breakpoint', 'missing_or_invalid_value' );

			return $result;
		}

		return $result;
	}

	/**
	 * @param array $style
	 * the style object to sanitize
	 */
	private function sanitize( array $style ): Parse_Result {
		$props_parser = Props_Parser::make( $this->schema );

		if ( ! empty( $style['variants'] ) ) {
			foreach ( $style['variants'] as $variant_index => $variant ) {
				$style['variants'][ $variant_index ]['props'] = $props_parser->sanitize( $variant['props'] )->unwrap();
			}
		}

		return Parse_Result::make()->wrap( $style );
	}

	/**
	 * @param array $style
	 * the style object to parse
	 */
	public function parse( array $style ): Parse_Result {
		$validate_result = $this->validate( $style );

		$sanitize_result = $this->sanitize( $validate_result->unwrap() );

		$sanitize_result->errors()->merge( $validate_result->errors() );

		return $sanitize_result;
	}
}
