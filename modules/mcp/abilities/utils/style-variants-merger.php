<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Style_Variants_Merger {

	const PSEUDO_STATES = [ 'hover', 'focus', 'active' ];

	const NULL_DECLARATION_PATTERN = '/([a-zA-Z][a-zA-Z0-9-]*)\s*:\s*null\s*;?/';

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

				$state = ltrim( $selector, ':' );

				if ( in_array( $state, self::PSEUDO_STATES, true ) ) {
					$null_props     = self::extract_null_props( $css );
					$stripped_css   = self::strip_null_declarations( $css );
					$result         = $converter->convert( $stripped_css );
					$props          = $result['props'] ?? [];
					$custom_css_str = $result['customCss'] ?? '';

					if ( empty( $props ) && '' === $custom_css_str && empty( $null_props ) ) {
						continue;
					}

					$variants[] = [
						'meta'       => [
							'breakpoint' => $bp,
							'state'      => $state,
						],
						'props'      => $props,
						'custom_css' => '' !== $custom_css_str
							? [ 'raw' => base64_encode( $custom_css_str ) ] // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Global class custom_css.raw is stored as base64.
							: null,
						'null_props' => $null_props,
					];
					continue;
				}

				$base_custom_css_parts[] = '&' . $selector . ' { ' . trim( $css ) . ' }';
			}

			$base_null_props = self::extract_null_props( $base_block_css );
			$base_block_css  = self::strip_null_declarations( $base_block_css );
			$base_result     = $converter->convert( $base_block_css );
			$base_props      = $base_result['props'] ?? [];
			$base_custom_str = $base_result['customCss'] ?? '';

			if ( ! empty( $base_custom_css_parts ) ) {
				$extra           = implode( ' ', $base_custom_css_parts );
				$base_custom_str = '' !== $base_custom_str ? $base_custom_str . ' ' . $extra : $extra;
			}

			if ( empty( $base_props ) && '' === $base_custom_str && empty( $base_null_props ) ) {
				continue;
			}

			$variants[] = [
				'meta'       => [
					'breakpoint' => $bp,
					'state'      => null,
				],
				'props'      => $base_props,
				'custom_css' => '' !== $base_custom_str
					? [ 'raw' => base64_encode( $base_custom_str ) ] // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Global class custom_css.raw is stored as base64.
					: null,
				'null_props' => $base_null_props,
			];
		}

		return $variants;
	}

	public static function apply_mode( array $existing, array $new_variants, string $mode, array $affected_breakpoints, array $props_to_remove = [] ): array {
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
			$all_props_to_remove = array_merge(
				$props_to_remove,
				array_filter( $variant_null_props, fn( $k ) => 'all' !== $k )
			);

			$merged_props = $wipe_all
				? ( $new_variant['props'] ?? [] )
				: array_merge( $result[ $match ]['props'] ?? [], $new_variant['props'] ?? [] );

			foreach ( $all_props_to_remove as $key ) {
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

	public static function extract_null_reset_props( array $css ): array {
		return array_keys(
			array_filter( $css, fn( $v ) => null === $v || 'null' === $v )
		);
	}

	public static function merge_custom_css( ?array $existing, ?array $incoming ): ?array {
		$existing_raw = isset( $existing['raw'] ) ? base64_decode( $existing['raw'] ) : ''; // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode -- Decoding stored base64 custom_css for merge.
		$incoming_raw = isset( $incoming['raw'] ) ? base64_decode( $incoming['raw'] ) : ''; // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode -- Decoding stored base64 custom_css for merge.

		$merged = trim( $existing_raw . ' ' . $incoming_raw );

		return '' !== $merged
			? [ 'raw' => base64_encode( $merged ) ] // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Storing merged custom_css as base64.
			: null;
	}

	private static function extract_null_props( string $css ): array {
		$null_props = [];
		preg_replace_callback(
			self::NULL_DECLARATION_PATTERN,
			function ( $matches ) use ( &$null_props ) {
				$null_props[] = $matches[1];
			},
			$css
		);
		return $null_props;
	}

	private static function strip_null_declarations( string $css ): string {
		return (string) preg_replace( self::NULL_DECLARATION_PATTERN, '', $css );
	}
}
