<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Block_Scanner_Trait;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Media_Splitter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Removes `@media(--<alias>) { ... }` blocks whose alias is not an active breakpoint, so a
 * single unknown breakpoint drops only its own block instead of failing the whole CSS string.
 */
class V3_Unknown_Breakpoint_Filter {

	use Css_Block_Scanner_Trait;

	const BREAKPOINT_BLOCK_PATTERN = '/@media\s*\(\s*--([a-z0-9_-]+)\s*\)\s*\{/i';

	/**
	 * @param string   $css
	 * @param string[] $known_breakpoints
	 * @return array{css: string, dropped: string[]}
	 */
	public function filter( string $css, array $known_breakpoints ): array {
		$allowed = array_merge( Css_Media_Splitter::DESKTOP_ALIASES, $known_breakpoints );
		$dropped = [];
		$offset = 0;

		while ( 1 === preg_match( self::BREAKPOINT_BLOCK_PATTERN, $css, $matches, PREG_OFFSET_CAPTURE, $offset ) ) {
			$start = (int) $matches[0][1];
			$open_brace = $start + strlen( $matches[0][0] ) - 1;
			$alias = strtolower( $matches[1][0] );

			if ( in_array( $alias, $allowed, true ) ) {
				$offset = $open_brace + 1;
				continue;
			}

			$block_end = $this->find_block_end( $css, $open_brace + 1, strlen( $css ) );

			if ( null === $block_end ) {
				break;
			}

			$dropped[] = $alias;
			$css = substr( $css, 0, $start ) . substr( $css, $block_end );
			$offset = $start;
		}

		return [
			'css' => $css,
			'dropped' => $dropped,
		];
	}
}
