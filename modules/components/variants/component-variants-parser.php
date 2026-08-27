<?php

namespace Elementor\Modules\Components\Variants;

use Elementor\Core\Utils\Api\Parse_Result;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Validates and sanitizes the component variants meta payload.
 *
 * Valid input example:
 * ```
 * [
 *     'variants' => [
 *         [
 *             'id'    => 'v_g8k3nq00',
 *             'label' => 'Green',
 *             'widgets' => [
 *                 'e-button-123' => [
 *                     'settings' => [ 'classes' => [ 'add' => [ 'g_abc123' ] ] ],
 *                     'variant'  => 'v_btnsucc0',
 *                 ],
 *             ],
 *         ],
 *     ],
 * ];
 * ```
 */
class Component_Variants_Parser {
	private Component_Variant_Parser $variant_parser;

	public function __construct( Component_Variant_Parser $variant_parser ) {
		$this->variant_parser = $variant_parser;
	}

	public static function make(): self {
		return new self( Component_Variant_Parser::make() );
	}

	public function parse( $data ): Parse_Result {
		$result = Parse_Result::make();

		if ( empty( $data ) ) {
			return $result->wrap( [] );
		}

		if ( ! is_array( $data ) ) {
			$result->errors()->add( 'variants', 'invalid_structure' );

			return $result;
		}

		if ( ! isset( $data['variants'] ) ) {
			return $result->wrap( [] );
		}

		if ( ! is_array( $data['variants'] ) ) {
			$result->errors()->add( 'variants', 'invalid_structure' );

			return $result;
		}

		$parsed_variants = [];
		$seen_ids = [];

		foreach ( $data['variants'] as $index => $variant ) {
			if ( ! is_array( $variant ) ) {
				$result->errors()->add( "variants.$index", 'invalid_structure' );
				continue;
			}

			$variant_result = $this->variant_parser->parse( $variant );

			if ( ! $variant_result->is_valid() ) {
				$result->errors()->merge( $variant_result->errors(), "variants.$index" );
				continue;
			}

			$parsed_variant = $variant_result->unwrap();
			$id = $parsed_variant['id'];

			if ( isset( $seen_ids[ $id ] ) ) {
				$result->errors()->add( "variants.$index.id", 'duplicate_id' );
				continue;
			}

			$seen_ids[ $id ] = true;
			$parsed_variants[] = $parsed_variant;
		}

		if ( ! $result->is_valid() ) {
			return $result;
		}

		return $result->wrap( [
			'variants' => $parsed_variants,
		] );
	}
}
