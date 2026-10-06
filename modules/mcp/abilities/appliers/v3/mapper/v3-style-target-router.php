<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Block_Scanner_Trait;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Routes the CSS of one breakpoint to the style targets of a map-driven V3 widget:
 *   `color: red;`              default target
 *   `&:hover { ... }`          default target, hover state
 *   `main-menu { ... }`        `main-menu` target
 *   `main-menu:current { ... }` `main-menu` target, `current` state
 */
class V3_Style_Target_Router {

	use Css_Block_Scanner_Trait;

	const DEFAULT_TARGET_SELECTOR = '&';

	const SELECTOR_PATTERN = '/^(?P<target>&|[a-z0-9]+(?:-[a-z0-9]+)*)(?::(?P<state>[a-z]+(?:-[a-z]+)*))?$/i';

	const REASON_UNKNOWN_TARGET = 'unknown_target';

	const REASON_UNKNOWN_STATE = 'unknown_state';

	const REASON_NESTED_BLOCK = 'nested_block';

	const REASON_MALFORMED = 'malformed';

	/**
	 * @param string                  $css
	 * @param string                  $default_target
	 * @param array<string, string[]> $target_states Alias => states the target accepts.
	 * @return array{blocks: array<int, array{target: string, state: ?string, css: string}>, dropped: array<int, array{selector: string, reason: string}>}
	 */
	public function route( string $css, string $default_target, array $target_states ): array {
		$blocks = [];
		$dropped = [];
		$bare_parts = [];
		$length = strlen( $css );
		$segment_start = 0;

		while ( $segment_start < $length ) {
			$brace = $this->find_unquoted( $css, $segment_start, $length, [ '{', '}' ] );

			if ( null === $brace ) {
				break;
			}

			$selector_start = $this->selector_start( $css, $segment_start, $brace );
			$selector = trim( substr( $css, $selector_start, $brace - $selector_start ) );
			$block_end = '{' === $css[ $brace ] ? $this->find_block_end( $css, $brace + 1, $length ) : null;
			$bare_parts[] = substr( $css, $segment_start, $selector_start - $segment_start );

			if ( null === $block_end ) {
				$dropped[] = self::drop( $selector, self::REASON_MALFORMED );
				$segment_start = $length;
				break;
			}

			$body = trim( substr( $css, $brace + 1, $block_end - $brace - 2 ) );
			$block = $this->resolve_block( $selector, $body, $default_target, $target_states );

			if ( isset( $block['reason'] ) ) {
				$dropped[] = $block;
			} else {
				$blocks[] = $block;
			}

			$segment_start = $block_end;
		}

		$bare_parts[] = substr( $css, $segment_start );
		$bare_css = trim( implode( ' ', array_filter( array_map( 'trim', $bare_parts ) ) ) );

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
	 * @param array<string, string[]> $target_states
	 * @return array{target: string, state: ?string, css: string}|array{selector: string, reason: string}
	 */
	private function resolve_block( string $selector, string $body, string $default_target, array $target_states ): array {
		if ( 1 !== preg_match( self::SELECTOR_PATTERN, $selector, $matches ) ) {
			return self::drop( $selector, self::REASON_UNKNOWN_TARGET );
		}

		$target = self::DEFAULT_TARGET_SELECTOR === $matches['target'] ? $default_target : strtolower( $matches['target'] );
		$state = '' !== ( $matches['state'] ?? '' ) ? strtolower( $matches['state'] ) : Style_Target::DEFAULT_STATE;

		if ( ! isset( $target_states[ $target ] ) ) {
			return self::drop( $selector, self::REASON_UNKNOWN_TARGET );
		}

		if ( Style_Target::DEFAULT_STATE !== $state && ! in_array( $state, $target_states[ $target ], true ) ) {
			return self::drop( $selector, self::REASON_UNKNOWN_STATE );
		}

		if ( null !== $this->find_unquoted( $body, 0, strlen( $body ), [ '{', '}' ] ) ) {
			return self::drop( $selector, self::REASON_NESTED_BLOCK );
		}

		return [
			'target' => $target,
			'state' => Style_Target::DEFAULT_STATE === $state ? null : $state,
			'css' => $body,
		];
	}

	/**
	 * @return array{selector: string, reason: string}
	 */
	private static function drop( string $selector, string $reason ): array {
		return [
			'selector' => $selector,
			'reason' => $reason,
		];
	}

	private function selector_start( string $css, int $segment_start, int $brace ): int {
		$semicolon = strrpos( substr( $css, $segment_start, $brace - $segment_start ), ';' );

		return false === $semicolon ? $segment_start : $segment_start + $semicolon + 1;
	}
}
