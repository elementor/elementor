<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper;

use Elementor\Modules\Mcp\Abilities\Utils\Style_Variants_Merger;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Extracts `property: value` declarations from a CSS block and normalizes selector
 * fragments into V3 pseudo-states (hover|focus|active or null).
 */
class Css_Declaration_Parser {

	/**
	 * @return array<int, array{property: string, value: string}>
	 */
	public function parse_declarations( string $css ): array {
		$rules = [];

		foreach ( explode( ';', $css ) as $declaration ) {
			$declaration = trim( $declaration );
			$separator = strpos( $declaration, ':' );

			if ( false === $separator ) {
				continue;
			}

			$property = strtolower( trim( substr( $declaration, 0, $separator ) ) );
			$value = trim( substr( $declaration, $separator + 1 ) );

			if ( '' === $property || '' === $value || 'null' === $value ) {
				continue;
			}

			$rules[] = [
				'property' => $property,
				'value' => $value,
			];
		}

		return $rules;
	}

	public function normalize_state( ?string $selector ): ?string {
		if ( null === $selector || '' === $selector ) {
			return null;
		}

		$state = strtolower( ltrim( $selector, ':' ) );

		return in_array( $state, Style_Variants_Merger::PSEUDO_STATES, true ) ? $state : null;
	}
}
