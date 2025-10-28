<?php
/**
 * BACKUP: CSS Preprocessing Methods from Unified_Widget_Conversion_Service
 * 
 * Date: October 25, 2025
 * Status: DELETED - These methods were removed during registry pattern refactoring
 * Reason: Broken functionality that destroys CSS values
 * 
 * Original Location: unified-widget-conversion-service.php:244-483
 * 
 * CRITICAL ISSUES:
 * - Destroys font-family values: "freight-text-pro" → 0, Sans-serif
 * - Breaks CSS variables: var(--e-global-color) → 0  
 * - Mangles calc(): calc(100% - 20px) → 100%
 * - Creates "drunk styling" with broken values
 * 
 * These methods need complete rewrite (25-28 hours) per CSS-CLEANING.md PRD
 * Parser success rate: 37/38 files (97%) - preprocessing not essential
 */

namespace Elementor\Modules\CssConverter\Services\Widgets;

/**
 * DELETED METHOD: clean_css_for_parser()
 * Original lines: 244-301 (57 lines)
 */
private function clean_css_for_parser( string $css ): string {
	if ( empty( $css ) ) {
		return $css;
	}

	$css = preg_replace( '/\/\*.*?\*\//s', '', $css );

	// FILTER: Remove media queries BEFORE parsing (desktop-only CSS)
	$css = $this->filter_out_media_queries( $css );

	$css = $this->replace_calc_expressions( $css );

	$css = $this->add_newlines_to_minified_css( $css );

	$css = $this->fix_broken_property_values( $css );

	$lines = explode( "\n", $css );
	$clean_lines = [];
	$brace_count = 0;

	foreach ( $lines as $line ) {
		$line = trim( $line );

		if ( empty( $line ) ) {
			continue;
		}

		if ( false !== strpos( $line, 'calc' ) ) {
			$line = preg_replace( '/calc\s*\([^)]*\)/', '100%', $line );
			$line = preg_replace( '/calc\s*\([^)]*\)/', '100%', $line );
		}

		$brace_count += substr_count( $line, '{' );
		$brace_count -= substr_count( $line, '}' );

		$brace_pos = strpos( $line, '{' );
		if ( false !== $brace_pos ) {
			$property_part = substr( $line, $brace_pos );
			$open_parens = substr_count( $property_part, '(' );
			$close_parens = substr_count( $property_part, ')' );

			if ( $open_parens !== $close_parens ) {
				$brace_count -= substr_count( $line, '{' );
				$brace_count += substr_count( $line, '}' );
				continue;
			}
		}

		$clean_lines[] = $line;
	}

	while ( 0 < $brace_count ) {
		$clean_lines[] = '}';
		--$brace_count;
	}

	return implode( "\n", $clean_lines );
}

/**
 * DELETED METHOD: filter_out_media_queries()
 * Original lines: 303-370 (67 lines)
 */
private function filter_out_media_queries( string $css ): string {
	// Remove all @media blocks from CSS to focus on desktop-only styles
	// Handle both formatted and minified CSS

	// Method 1: Use regex to remove @media blocks (handles minified CSS)
	$original_length = strlen( $css );

	// Remove @media blocks using regex (handles nested braces correctly)
	$css = preg_replace_callback(
		'/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/s',
		function() {
			return '';
		},
		$css
	);

	// Handle nested media queries (up to 3 levels deep)
	for ( $i = 0; $i < 3; $i++ ) {
		$css = preg_replace_callback(
			'/@media[^{]*\{(?:[^{}]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\})*[^{}]*\}/s',
			function() {
				return '';
			},
			$css
		);
	}

	$filtered_length = strlen( $css );
	$bytes_removed = $original_length - $filtered_length;

	$percentage = $original_length > 0 ? round( ( $bytes_removed / $original_length ) * 100, 1 ) : 0;

	// Method 2: Line-by-line filtering for any remaining @media (fallback)
	$filtered_css = '';
	$lines = explode( "\n", $css );
	$inside_media_query = false;
	$media_brace_count = 0;
	$filtered_count = 0;
	$total_media_blocks = 0;

	foreach ( $lines as $line_num => $line ) {
		$trimmed = trim( $line );

		if ( preg_match( '/@media\s+/', $trimmed ) ) {
			$inside_media_query = true;
			$media_brace_count = 0;
			++$total_media_blocks;
			continue;
		}

		// If we're inside a media query, track braces
		if ( $inside_media_query ) {
			$media_brace_count += substr_count( $line, '{' );
			$media_brace_count -= substr_count( $line, '}' );

			if ( $media_brace_count <= 0 ) {
				$inside_media_query = false;
				++$filtered_count;
			}
			continue;
		}

		// Keep non-media query lines
		$filtered_css .= $line . "\n";
	}

	return $filtered_css;
}

/**
 * DELETED METHOD: replace_calc_expressions()
 * Original lines: 372-399 (27 lines)
 */
private function replace_calc_expressions( string $css ): string {
	for ( $i = 0; $i < 5; ++$i ) {
		$css = $this->preserve_elementor_variables( $css );
		$css = preg_replace( '/env\s*\([^()]*\)/', '0', $css );
		$css = preg_replace( '/min\s*\([^()]*\)/', '0', $css );
		$css = preg_replace( '/max\s*\([^()]*\)/', '100%', $css );
		$css = preg_replace( '/clamp\s*\([^()]*\)/', '50%', $css );
	}

	for ( $i = 0; $i < 5; ++$i ) ) {
		$css = preg_replace( '/calc\s*\([^()]*\)/', '100%', $css );
	}

	$css = preg_replace( '/--[^:]+:\s*[^;]*calc[^;]*;/', '', $css );
	$css = preg_replace( '/\*[a-zA-Z_-]+\s*:\s*[^;]+;/', '', $css );
	$css = preg_replace( '/\{\s*\}/', '', $css );

	$css = preg_replace( '/:\s*100%([^;}]+)/', ': 100%;', $css );

	$css = preg_replace( '/\s+/', ' ', $css );

	$css = str_replace( '%)}', '%; }', $css );
	$css = str_replace( '%).', '%; .', $css );
	$css = str_replace( '%)#', '%; #', $css );
	$css = $this->fix_broken_css_values( $css );

	return $css;
}

/**
 * DELETED METHOD: preserve_elementor_variables()
 * Original lines: 401-421 (20 lines)
 */
private function preserve_elementor_variables( string $css ): string {
	$css = preg_replace_callback(
		'/var\s*\([^()]*\)/',
		function( $matches ) {
			$var_call = $matches[0];

			if ( preg_match( '/var\s*\(\s*(--[^,)]+)/', $var_call, $var_matches ) ) {
				$var_name = trim( $var_matches[1] );

				if ( $this->should_preserve_css_variable( $var_name ) ) {
					return $var_call;
				}
			}

			return ' 0';
		},
		$css
	);

	return $css;
}

/**
 * DELETED METHOD: should_preserve_css_variable()
 * Original lines: 423-439 (16 lines)
 */
private function should_preserve_css_variable( string $var_name ): bool {
	// Always preserve Elementor global variables
	if ( false !== strpos( $var_name, '--e-global-' ) ) {
		return true;
	}

	if ( false !== strpos( $var_name, '--elementor-' ) ) {
		return true;
	}

	// Preserve Elementor theme variables
	if ( false !== strpos( $var_name, '--e-theme-' ) ) {
		return true;
	}

	return false;
}

/**
 * DELETED METHOD: fix_broken_css_values()
 * Original lines: 441-458 (17 lines)
 */
private function fix_broken_css_values( string $css ): string {
	// Fix broken font-size values like "15.rem" -> "15rem"
	$css = preg_replace( '/(\d+)\.rem\b/', '$1rem', $css );

	// Fix broken spacing around var() like "0var(" -> "0 var("
	$css = preg_replace( '/(\d+)var\(/', '$1 var(', $css );

	// Convert background: none to background: transparent
	$css = preg_replace( '/background:\s*none\s*;/', 'background: transparent;', $css );
	$css = preg_replace( '/background-color:\s*none\s*;/', 'background-color: transparent;', $css );

	// Fix other common broken values
	$css = preg_replace( '/(\d+)\.px\b/', '$1px', $css ); // Fix "15.px" -> "15px"
	$css = preg_replace( '/(\d+)\.em\b/', '$1em', $css ); // Fix "1.5.em" -> "1.5em"
	$css = preg_replace( '/(\d+)\.%\b/', '$1%', $css );   // Fix "100.%" -> "100%"

	return $css;
}

/**
 * DELETED METHOD: fix_broken_property_values()
 * Original lines: 460-469 (9 lines)
 */
private function fix_broken_property_values( string $css ): string {
	$css = str_replace( "\r\n", "\n", $css );
	$css = str_replace( "\r", "\n", $css );

	$css = preg_replace( '/:\s*([^;{}\n]+)\n+\s*;/', ': $1;', $css );

	$css = preg_replace( '/:\s*([^;{}\n]+)\n+\s*([^;{}\n]+);/', ': $1 $2;', $css );

	return $css;
}

/**
 * DELETED METHOD: add_newlines_to_minified_css()
 * Original lines: 471-483 (12 lines)
 */
private function add_newlines_to_minified_css( string $css ): string {
	$css = str_replace( ';}', ";\n}\n", $css );

	$css = preg_replace( '/\}([.#@a-zA-Z])/', "}\n$1", $css );

	$css = preg_replace( '/\}(\})/', "$1\n", $css );

	$css = preg_replace( '/([^}])\s*@media/', "$1\n@media", $css );

	$css = preg_replace( '/([^}])\s*@font-face/', "$1\n@font-face", $css );

	return $css;
}
