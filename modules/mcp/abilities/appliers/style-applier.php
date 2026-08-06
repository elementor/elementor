<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\Mcp\Abilities\Utils\Bulk_Operations_Result;
use Elementor\Modules\Mcp\Abilities\Utils\Style_Variants_Merger;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Style_Applier {

	const LOCAL_STYLE_ID_PREFIX = 'e-';
	const DESKTOP_BREAKPOINT = 'desktop';
	const LOCAL_STYLE_LABEL = 'local';
	const LOCAL_STYLE_TYPE = 'class';

	private Css_Converter $css_converter;
	private array $active_breakpoints;

	public function __construct( Css_Converter $css_converter, array $active_breakpoints = [] ) {
		$this->css_converter      = $css_converter;
		$this->active_breakpoints = $active_breakpoints;
	}

	/**
	 * @param array<string, array&> $config_id_index Index of subtree refs.
	 * @param array<string, string> $styles          Per-config-id CSS strings.
	 * @return array{error: \WP_Error|null, warnings: string[]}
	 */
	public function apply( array $config_id_index, array $styles, string $style_apply_mode = 'patch' ): array {
		if ( empty( $styles ) ) {
			return [
				'error'    => null,
				'warnings' => [],
			];
		}

		$active_breakpoints = $this->get_active_breakpoints();
		$errors             = [];
		$warnings           = [];

		foreach ( $styles as $config_id => $css_string ) {
			if ( ! is_string( $css_string ) ) {
				$errors[] = sprintf( '[%s] style must be a CSS string, got %s.', $config_id, gettype( $css_string ) );
				continue;
			}

			if ( ! isset( $config_id_index[ $config_id ] ) ) {
				continue;
			}

			$node = &$config_id_index[ $config_id ];

			if ( V3_Node_Bridge::is_v3_node( $node ) ) {
				$warning = V3_Node_Bridge::apply_custom_css( $node, $css_string );
				if ( null !== $warning ) {
					$warnings[] = sprintf( '[%s] %s', $config_id, $warning );
				}
				unset( $node );
				continue;
			}

			$is_empty_css = '' === trim( $css_string );

			if ( $is_empty_css ) {
				if ( 'replace' === $style_apply_mode ) {
					$existing_style_id = $this->find_existing_local_style_id( $node );
					if ( $existing_style_id ) {
						$node['styles'][ $existing_style_id ]['variants'] = [];
					}
				}
				unset( $node );
				continue;
			}

			$parse_results = new Bulk_Operations_Result();
			$parsed        = Style_Variants_Merger::parse_css_string(
				$css_string,
				$active_breakpoints,
				0,
				'update',
				$parse_results,
				fn() => $this->css_converter
			);

			if ( null === $parsed ) {
				$result_data = $parse_results->to_array();
				$errors[]    = sprintf( '[%s] %s', $config_id, $result_data['results'][0]['message'] ?? 'CSS parse error.' );
				unset( $node );
				continue;
			}

			$new_variants           = Style_Variants_Merger::build_variants( $parsed['breakpoint_blocks'], $this->css_converter );
			$affected_bps           = array_column( $parsed['breakpoint_blocks'], 'breakpoint' );
			$removal_bps            = $parsed['removal_breakpoints'];
			$existing_style_id      = $this->find_existing_local_style_id( $node );
			$existing_variants      = $node['styles'][ $existing_style_id ]['variants'] ?? [];
			$existing_after_removal = array_values(
				array_filter( $existing_variants, fn( $v ) => ! in_array( $v['meta']['breakpoint'] ?? null, $removal_bps, true ) )
			);

			$merged_variants = Style_Variants_Merger::apply_mode(
				$existing_after_removal,
				$new_variants,
				$style_apply_mode,
				$affected_bps
			);

			$this->write_variants_to_node( $node, $merged_variants, $existing_style_id );
			unset( $node );
		}

		return [
			'error'    => $errors ? new \WP_Error(
				'elementor_invalid_styles',
				implode( ' ', $errors ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			) : null,
			'warnings' => $warnings,
		];
	}

	private function get_active_breakpoints(): array {
		if ( ! empty( $this->active_breakpoints ) ) {
			return $this->active_breakpoints;
		}
		return array_keys( Plugin::$instance->breakpoints->get_active_breakpoints() );
	}

	private function write_variants_to_node( array &$node, array $merged_variants, ?string $existing_style_id ): void {
		if ( $existing_style_id ) {
			$node['styles'][ $existing_style_id ]['variants'] = $merged_variants;
			return;
		}

		if ( empty( $merged_variants ) ) {
			return;
		}

		$style_id              = $this->generate_local_style_id();
		$node['styles']        = $node['styles'] ?? [];
		$node['styles'][ $style_id ] = [
			'id'       => $style_id,
			'label'    => self::LOCAL_STYLE_LABEL,
			'type'     => self::LOCAL_STYLE_TYPE,
			'variants' => $merged_variants,
		];
		$node['settings'] = $this->add_style_to_classes( $node['settings'] ?? [], $style_id );
	}

	private function find_existing_local_style_id( array $node ): ?string {
		foreach ( $node['styles'] ?? [] as $style_id => $_style ) {
			if ( str_starts_with( (string) $style_id, self::LOCAL_STYLE_ID_PREFIX ) ) {
				return $style_id;
			}
		}
		return null;
	}

	private function add_style_to_classes( array $settings, string $style_id ): array {
		$existing = $settings['classes']['value'] ?? [];
		if ( ! is_array( $existing ) ) {
			$existing = [];
		}
		if ( ! in_array( $style_id, $existing, true ) ) {
			$existing[] = $style_id;
		}

		$settings['classes'] = [
			'$$type' => 'classes',
			'value'  => array_values( $existing ),
		];

		return $settings;
	}

	private function generate_local_style_id(): string {
		return self::LOCAL_STYLE_ID_PREFIX . strtolower( \Elementor\Utils::generate_random_string() ) . '-' . dechex( wp_rand( 0x1000, 0xffff ) );
	}
}
