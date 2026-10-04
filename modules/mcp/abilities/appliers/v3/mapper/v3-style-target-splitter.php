<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Block_Scanner_Trait;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Splits the CSS of one breakpoint into style-target blocks for a map-driven V3 widget:
 *   `color: red;`              default target
 *   `&:hover { ... }`          default target, hover state
 *   `main-menu { ... }`        `main-menu` target
 *   `main-menu:hover { ... }`  `main-menu` target, hover state
 * Blocks with an unknown target or state, or with nested blocks, are returned as dropped.
 */
class V3_Style_Target_Splitter {

	use Css_Block_Scanner_Trait;

	const DEFAULT_TARGET_SELECTOR = '&';

	const REASON_UNKNOWN_TARGET = 'unknown_target';
	const REASON_UNKNOWN_STATE = 'unknown_state';
	const REASON_NESTED_BLOCK = 'nested_block';
	const REASON_MALFORMED = 'malformed';

	/**
	 * @param string                                                             $css
	 * @param array{default_target: string, targets: string[], states: string[]} $routing
	 * @return array{blocks: array<int, array{target: string, state: ?string, css: string}>, dropped: array<int, array{selector: string, reason: string}>}
	 */
	public function split( string $css, array $routing ): array {
		$default_target = $routing['default_target'];
		$blocks = [];
		$dropped = [];
		$bare_parts = [];
		$length = strlen( $css );
		$segment_start = 0;
		$offset = 0;

		while ( $offset < $length ) {
			$open_brace = $this->next_unquoted( $css, $offset, $length, [ '{', '}' ] );

			if ( null === $open_brace ) {
				break;
			}

			if ( '}' === $css[ $open_brace ] ) {
				$dropped[] = $this->drop( trim( substr( $css, $segment_start ) ), self::REASON_MALFORMED );
				$segment_start = $length;
				break;
			}

			$selector_start = $this->selector_start( $css, $segment_start, $open_brace );
			$bare_parts[] = substr( $css, $segment_start, $selector_start - $segment_start );
			$selector = trim( substr( $css, $selector_start, $open_brace - $selector_start ) );
			$block_end = $this->find_block_end( $css, $open_brace + 1, $length );

			if ( null === $block_end ) {
				$dropped[] = $this->drop( $selector, self::REASON_MALFORMED );
				$segment_start = $length;
				break;
			}

			$body = trim( substr( $css, $open_brace + 1, $block_end - $open_brace - 2 ) );
			$block = $this->resolve_block( $selector, $body, $routing );

			if ( isset( $block['reason'] ) ) {
				$dropped[] = $block;
			} else {
				$blocks[] = $block;
			}

			$segment_start = $block_end;
			$offset = $block_end;
		}

		$bare_parts[] = substr( $css, $segment_start );
		$bare_css = trim( implode( ' ', array_map( 'trim', $bare_parts ) ) );

		if ( '' !== $bare_css ) {
			array_unshift( $blocks, [
				'target' => $default_target,
				'state' => null,
				'css' => $bare_css,
			] );
		}

		return [
			'blocks' => $blocks,
			'dropped' => $dropped,
		];
	}

	/**
	 * @return array{target: string, state: ?string, css: string}|array{selector: string, reason: string}
	 */
	private function resolve_block( string $selector, string $body, array $routing ): array {
		if ( 1 !== preg_match( '/^(?P<target>&|[a-z0-9]+(?:-[a-z0-9]+)*)(?::(?P<state>[a-z-]+))?$/i', $selector, $matches ) ) {
			return $this->drop( $selector, self::REASON_UNKNOWN_TARGET );
		}

		$target = self::DEFAULT_TARGET_SELECTOR === $matches['target'] ? $routing['default_target'] : strtolower( $matches['target'] );
		$state = isset( $matches['state'] ) && '' !== $matches['state'] ? strtolower( $matches['state'] ) : null;

		if ( ! in_array( $target, $routing['targets'], true ) ) {
			return $this->drop( $selector, self::REASON_UNKNOWN_TARGET );
		}

		if ( null !== $state && ! in_array( $state, $routing['states'], true ) ) {
			return $this->drop( $selector, self::REASON_UNKNOWN_STATE );
		}

		if ( null !== $this->next_unquoted( $body, 0, strlen( $body ), [ '{', '}' ] ) ) {
			return $this->drop( $selector, self::REASON_NESTED_BLOCK );
		}

		return [
			'target' => $target,
			'state' => $state,
			'css' => $body,
		];
	}

	/**
	 * @return array{selector: string, reason: string}
	 */
	private function drop( string $selector, string $reason ): array {
		return [
			'selector' => $selector,
			'reason' => $reason,
		];
	}

	private function selector_start( string $css, int $segment_start, int $open_brace ): int {
		for ( $i = $open_brace - 1; $i >= $segment_start; $i-- ) {
			if ( ';' === $css[ $i ] ) {
				return $i + 1;
			}
		}

		return $segment_start;
	}

	/**
	 * @param string   $css
	 * @param int      $offset
	 * @param int      $length
	 * @param string[] $needles
	 */
	private function next_unquoted( string $css, int $offset, int $length, array $needles ): ?int {
		$in_string = false;
		$string_char = '';

		for ( $i = $offset; $i < $length; $i++ ) {
			$char = $css[ $i ];

			if ( $in_string ) {
				if ( $string_char === $char && ! $this->is_escaped( $css, $i ) ) {
					$in_string = false;
				}
				continue;
			}

			if ( '"' === $char || "'" === $char ) {
				$in_string = true;
				$string_char = $char;
				continue;
			}

			if ( in_array( $char, $needles, true ) ) {
				return $i;
			}
		}

		return null;
	}
}
