<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Text control holding a CSS selector that the frontend passes to `querySelector`/jQuery, where a
 * malformed selector throws and stops the widget script.
 */
class Css_Selector_Setting_Adapter extends String_Setting_Adapter implements V3_Plain_Value_Guard {

	const MAX_LENGTH = 200;

	public function reject_reason( $plain, array $control ): ?string {
		if ( is_array( $plain ) ) {
			return null;
		}

		if ( ! is_string( $plain ) ) {
			return 'is not a CSS selector string';
		}

		$selector = trim( $plain );

		if ( '' === $selector ) {
			return null;
		}

		if ( strlen( $selector ) > self::MAX_LENGTH || ! preg_match( '/^[#.\[\]\w\s>+~:()="\'*,^$|-]+$/u', $selector ) || ! self::is_balanced( $selector ) || preg_match( '/^[>+~,]|[>+~,]$/', $selector ) ) {
			return 'is not a valid CSS selector';
		}

		return null;
	}

	private static function is_balanced( string $selector ): bool {
		$pairs = [ ')' => '(', ']' => '[' ];
		$stack = [];
		$quote = null;

		foreach ( str_split( $selector ) as $char ) {
			if ( null !== $quote ) {
				if ( $char === $quote ) {
					$quote = null;
				}

				continue;
			}

			if ( '"' === $char || "'" === $char ) {
				$quote = $char;
			} elseif ( in_array( $char, $pairs, true ) ) {
				$stack[] = $char;
			} elseif ( isset( $pairs[ $char ] ) && array_pop( $stack ) !== $pairs[ $char ] ) {
				return false;
			}
		}

		return null === $quote && empty( $stack );
	}
}
