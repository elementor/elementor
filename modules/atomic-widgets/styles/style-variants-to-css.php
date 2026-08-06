<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Serializes an atomic style's variants into a single raw CSS string using the
 * MCP round-trip format: top-level declarations for desktop/no-state,
 * `&:hover / &:focus / &:active { ... }` for pseudo-state variants, and
 * `@media(--<breakpoint>) { ... }` wrappers for non-desktop breakpoints.
 *
 * The output is designed to be re-submitted verbatim to the write-side MCP
 * tools (manage-classes, manage-elements.update.style, build-composition.style)
 * in `replace` mode without loss.
 */
class Style_Variants_To_Css {

	const DESKTOP_BREAKPOINT = 'desktop';
	const PSEUDO_STATES      = [ 'hover', 'focus', 'active' ];

	public static function to_css( array $variants ): string {
		if ( empty( $variants ) ) {
			return '';
		}

		$by_breakpoint = self::group_by_breakpoint( $variants );

		$desktop_css = isset( $by_breakpoint[ self::DESKTOP_BREAKPOINT ] )
			? self::render_breakpoint( $by_breakpoint[ self::DESKTOP_BREAKPOINT ] )
			: '';

		unset( $by_breakpoint[ self::DESKTOP_BREAKPOINT ] );

		$media_blocks = [];
		foreach ( $by_breakpoint as $breakpoint => $variants_in_bp ) {
			$inner = self::render_breakpoint( $variants_in_bp );
			if ( '' === $inner ) {
				continue;
			}
			$media_blocks[] = sprintf( '@media(--%s) { %s }', $breakpoint, $inner );
		}

		return trim( trim( $desktop_css ) . ( ! empty( $media_blocks ) ? "\n" . implode( "\n", $media_blocks ) : '' ) );
	}

	private static function group_by_breakpoint( array $variants ): array {
		$grouped = [];

		foreach ( $variants as $variant ) {
			$breakpoint = $variant['meta']['breakpoint'] ?? self::DESKTOP_BREAKPOINT;
			$grouped[ $breakpoint ][] = $variant;
		}

		return $grouped;
	}

	private static function render_breakpoint( array $variants ): string {
		$base_css      = '';
		$pseudo_blocks = [];

		foreach ( $variants as $variant ) {
			$state = $variant['meta']['state'] ?? null;
			$decls = self::render_declarations( $variant );

			if ( '' === $decls ) {
				continue;
			}

			if ( null === $state ) {
				$base_css = $decls;
				continue;
			}

			if ( in_array( $state, self::PSEUDO_STATES, true ) ) {
				$pseudo_blocks[] = sprintf( '&:%s { %s }', $state, $decls );
			}
		}

		return trim( $base_css . ( ! empty( $pseudo_blocks ) ? ' ' . implode( ' ', $pseudo_blocks ) : '' ) );
	}

	private static function render_declarations( array $variant ): string {
		$parts = [];

		foreach ( Style_Props_To_Css::to_map( $variant['props'] ?? [] ) as $prop => $value ) {
			$parts[] = $prop . ': ' . $value . ';';
		}

		$custom_css = Utils::decode_string( $variant['custom_css']['raw'] ?? '', '' );
		if ( '' !== $custom_css ) {
			$parts[] = trim( $custom_css );
		}

		return implode( ' ', $parts );
	}
}
