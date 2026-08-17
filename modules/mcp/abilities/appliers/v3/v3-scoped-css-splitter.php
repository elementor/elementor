<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Splits a CSS string into wrapper declarations and inner-element scoped blocks.
 */
class V3_Scoped_Css_Splitter {

	const SUPPORTED_STATES = [ 'hover', 'active', 'focus' ];

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

			$selector_end = strpos( $css_string, '{', $offset );
			if ( false === $selector_end ) {
				$wrapper_parts[] = trim( substr( $css_string, $offset ) );
				break;
			}

			$selector = trim( substr( $css_string, $offset, $selector_end - $offset ) );
			$block = self::read_braced_block( $css_string, $selector_end, $length );
			if ( null === $block ) {
				$wrapper_parts[] = trim( substr( $css_string, $offset ) );
				break;
			}

			$scope_key = self::resolve_scope_key( $selector, $alias_lookup );
			if ( null === $scope_key ) {
				$wrapper_parts[] = trim( $selector . ' { ' . $block['body'] . ' }' );
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

		$depth = 0;

		for ( $index = $open_brace; $index < $length; ++$index ) {
			$char = $css[ $index ];

			if ( '{' === $char ) {
				++$depth;
				continue;
			}

			if ( '}' !== $char ) {
				continue;
			}

			--$depth;

			if ( 0 !== $depth ) {
				continue;
			}

			return [
				'body' => trim( substr( $css, $open_brace + 1, $index - $open_brace - 1 ) ),
				'end' => $index + 1,
			];
		}

		return null;
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
}
