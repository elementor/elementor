<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Block_Scanner_Trait;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Splits a CSS string into wrapper declarations and inner-element scoped blocks.
 */
class V3_Scoped_Css_Splitter {

	use Css_Block_Scanner_Trait;

	const SUPPORTED_STATES = [ 'hover', 'active', 'focus' ];

	private static ?self $instance = null;

	/**
	 * @param string   $css_string
	 * @param string[] $inner_element_aliases
	 * @return array{wrapper: string, scopes: array<string, string>}
	 */
	public static function split( string $css_string, array $inner_element_aliases ): array {
		$css_string = trim( $css_string );

		if ( '' === $css_string || empty( $inner_element_aliases ) ) {
			return [
				'wrapper' => $css_string,
				'scopes' => [],
			];
		}

		$alias_lookup = array_fill_keys( $inner_element_aliases, true );
		$wrapper_parts = [];
		$scopes = [];
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
					$wrapper_parts[] = substr( $css_string, $offset );
					break;
				}

				$wrapper_parts[] = $block['raw'];
				$offset = $block['end'];
				continue;
			}

			$next_alias = self::find_next_alias_block( $css_string, $offset, $length, $alias_lookup );

			if ( null === $next_alias ) {
				$remainder = trim( substr( $css_string, $offset ) );
				if ( '' !== $remainder ) {
					$wrapper_parts[] = $remainder;
				}
				break;
			}

			if ( $next_alias['start'] > $offset ) {
				$declarations = trim( substr( $css_string, $offset, $next_alias['start'] - $offset ) );
				if ( '' !== $declarations ) {
					$wrapper_parts[] = $declarations;
				}
			}

			$block = self::read_braced_block( $css_string, $next_alias['brace_pos'], $length );
			if ( null === $block ) {
				$wrapper_parts[] = trim( substr( $css_string, $next_alias['start'] ) );
				break;
			}

			$scope_key = self::resolve_scope_key( $next_alias['selector'], $alias_lookup );
			if ( null === $scope_key ) {
				$wrapper_parts[] = trim( $next_alias['selector'] . ' { ' . $block['body'] . ' }' );
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
		];
	}

	/**
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
	 * @param array<string, string> $scopes
	 */
	public static function scope_to_mapper_css( string $scope_key, string $css_body ): string {
		$css_body = trim( $css_body );

		if ( '' === $css_body ) {
			return '';
		}

		if ( ! str_contains( $scope_key, ':' ) ) {
			return $css_body;
		}

		[ $alias, $state ] = explode( ':', $scope_key, 2 );

		if ( ! in_array( $state, self::SUPPORTED_STATES, true ) ) {
			return $css_body;
		}

		unset( $alias );

		return '&:' . $state . ' { ' . $css_body . ' }';
	}

	/**
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
	 * @return array{raw: string, end: int}|null
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
