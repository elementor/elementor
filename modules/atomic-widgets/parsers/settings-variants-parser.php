<?php

namespace Elementor\Modules\AtomicWidgets\Parsers;

use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Core\Utils\Api\Parse_Result;
use Elementor\Modules\AtomicWidgets\PropTypes\Responsive_Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Settings_Variants_Parser {
	private array $schema;

	public function __construct( array $schema ) {
		$this->schema = Responsive_Settings::filter_schema( $schema );
	}

	public static function make( array $schema ): self {
		return new static( $schema );
	}

	/**
	 * @param array $variants List of `{ meta: { breakpoint }, props: { ... } }`.
	 */
	public function parse( array $variants ): Parse_Result {
		$validate_result = $this->validate( $variants );

		$sanitize_result = $this->sanitize( $validate_result->unwrap() );

		$sanitize_result->errors()->merge( $validate_result->errors() );

		return $sanitize_result;
	}

	private function validate( array $variants ): Parse_Result {
		$result = Parse_Result::make();
		$validated = [];
		$props_parser = Props_Parser::make( $this->schema );

		foreach ( $variants as $index => $variant ) {
			if ( ! is_array( $variant ) ) {
				$result->errors()->add( "variants[$index]", 'invalid_type' );
				continue;
			}

			if ( ! isset( $variant['meta'] ) ) {
				$result->errors()->add( "variants[$index].meta", 'missing' );
				continue;
			}

			$meta_result = $this->validate_meta( $variant['meta'] );
			$result->errors()->merge( $meta_result->errors(), "variants[$index].meta" );

			if ( ! $meta_result->is_valid() ) {
				continue;
			}

			$breakpoint = $variant['meta']['breakpoint'];

			if ( Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP === $breakpoint ) {
				continue;
			}

			$props = $variant['props'] ?? [];

			if ( ! is_array( $props ) ) {
				$result->errors()->add( "variants[$index].props", 'invalid_type' );
				continue;
			}

			$props_result = $props_parser->validate( $props );
			$result->errors()->merge( $props_result->errors(), "variants[$index]" );

			$validated[] = [
				'meta' => [
					'breakpoint' => $breakpoint,
				],
				'props' => $props_result->unwrap(),
			];
		}

		return $result->wrap( $validated );
	}

	private function validate_meta( $meta ): Parse_Result {
		$result = Parse_Result::make();

		if ( ! is_array( $meta ) ) {
			$result->errors()->add( 'meta', 'invalid_type' );

			return $result;
		}

		if ( ! isset( $meta['breakpoint'] ) || ! is_string( $meta['breakpoint'] ) ) {
			$result->errors()->add( 'breakpoint', 'missing_or_invalid_value' );

			return $result;
		}

		if ( ! Responsive_Settings::is_valid_breakpoint( $meta['breakpoint'] ) ) {
			$result->errors()->add( 'breakpoint', 'missing_or_invalid_value' );
		}

		return $result;
	}

	private function sanitize( array $variants ): Parse_Result {
		$props_parser = Props_Parser::make( $this->schema );
		$sanitized = [];

		foreach ( $variants as $variant ) {
			$props = $props_parser->sanitize( $variant['props'] ?? [] )->unwrap();

			if ( empty( $props ) ) {
				continue;
			}

			$sanitized[] = [
				'meta' => [
					'breakpoint' => sanitize_key( $variant['meta']['breakpoint'] ),
				],
				'props' => $props,
			];
		}

		return Parse_Result::make()->wrap( $sanitized );
	}
}
