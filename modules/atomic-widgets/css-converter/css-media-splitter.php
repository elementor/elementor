<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Media_Splitter {

	use Css_Block_Scanner_Trait;

	const DESKTOP_ALIASES = [ 'desktop', 'default' ];
	const DESKTOP_KEY     = 'desktop';
	const MEDIA_AT_LENGTH = 6;

	/** @var array */
	private array $known_breakpoints;

	public function __construct( array $known_breakpoints ) {
		$this->known_breakpoints = $known_breakpoints;
	}

	/**
	 * @return array{breakpoints: array<string, string>, custom_css: string, error: string|null}
	 */
	public function split( string $css ): array {
		$breakpoints   = [];
		$custom_blocks = [];
		$root_segments = [];

		$len           = strlen( $css );
		$i             = 0;
		$depth         = 0;
		$in_string     = false;
		$string_char   = '';
		$segment_start = 0;

		while ( $i < $len ) {
			$char = $css[ $i ];

			if ( $in_string ) {
				if ( $string_char === $char && ! $this->is_escaped( $css, $i ) ) {
					$in_string = false;
				}
				++$i;
				continue;
			}

			if ( '"' === $char || "'" === $char ) {
				$in_string   = true;
				$string_char = $char;
				++$i;
				continue;
			}

			if ( '{' === $char ) {
				++$depth;
				++$i;
				continue;
			}

			if ( '}' === $char ) {
				--$depth;
				if ( $depth < 0 ) {
					return $this->split_error( 'Unexpected closing bracket in CSS.' );
				}
				++$i;
				continue;
			}

			if ( $depth > 0 || '@' !== $char ) {
				++$i;
				continue;
			}

			if ( ! $this->is_media_at( $css, $i ) ) {
				++$i;
				continue;
			}

			$root_segments[] = substr( $css, $segment_start, $i - $segment_start );

			$j = $i + self::MEDIA_AT_LENGTH;
			while ( $j < $len && '{' !== $css[ $j ] ) {
				++$j;
			}

			if ( $j >= $len ) {
				++$i;
				$segment_start = $i;
				continue;
			}

			$raw_selector = trim( substr( $css, $i + self::MEDIA_AT_LENGTH, $j - $i - self::MEDIA_AT_LENGTH ) );
			$block_end    = $this->find_block_end( $css, $j + 1, $len );

			if ( null === $block_end ) {
				return $this->split_error( 'Unclosed @media block.' );
			}

			$block_content = trim( substr( $css, $j + 1, $block_end - $j - 2 ) );
			$segment_start = $block_end;
			$i             = $block_end;

			if ( preg_match( '/^\(\s*--([a-z0-9_-]+)\s*\)$/', $raw_selector, $matches ) ) {
				$result = $this->resolve_alias( $matches[1] );

				if ( isset( $result['error'] ) ) {
					return $this->split_error( $result['error'] );
				}

				if ( $this->contains_nested_breakpoint( $block_content ) ) {
					return $this->split_error( 'Nested breakpoints are not allowed.' );
				}

				$target                 = $result['breakpoint'];
				$breakpoints[ $target ] = isset( $breakpoints[ $target ] )
					? $breakpoints[ $target ] . ' ' . $block_content
					: $block_content;
			} else {
				$custom_blocks[] = '@media ' . $raw_selector . ' { ' . $block_content . ' }';
			}
		}

		$root_segments[] = substr( $css, $segment_start );
		$root_css        = trim( implode( '', $root_segments ) );

		if ( '' !== $root_css ) {
			$breakpoints[ self::DESKTOP_KEY ] = isset( $breakpoints[ self::DESKTOP_KEY ] )
				? $root_css . ' ' . $breakpoints[ self::DESKTOP_KEY ]
				: $root_css;
		}

		return [
			'breakpoints' => $breakpoints,
			'custom_css'  => implode( ' ', $custom_blocks ),
			'error'       => null,
		];
	}

	private function split_error( string $message ): array {
		return [
			'breakpoints' => [],
			'custom_css'  => '',
			'error'       => $message,
		];
	}

	private function contains_nested_breakpoint( string $css ): bool {
		$all_aliases = array_merge( self::DESKTOP_ALIASES, $this->known_breakpoints );
		$pattern     = '/@media\s*\(\s*--(?:' . implode( '|', array_map( 'preg_quote', $all_aliases ) ) . ')\s*\)/';

		return (bool) preg_match( $pattern, $css );
	}

	private function is_media_at( string $css, int $pos ): bool {
		if ( 0 !== strncmp( substr( $css, $pos, self::MEDIA_AT_LENGTH ), '@media', self::MEDIA_AT_LENGTH ) ) {
			return false;
		}

		$after = $pos + self::MEDIA_AT_LENGTH;
		$len   = strlen( $css );

		return $after >= $len || ! ctype_alpha( $css[ $after ] );
	}

	/**
	 * @return array{breakpoint: string}|array{error: string}
	 */
	private function resolve_alias( string $alias ): array {
		if ( in_array( $alias, self::DESKTOP_ALIASES, true ) ) {
			return [ 'breakpoint' => self::DESKTOP_KEY ];
		}

		if ( in_array( $alias, $this->known_breakpoints, true ) ) {
			return [ 'breakpoint' => $alias ];
		}

		return [ 'error' => sprintf( 'Unknown breakpoint alias: --%s.', $alias ) ];
	}
}
