<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Media_Query_Filter_Processor implements Css_Processor_Interface {

	public function get_processor_name(): string {
		return 'media_query_filter';
	}

	public function get_priority(): int {
		return 5; // Run BEFORE CSS parsing to filter raw CSS
	}

	public function get_statistics_keys(): array {
		return [
			'media_query_rules_filtered',
			'desktop_rules_remaining',
		];
	}

	public function supports_context( Css_Processing_Context $context ): bool {
		$css = $context->get_metadata( 'css', '' );
		return ! empty( $css );
	}

	public function process( Css_Processing_Context $context ): Css_Processing_Context {
		$css = $context->get_metadata( 'css', '' );

		if ( empty( $css ) ) {
			$context->add_statistic( 'media_query_rules_filtered', 0 );
			$context->add_statistic( 'desktop_rules_remaining', 0 );
			return $context;
		}

		$original_length = strlen( $css );
		$filtered_css = $this->filter_out_media_queries( $css );
		$filtered_length = strlen( $filtered_css );
		$bytes_removed = $original_length - $filtered_length;

		// Update context with filtered CSS
		$context->set_metadata( 'css', $filtered_css );

		// Add statistics
		$context->add_statistic( 'media_query_rules_filtered', $bytes_removed );
		$context->add_statistic( 'desktop_rules_remaining', $filtered_length );

		// Debug logging
		$percentage = $original_length > 0 ? round( ( $bytes_removed / $original_length ) * 100, 1 ) : 0;
		error_log( 'MEDIA_QUERY_FILTER: Filtered ' . $bytes_removed . ' bytes (' . $percentage . '%) of media queries' );

		// DEBUG: Check if target selector is still present
		$target_selector = '.elementor-1140 .elementor-element.elementor-element-6d397c1';
		if ( strpos( $filtered_css, $target_selector ) !== false ) {
			error_log( 'MEDIA_QUERY_FILTER: Target selector preserved in filtered CSS' );
		} else {
			error_log( 'MEDIA_QUERY_FILTER: Target selector NOT FOUND in filtered CSS' );
		}
		
		// DEBUG: Check if reset CSS is still present
		$reset_patterns = ['html,body,div,span', 'html, body, div, span'];
		$reset_preserved = false;
		foreach ( $reset_patterns as $pattern ) {
			if ( strpos( $filtered_css, $pattern ) !== false ) {
				$reset_preserved = true;
				error_log( "MEDIA_QUERY_FILTER: Reset CSS preserved in filtered CSS (pattern: {$pattern})" );
				break;
			}
		}
		if ( ! $reset_preserved ) {
			error_log( 'MEDIA_QUERY_FILTER: Reset CSS NOT FOUND in filtered CSS' );
		}

		return $context;
	}

	private function filter_out_media_queries( string $css ): string {
		// Remove all @media blocks from CSS to focus on desktop-only styles
		// Handle both formatted and minified CSS

		// STEP 1: Extract and preserve reset CSS rules before filtering
		$reset_css_rules = [];
		$reset_patterns = [
			'/html,body,div,span[^{]*\{[^}]*\}/s',
			'/html, body, div, span[^{]*\{[^}]*\}/s',
			'/html,body[^{]*\{[^}]*\}/s'
		];
		
		// DEBUG: Check if reset CSS exists in the CSS before extraction
		$has_reset_before = false;
		foreach ( ['html,body,div,span', 'html, body, div, span', 'html,body'] as $check_pattern ) {
			if ( strpos( $css, $check_pattern ) !== false ) {
				$has_reset_before = true;
				error_log( "MEDIA_QUERY_FILTER: Reset CSS found in input CSS (pattern: {$check_pattern})" );
				break;
			}
		}
		if ( ! $has_reset_before ) {
			error_log( "MEDIA_QUERY_FILTER: No reset CSS found in input CSS" );
		}
		
		foreach ( $reset_patterns as $pattern ) {
			if ( preg_match( $pattern, $css, $matches ) ) {
				$reset_css_rules[] = $matches[0];
				error_log( "MEDIA_QUERY_FILTER: Extracted reset CSS rule: " . substr( $matches[0], 0, 100 ) . "..." );
				// Temporarily remove it to prevent accidental filtering
				$css = str_replace( $matches[0], '/*RESET_CSS_PLACEHOLDER*/', $css );
			}
		}

		// Method 1: Use regex to remove @media blocks (handles minified CSS)
		// FIXED: Add validation to ensure we only remove actual @media rules
		$css = preg_replace_callback(
			'/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/s',
			function( $matches ) {
				$match = $matches[0];
				// Only remove if it actually starts with @media
				if ( strpos( trim( $match ), '@media' ) === 0 ) {
					error_log( "MEDIA_QUERY_FILTER: Removing @media rule: " . substr( $match, 0, 100 ) . "..." );
					return '';
				}
				// Preserve non-@media rules that were accidentally matched
				error_log( "MEDIA_QUERY_FILTER: Preserving non-@media rule: " . substr( $match, 0, 100 ) . "..." );
				return $match;
			},
			$css
		);

		// Handle nested media queries (up to 3 levels deep)
		for ( $i = 0; $i < 3; $i++ ) {
			$css = preg_replace_callback(
				'/@media[^{]*\{(?:[^{}]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\})*[^{}]*\}/s',
				function( $matches ) {
					$match = $matches[0];
					// Only remove if it actually starts with @media
					if ( strpos( trim( $match ), '@media' ) === 0 ) {
						return '';
					}
					// Preserve non-@media rules
					return $match;
				},
				$css
			);
		}

		// Method 2: Line-by-line filtering for any remaining @media (fallback)
		$filtered_css = '';
		$lines = explode( "\n", $css );
		$inside_media_query = false;
		$media_brace_count = 0;

		foreach ( $lines as $line ) {
			$trimmed = trim( $line );

			if ( preg_match( '/@media\s+/', $trimmed ) ) {
				$inside_media_query = true;
				$media_brace_count = 0;
				continue;
			}

			if ( $inside_media_query ) {
				// Count opening and closing braces
				$media_brace_count += substr_count( $line, '{' );
				$media_brace_count -= substr_count( $line, '}' );

				// If brace count reaches 0 or below, we've exited the media query
				if ( $media_brace_count <= 0 ) {
					$inside_media_query = false;
				}
				continue;
			}

		// Keep non-media query lines
		$filtered_css .= $line . "\n";
	}

	// STEP 3: Restore preserved reset CSS rules
	foreach ( $reset_css_rules as $reset_rule ) {
		$filtered_css = str_replace( '/*RESET_CSS_PLACEHOLDER*/', $reset_rule, $filtered_css );
		error_log( "MEDIA_QUERY_FILTER: Restored reset CSS rule: " . substr( $reset_rule, 0, 100 ) . "..." );
	}

	return $filtered_css;
	}
}
