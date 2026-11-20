<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Extracts `property: value` declarations from a CSS block.
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
}
