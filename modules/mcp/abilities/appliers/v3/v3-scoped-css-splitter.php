<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Block_Scanner_Trait;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Splits a CSS string into wrapper declarations and inner-element scoped blocks.
 *
 * Non-alias nested blocks (e.g. `footer-link { ... }`) never reach the wrapper output —
 * they are collected in `dropped_blocks` so the caller can warn without poisoning the
 * downstream V3 mapper (whose `parse_nested` errors on any un-prefixed `{`).
 */
class V3_Scoped_Css_Splitter {

	use Css_Block_Scanner_Trait;

	const SUPPORTED_STATES = [ 'hover', 'active', 'focus' ];

	private static ?self $instance = null;

	/**
	 * @param string   $css_string
	 * @param string[] $inner_element_aliases
	 * @return array{wrapper: string, scopes: array<string, string>, dropped_blocks: array<int, array{selector: string, body: string}>}
	 */
	public static function split( string $css_string, array $inner_element_aliases ): array {
		$css_string = trim( $css_string );

		if ( '' === $css_string || empty( $inner_element_aliases ) ) {
			return [
				'wrapper' => $css_string,
				'scopes' => [],
				'dropped_blocks' => [],
			];
		}

		$alias_lookup = array_fill_keys( $inner_element_aliases, true );
		$wrapper_parts = [];
		$scopes = [];
		$dropped_blocks = [];
		$offset = 0;
		$length = strlen( $css_string );

		while ( $offset < $length ) {
			self::skip_whitespace( $css_string, $offset, $length );

			if ( $offset >= $length ) {
				break;
			}

			if ( '@' === $css_string[ $offset ] ) {
				$block = self::read_at_rule_block( $css_string, $offset, $length );
				if ( null === $block ) {
					self::collect_wrapper_declarations( substr( $css_string, $offset ), $wrapper_parts, $dropped_blocks );
					break;
				}

				self::split_at_rule( $block, $inner_element_aliases, $wrapper_parts, $scopes, $dropped_blocks );
				$offset = $block['end'];
				continue;
			}

			$next_alias = self::find_next_alias_block( $css_string, $offset, $length, $alias_lookup );

			if ( null === $next_alias ) {
				self::collect_wrapper_declarations( substr( $css_string, $offset ), $wrapper_parts, $dropped_blocks );
				break;
			}

			if ( $next_alias['start'] > $offset ) {
				$declarations = substr( $css_string, $offset, $next_alias['start'] - $offset );
				self::collect_wrapper_declarations( $declarations, $wrapper_parts, $dropped_blocks );
			}

			$block = self::read_braced_block( $css_string, $next_alias['brace_pos'], $length );
			if ( null === $block ) {
				self::collect_wrapper_declarations( substr( $css_string, $next_alias['start'] ), $wrapper_parts, $dropped_blocks );
				break;
			}

			$scope_key = self::resolve_scope_key( $next_alias['selector'], $alias_lookup );
			if ( null === $scope_key ) {
				$dropped_blocks[] = [
					'selector' => trim( $next_alias['selector'] ),
					'body' => trim( $block['body'] ),
				];
			} else {
				$scopes[ $scope_key ] = trim(
					( $scopes[ $scope_key ] ?? '' ) . ( '' === ( $scopes[ $scope_key ] ?? '' ) ? '' : ' ' ) . $block['body']
				);
			}

			$offset = $block['end'];
		}

		return [
			'wrapper' => trim( implode( ' ', array_filter( $wrapper_parts, static fn( $part ) => '' !== trim( $part ) ) ) ),
			'scopes' => $scopes,
			'dropped_blocks' => $dropped_blocks,
		];
	}

	/**
	 * Extracts declarations (property: value pairs) from a chunk of wrapper CSS while
	 * routing any embedded `selector { ... }` blocks (which would break parse_nested) into
	 * `dropped_blocks`. Braces inside strings are preserved for the declaration path.
	 *
	 * @param string                                                       $chunk
	 * @param string[]                                                     $wrapper_parts
	 * @param array<int, array{selector: string, body: string}>            $dropped_blocks
	 */
	private static function collect_wrapper_declarations( string $chunk, array &$wrapper_parts, array &$dropped_blocks ): void {
		$chunk = trim( $chunk );

		if ( '' === $chunk ) {
			return;
		}

		$offset = 0;
		$length = strlen( $chunk );
		$declarations_parts = [];

		while ( $offset < $length ) {
			$brace_pos = self::next_unquoted_brace( $chunk, $offset, $length );

			if ( null === $brace_pos ) {
				$declarations_parts[] = substr( $chunk, $offset );
				break;
			}

			$selector_start = self::scan_selector_start( $chunk, $offset, $brace_pos );
			if ( $selector_start > $offset ) {
				$declarations_parts[] = substr( $chunk, $offset, $selector_start - $offset );
			}

			$block = self::read_braced_block( $chunk, $brace_pos, $length );
			if ( null === $block ) {
				$declarations_parts[] = substr( $chunk, $selector_start );
				break;
			}

			$dropped_blocks[] = [
				'selector' => trim( substr( $chunk, $selector_start, $brace_pos - $selector_start ) ),
				'body' => trim( $block['body'] ),
			];

			$offset = $block['end'];
		}

		foreach ( $declarations_parts as $part ) {
			$part = trim( $part );
			if ( '' !== $part ) {
				$wrapper_parts[] = $part;
			}
		}
	}

	/**
	 * Returns the offset of the next `{` outside of any quoted string, or null.
	 */
	private static function next_unquoted_brace( string $chunk, int $offset, int $length ): ?int {
		$in_string = false;
		$string_char = '';

		for ( $i = $offset; $i < $length; $i++ ) {
			$char = $chunk[ $i ];

			if ( $in_string ) {
				if ( $string_char === $char && ( $i === 0 || '\\' !== $chunk[ $i - 1 ] ) ) {
					$in_string = false;
				}
				continue;
			}

			if ( '"' === $char || "'" === $char ) {
				$in_string = true;
				$string_char = $char;
				continue;
			}

			if ( '{' === $char ) {
				return $i;
			}
		}

		return null;
	}

	/**
	 * Finds where a selector starts, given the position of its `{`. Walks back over the
	 * selector characters until it hits a `;` or `}` (declaration/block boundary).
	 */
	private static function scan_selector_start( string $chunk, int $offset, int $brace_pos ): int {
		for ( $i = $brace_pos - 1; $i >= $offset; $i-- ) {
			$char = $chunk[ $i ];
			if ( ';' === $char || '}' === $char ) {
				return $i + 1;
			}
		}

		return $offset;
	}

	/**
	 * An at-rule may wrap alias blocks (`@media(--mobile) { main-menu { ... } }`), so its body is
	 * split as well and each part is re-wrapped in the same prelude. That keeps the breakpoint
	 * with the scope it belongs to, since a scope is mapped independently of the wrapper.
	 *
	 * @param array{prelude: string, body: string, raw: string}     $block
	 * @param string[]                                               $inner_element_aliases
	 * @param string[]                                               $wrapper_parts
	 * @param array<string, string>                                  $scopes
	 * @param array<int, array{selector: string, body: string}>      $dropped_blocks
	 */
	private static function split_at_rule( array $block, array $inner_element_aliases, array &$wrapper_parts, array &$scopes, array &$dropped_blocks ): void {
		$inner = self::split( $block['body'], $inner_element_aliases );

		foreach ( $inner['dropped_blocks'] as $dropped ) {
			$dropped_blocks[] = [
				'selector' => $block['prelude'] . ' ' . $dropped['selector'],
				'body' => $dropped['body'],
			];
		}

		if ( empty( $inner['scopes'] ) ) {
			if ( '' !== trim( $inner['wrapper'] ) ) {
				$wrapper_parts[] = $block['prelude'] . ' { ' . $inner['wrapper'] . ' }';
			}
			return;
		}

		if ( '' !== $inner['wrapper'] ) {
			$wrapper_parts[] = $block['prelude'] . ' { ' . $inner['wrapper'] . ' }';
		}

		foreach ( $inner['scopes'] as $scope_key => $scope_css ) {
			$existing = $scopes[ $scope_key ] ?? '';
			$wrapped = $block['prelude'] . ' { ' . $scope_css . ' }';

			$scopes[ $scope_key ] = '' === $existing ? $wrapped : $existing . ' ' . $wrapped;
		}
	}

	/**
	 * @param string              $selector
	 * @param array<string, true> $alias_lookup
	 */
	public static function resolve_scope_key( string $selector, array $alias_lookup ): ?string {
		$selector = trim( $selector );

		if ( '' === $selector ) {
			return null;
		}

		if ( isset( $alias_lookup[ $selector ] ) ) {
			return $selector;
		}

		if ( preg_match( '/^([a-z0-9-]+):(hover|active|focus)$/i', $selector, $matches ) ) {
			$alias = $matches[1];
			$state = strtolower( $matches[2] );

			if ( ! isset( $alias_lookup[ $alias ] ) || ! in_array( $state, self::SUPPORTED_STATES, true ) ) {
				return null;
			}

			return $alias . ':' . $state;
		}

		return null;
	}

	/**
	 * @param string $scope_key
	 * @param string $css_body
	 */
	public static function scope_to_mapper_css( string $scope_key, string $css_body ): string {
		$css_body = trim( $css_body );

		if ( '' === $css_body ) {
			return '';
		}

		if ( ! str_contains( $scope_key, ':' ) ) {
			return $css_body;
		}

		[ , $state ] = explode( ':', $scope_key, 2 );

		if ( ! in_array( $state, self::SUPPORTED_STATES, true ) ) {
			return $css_body;
		}

		return self::wrap_in_state( $css_body, $state );
	}

	/**
	 * The mapper splits breakpoints before pseudo-states, so a state block always has to sit
	 * inside its at-rule — never the other way around.
	 */
	private static function wrap_in_state( string $css_body, string $state ): string {
		$parts = [];
		$offset = 0;
		$length = strlen( $css_body );

		while ( $offset < $length ) {
			self::skip_whitespace( $css_body, $offset, $length );

			if ( $offset >= $length ) {
				break;
			}

			if ( '@' !== $css_body[ $offset ] ) {
				$at_rule_start = strpos( $css_body, '@', $offset );
				$declarations = trim( substr( $css_body, $offset, ( false === $at_rule_start ? $length : $at_rule_start ) - $offset ) );

				if ( '' !== $declarations ) {
					$parts[] = '&:' . $state . ' { ' . $declarations . ' }';
				}

				if ( false === $at_rule_start ) {
					break;
				}

				$offset = $at_rule_start;
				continue;
			}

			$block = self::read_at_rule_block( $css_body, $offset, $length );

			if ( null === $block ) {
				$parts[] = '&:' . $state . ' { ' . trim( substr( $css_body, $offset ) ) . ' }';
				break;
			}

			$parts[] = $block['prelude'] . ' { ' . self::wrap_in_state( $block['body'], $state ) . ' }';
			$offset = $block['end'];
		}

		return implode( ' ', $parts );
	}

	/**
	 * @param string              $css
	 * @param int                 $offset
	 * @param int                 $length
	 * @param array<string, true> $alias_lookup
	 * @return array{start: int, brace_pos: int, selector: string}|null
	 */
	private static function find_next_alias_block( string $css, int $offset, int $length, array $alias_lookup ): ?array {
		$aliases = array_keys( $alias_lookup );
		$at_offset_match = self::match_alias_block_at_offset( $css, $offset, $length, $aliases );
		if ( null !== $at_offset_match ) {
			return $at_offset_match;
		}

		$pattern = self::build_alias_block_pattern( $aliases );

		if ( 1 !== preg_match( $pattern, $css, $matches, PREG_OFFSET_CAPTURE, $offset ) ) {
			return null;
		}

		return self::build_alias_block_match( $css, $matches );
	}

	/**
	 * @param string   $css
	 * @param int      $offset
	 * @param int      $length
	 * @param string[] $aliases
	 * @return array{start: int, brace_pos: int, selector: string}|null
	 */
	private static function match_alias_block_at_offset( string $css, int $offset, int $length, array $aliases ): ?array {
		if ( $offset >= $length ) {
			return null;
		}

		$pattern = self::build_alias_at_offset_pattern( $aliases );

		if ( 1 !== preg_match( $pattern, substr( $css, $offset ), $matches, PREG_OFFSET_CAPTURE ) ) {
			return null;
		}

		$match_start = $offset + (int) $matches[0][1];
		$matches[0][1] = $match_start;
		$matches['alias'][1] = $offset + (int) $matches['alias'][1];
		if ( isset( $matches['state'][1] ) ) {
			$matches['state'][1] = $offset + (int) $matches['state'][1];
		}

		return self::build_alias_block_match( $css, $matches );
	}

	/**
	 * @return array{start: int, brace_pos: int, selector: string}|null
	 */
	private static function build_alias_block_match( string $css, array $matches ): ?array {
		$match_start = (int) $matches[0][1];
		$match_text = (string) $matches[0][0];
		$alias = (string) $matches['alias'][0];
		$state = isset( $matches['state'][0] ) ? (string) $matches['state'][0] : '';
		$selector = $alias . $state;
		$brace_pos = $match_start + strlen( $match_text ) - 1;

		if ( '{' !== $css[ $brace_pos ] ) {
			return null;
		}

		return [
			'start' => $match_start,
			'brace_pos' => $brace_pos,
			'selector' => $selector,
		];
	}

	/**
	 * @param string[] $aliases
	 */
	private static function build_alias_block_pattern( array $aliases ): string {
		$alias_group = self::build_quoted_alias_group( $aliases );

		return '/(?:^|[\s;}])(?P<alias>' . $alias_group . ')(?P<state>:(?:hover|active|focus))?\s*\{/i';
	}

	/**
	 * @param string[] $aliases
	 */
	private static function build_alias_at_offset_pattern( array $aliases ): string {
		$alias_group = self::build_quoted_alias_group( $aliases );

		return '/^(?P<alias>' . $alias_group . ')(?P<state>:(?:hover|active|focus))?\s*\{/i';
	}

	/**
	 * @param string[] $aliases
	 */
	private static function build_quoted_alias_group( array $aliases ): string {
		$quoted_aliases = array_map(
			static fn( string $alias ): string => preg_quote( $alias, '/' ),
			$aliases
		);

		return implode( '|', $quoted_aliases );
	}

	private static function skip_whitespace( string $css, int &$offset, int $length ): void {
		while ( $offset < $length && ctype_space( $css[ $offset ] ) ) {
			++$offset;
		}
	}

	/**
	 * @return array{body: string, end: int}|null
	 */
	private static function read_braced_block( string $css, int $open_brace, int $length ): ?array {
		if ( $open_brace >= $length || '{' !== $css[ $open_brace ] ) {
			return null;
		}

		$end = self::scanner()->find_block_end( $css, $open_brace + 1, $length );
		if ( null === $end ) {
			return null;
		}

		return [
			'body' => trim( substr( $css, $open_brace + 1, $end - $open_brace - 2 ) ),
			'end' => $end,
		];
	}

	/**
	 * @return array{raw: string, prelude: string, body: string, end: int}|null
	 */
	private static function read_at_rule_block( string $css, int $offset, int $length ): ?array {
		$open_brace = strpos( $css, '{', $offset );
		if ( false === $open_brace ) {
			return null;
		}

		$block = self::read_braced_block( $css, $open_brace, $length );
		if ( null === $block ) {
			return null;
		}

		return [
			'raw' => trim( substr( $css, $offset, $block['end'] - $offset ) ),
			'prelude' => trim( substr( $css, $offset, $open_brace - $offset ) ),
			'body' => $block['body'],
			'end' => $block['end'],
		];
	}

	private static function scanner(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}
}
