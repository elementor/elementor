<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Block_Scanner_Trait;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Extracts `property: value` declarations from a CSS block.
 */
class Css_Declaration_Parser {

	use Css_Block_Scanner_Trait;

	/**
	 * @return array<int, array{property: string, value: string}>
	 */
	public function parse_declarations( string $css ): array {
		$rules = [];

		foreach ( $this->split_declarations( $css ) as $declaration ) {
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
