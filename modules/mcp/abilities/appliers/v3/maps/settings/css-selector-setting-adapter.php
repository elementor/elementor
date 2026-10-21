<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Text control holding a CSS selector that the frontend passes to `querySelector`/jQuery, where a
 * malformed selector throws and stops the widget script.
 */
class Css_Selector_Setting_Adapter extends String_Setting_Adapter implements V3_Plain_Value_Guard {

	const MAX_LENGTH = 200;

	const PATTERN = '^[#.\[\]\w\s>+~:()="\'*,^$|-]*$';

	public function prop_type( array $control ): Prop_Type {
		return V3_String_Prop_Type::make()->pattern( self::PATTERN )->max_length( self::MAX_LENGTH );
	}

	/**
	 * The published pattern limits the characters; a pattern cannot check that brackets and quotes
	 * close or that the selector does not start or end on a combinator.
	 */
	public function reject_reason( $plain, array $control ): ?string {
		$selector = is_string( $plain ) ? trim( $plain ) : '';

		if ( '' === $selector ) {
			return null;
		}

		if ( ! self::is_balanced( $selector ) || preg_match( '/^[>+~,]|[>+~,]$/', $selector ) ) {
			return 'is not a complete CSS selector (unclosed bracket or quote, or a dangling combinator)';
		}

		return null;
	}

	private static function is_balanced( string $selector ): bool {
		$pairs = [
			')' => '(',
			']' => '[',
		];
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
