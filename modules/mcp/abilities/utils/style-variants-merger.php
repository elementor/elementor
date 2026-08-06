<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Media_Splitter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Style_Variants_Merger {

	const PSEUDO_STATES = [ 'hover', 'focus', 'active' ];

	/**
	 * Matches a property declaration `name: null;` only when it is not inside
	 * a quoted string. The boundary (^|[;{]) ensures we only capture top-level
	 * declarations, not occurrences inside values like content: "color: null;".
	 * The boundary char is captured so it can be preserved in replacements.
	 */
	const NULL_DECLARATION_PATTERN = '/(^|[;{])\s*([a-zA-Z][a-zA-Z0-9-]*)\s*:\s*null\s*;?/';

	/**
	 * $get_converter is a factory callable resolved lazily — only called if the CSS split succeeds.
	 */
	public static function parse_css_string(
		string $css_string,
		array $active_breakpoints,
		int $op_index,
		string $op_action,
		Bulk_Operations_Result $results,
		callable $get_converter
	): ?array {
		$splitter = new Css_Media_Splitter( $active_breakpoints );
		$split    = $splitter->split( $css_string );

		if ( null !== $split['error'] ) {
			$results->add_error(
				$op_index,
				$op_action,
				'invalid_css',
				$split['error'] . sprintf( ' Valid breakpoints: %s.', implode( ', ', $active_breakpoints ) )
			);
			return null;
		}

		$css_converter       = $get_converter();
		$breakpoint_blocks   = [];
		$removal_breakpoints = [];

		foreach ( $split['breakpoints'] as $breakpoint => $css ) {
			if ( '' === trim( $css ) ) {
				$removal_breakpoints[] = $breakpoint;
				continue;
			}

			$result = $css_converter->parse_nested( $css );

			if ( isset( $result['error'] ) ) {
				$results->add_error( $op_index, $op_action, 'invalid_css', $result['error'] );
				return null;
			}

			$breakpoint_blocks[] = [
				'breakpoint' => $breakpoint,
				'blocks'     => $result['blocks'],
			];
		}

		return [
			'breakpoint_blocks'   => $breakpoint_blocks,
			'removal_breakpoints' => $removal_breakpoints,
		];
	}

	public static function build_variants( array $breakpoint_blocks, Css_Converter $converter ): array {
		$variants = [];

		foreach ( $breakpoint_blocks as $entry ) {
			$bp                    = $entry['breakpoint'];
			$blocks                = $entry['blocks'];
			$base_block_css        = '';
			$base_custom_css_parts = [];

			foreach ( $blocks as $block ) {
				$selector = $block['selector'];
				$css      = $block['css'];

				if ( null === $selector ) {
					$base_block_css = $css;
					continue;
				}

				$state = strtolower( ltrim( $selector, ':' ) );

				if ( ':' !== ( $selector[0] ?? '' ) || ! in_array( $state, self::PSEUDO_STATES, true ) ) {
					$base_custom_css_parts[] = '&' . $selector . ' { ' . trim( $css ) . ' }';
					continue;
				}

				$variant = self::make_variant( $bp, $state, $css, $converter );
				if ( null !== $variant ) {
					$variants[] = $variant;
				}
			}

			$base_variant = self::make_variant( $bp, null, $base_block_css, $converter, $base_custom_css_parts );
			if ( null !== $base_variant ) {
				$variants[] = $base_variant;
			}
		}

		return $variants;
	}

	public static function apply_mode( array $existing, array $new_variants, string $mode, array $affected_breakpoints ): array {
		if ( 'replace' === $mode ) {
			$kept      = array_values(
				array_filter( $existing, fn( $v ) => ! in_array( $v['meta']['breakpoint'] ?? null, $affected_breakpoints, true ) )
			);
			$clean_new = array_values(
				array_filter(
					array_map(
						function ( $v ) {
							unset( $v['null_props'] );
							return $v;
						},
						$new_variants
					),
					fn( $v ) => ! empty( $v['props'] ) || ! empty( $v['custom_css'] )
				)
			);
			return array_merge( $kept, $clean_new );
		}

		$result = $existing;

		foreach ( $new_variants as $new_variant ) {
			$bp    = $new_variant['meta']['breakpoint'] ?? null;
			$state = $new_variant['meta']['state'] ?? null;
			$match = null;

			foreach ( $result as $i => $v ) {
				if ( ( $v['meta']['breakpoint'] ?? null ) === $bp && ( $v['meta']['state'] ?? null ) === $state ) {
					$match = $i;
					break;
				}
			}

			if ( null === $match ) {
				$clean = $new_variant;
				unset( $clean['null_props'] );
				if ( ! empty( $clean['props'] ) || ! empty( $clean['custom_css'] ) ) {
					$result[] = $clean;
				}
				continue;
			}

			$variant_null_props  = $new_variant['null_props'] ?? [];
			$wipe_all            = in_array( 'all', $variant_null_props, true );
			$props_to_remove     = array_filter( $variant_null_props, fn( $k ) => 'all' !== $k );

			$merged_props = $wipe_all
				? ( $new_variant['props'] ?? [] )
				: array_merge( $result[ $match ]['props'] ?? [], $new_variant['props'] ?? [] );

			foreach ( $props_to_remove as $key ) {
				unset( $merged_props[ $key ] );
			}

			$merged_props = array_filter( $merged_props, fn( $v ) => null !== $v );

			$merged_custom_css = $wipe_all
				? ( $new_variant['custom_css'] ?? null )
				: self::merge_custom_css( $result[ $match ]['custom_css'] ?? null, $new_variant['custom_css'] ?? null );

			if ( empty( $merged_props ) && null === $merged_custom_css ) {
				unset( $result[ $match ] );
				$result = array_values( $result );
				continue;
			}

			$result[ $match ]['props']      = $merged_props;
			$result[ $match ]['custom_css'] = $merged_custom_css;
			unset( $result[ $match ]['null_props'] );
		}

		return $result;
	}

	public static function merge_custom_css( ?array $existing, ?array $incoming ): ?array {
		$existing_raw = isset( $existing['raw'] ) ? base64_decode( $existing['raw'] ) : ''; // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode -- Decoding stored base64 custom_css for merge.
		$incoming_raw = isset( $incoming['raw'] ) ? base64_decode( $incoming['raw'] ) : ''; // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode -- Decoding stored base64 custom_css for merge.

		$merged = trim( $existing_raw . ' ' . $incoming_raw );

		return '' !== $merged
			? [ 'raw' => base64_encode( $merged ) ] // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Storing merged custom_css as base64.
			: null;
	}

	private static function make_variant( string $breakpoint, ?string $state, string $css, Css_Converter $converter, array $extra_custom_css_parts = [] ): ?array {
		$null_props   = self::extract_null_props( $css );
		$stripped_css = self::strip_null_declarations( $css );
		$result       = $converter->convert( $stripped_css );
		$props        = $result['props'] ?? [];
		$custom_str   = $result['customCss'] ?? '';

		if ( ! empty( $extra_custom_css_parts ) ) {
			$extra      = implode( ' ', $extra_custom_css_parts );
			$custom_str = '' !== $custom_str ? $custom_str . ' ' . $extra : $extra;
		}

		if ( empty( $props ) && '' === $custom_str && empty( $null_props ) ) {
			return null;
		}

		return [
			'meta'       => [
				'breakpoint' => $breakpoint,
				'state'      => $state,
			],
			'props'      => $props,
			'custom_css' => '' !== $custom_str
				? [ 'raw' => base64_encode( $custom_str ) ] // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Global class custom_css.raw is stored as base64.
				: null,
			'null_props' => $null_props,
		];
	}

	private static function extract_null_props( string $css ): array {
		$null_props = [];
		preg_replace_callback(
			self::NULL_DECLARATION_PATTERN,
			function ( $matches ) use ( &$null_props ) {
				$null_props[] = $matches[2];
			},
			$css
		);
		return $null_props;
	}

	private static function strip_null_declarations( string $css ): string {
		return (string) preg_replace( self::NULL_DECLARATION_PATTERN, '$1', $css );
	}
}
