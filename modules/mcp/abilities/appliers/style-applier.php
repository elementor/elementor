<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper_Factory;
use Elementor\Modules\Mcp\Abilities\Utils\Bulk_Operations_Result;
use Elementor\Modules\Mcp\Abilities\Utils\Style_Variants_Merger;
use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;
use Elementor\Modules\Variables\Utils\Variable_Type_Keys;
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
	 * @param string                $style_apply_mode `patch` or `replace`.
	 * @param array<string, array>  $widget_configs  Optional widget_type => config map (used for V3 mapping).
	 * @return array{error: \WP_Error|null, warnings: string[], variable_connections: array<string, array<string, string>>}
	 */
	public function apply( array $config_id_index, array $styles, string $style_apply_mode = 'patch', array $widget_configs = [] ): array {
		if ( empty( $styles ) ) {
			return [
				'error'               => null,
				'warnings'            => [],
				'warning_codes'       => [],
				'variable_connections' => [],
			];
		}

		$active_breakpoints    = $this->get_active_breakpoints();
		$errors                = [];
		$warnings              = [];
		$warning_codes         = [];
		$variable_connections  = [];

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
				$v3_result = $this->apply_v3_style( $node, $css_string, $style_apply_mode, $widget_configs );
				foreach ( $v3_result['warnings'] as $warning ) {
					$warnings[] = sprintf( '[%s] %s', $config_id, $warning );
				}
				$warning_codes = array_merge( $warning_codes, $v3_result['codes'] );
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

			$variable_connections[ $config_id ] = $this->collect_variable_connections( $new_variants );

			$this->write_variants_to_node( $node, $merged_variants, $existing_style_id );
			unset( $node );
		}

		return [
			'error'               => $errors ? new \WP_Error(
				'elementor_invalid_styles',
				implode( ' ', $errors ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			) : null,
			'warnings'            => $warnings,
			'warning_codes'       => array_values( array_unique( $warning_codes ) ),
			'variable_connections' => $variable_connections,
		];
	}

	/**
	 * @param array                $node
	 * @param string               $css_string
	 * @param string               $style_apply_mode
	 * @param array<string, array> $widget_configs
	 * @return array{warnings: string[], codes: string[]} Warnings (without config-id prefix) and stable codes.
	 */
	private function apply_v3_style( array &$node, string $css_string, string $style_apply_mode = 'patch', array $widget_configs = [] ): array {
		$warnings = [];
		$codes    = [];
		$widget_type = $node['widgetType'] ?? '';
		$widget_config = [];

		if ( is_string( $widget_type ) && '' !== $widget_type ) {
			$widget_config = $widget_configs[ $widget_type ]
				?? Widget_Context_Helper::get_widget_config( $widget_type )
				?? [];
		}

		$is_empty_css = '' === trim( $css_string );
		$is_replace = 'replace' === $style_apply_mode;

		if ( $is_replace ) {
			V3_Node_Bridge::clear_style_settings( $node, (string) $widget_type, $widget_config );
		}

		if ( $is_empty_css ) {
			return [
				'warnings' => $warnings,
				'codes' => $codes,
			];
		}

		$mapper = V3_Style_Mapper_Factory::create( $this->css_converter, $this->get_active_breakpoints() );
		$result = $mapper->apply( $css_string, (string) $widget_type, $widget_config );

		foreach ( $result['warnings'] as $warning ) {
			$warnings[] = $warning;
		}

		if ( ! empty( $result['settings_patch'] ) ) {
			$node['settings'] = array_merge( $node['settings'] ?? [], $result['settings_patch'] );
		}

		$unmapped = $result['unmapped_css'] ?? '';
		$pro_warning = V3_Node_Bridge::apply_custom_css( $node, $unmapped, (string) $widget_type );
		if ( null !== $pro_warning ) {
			$warnings[] = $pro_warning;
			$codes[]    = 'v3_style_needs_pro';
		}

		if ( '' !== trim( $unmapped ) ) {
			$snippet = self::truncate_css_snippet( $unmapped );
			if ( null !== $pro_warning ) {
				$warnings[] = sprintf(
					/* translators: %s: CSS snippet that could not be mapped */
					__( 'Some CSS could not be mapped to V3 settings and was dropped: %s', 'elementor' ),
					$snippet
				);
				$codes[] = 'css_dropped';
			} else {
				$warnings[] = sprintf(
					/* translators: %s: CSS snippet that could not be mapped */
					__( 'Some CSS could not be mapped to V3 settings and was written to custom_css: %s', 'elementor' ),
					$snippet
				);
				$codes[] = 'css_fallback_custom_css';
			}
		}

		return [
			'warnings' => $warnings,
			'codes' => $codes,
		];
	}

	private static function truncate_css_snippet( string $css, int $max_length = 200 ): string {
		$css = trim( preg_replace( '/\s+/', ' ', $css ) ?? $css );
		if ( strlen( $css ) <= $max_length ) {
			return $css;
		}

		return substr( $css, 0, $max_length - 3 ) . '...';
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

	/**
	 * @param array[] $variants
	 * @return array<int, array{variable_id: string, var_type: string, control_path: string}>
	 */
	private function collect_variable_connections( array $variants ): array {
		$connections = [];

		foreach ( $variants as $variant ) {
			foreach ( $variant['props'] ?? [] as $prop_key => $prop_value ) {
				if ( ! is_array( $prop_value ) ) {
					continue;
				}

				$type = $prop_value['$$type'] ?? '';

				if ( ! Variable_Type_Keys::is_variable_type( $type ) ) {
					continue;
				}

				$connections[] = [
					'variable_id'  => (string) ( $prop_value['value'] ?? '' ),
					'var_type'     => $this->resolve_var_type_label( $type ),
					'control_path' => (string) $prop_key,
				];
			}
		}

		return $connections;
	}

	private function resolve_var_type_label( string $type ): string {
		$labels = [
			'global-color-variable'       => 'color',
			'global-font-variable'        => 'font',
			'global-size-variable'        => 'size',
			'global-custom-size-variable' => 'size',
		];

		return $labels[ $type ] ?? $type;
	}
}
