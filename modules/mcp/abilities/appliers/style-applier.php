<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\Styles\Atomic_Widget_Styles;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Custom_Css_Fallback;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Fallback_Css;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Style_Clearer;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Settings_Patch;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Inactive_Condition_Warnings;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Overridden_Setting_Warnings;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper_Factory;
use Elementor\Modules\Mcp\Abilities\Utils\Bulk_Operations_Result;
use Elementor\Modules\Mcp\Abilities\Utils\Style_Variants_Merger;
use Elementor\Modules\Mcp\Abilities\Utils\Warnings_Bag;
use Elementor\Modules\Variables\Services\Variables_Service;
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

	const UNSUPPORTED_CSS_CODE = 'unsupported_css';
	const UNKNOWN_VARIABLE_CODE = 'unknown_variable';
	const BORDER_STYLE_NONE = 'none';

	private Css_Converter $css_converter;
	private array $active_breakpoints;
	private ?Variables_Service $variables_service;

	public function __construct( Css_Converter $css_converter, array $active_breakpoints = [], ?Variables_Service $variables_service = null ) {
		$this->css_converter      = $css_converter;
		$this->active_breakpoints = $active_breakpoints;
		$this->variables_service  = $variables_service;
	}

	/**
	 * @param array<string, array&> $config_id_index Index of subtree refs.
	 * @param array<string, string> $styles          Per-config-id CSS strings.
	 * @param string                $style_apply_mode `patch` or `replace`.
	 * @return array{error: null, warnings: Warnings_Bag, variable_connections: array<string, array<string, string>>}
	 */
	public function apply( array $config_id_index, array $styles, string $style_apply_mode = 'patch' ): array {
		$warnings = Warnings_Bag::make();

		if ( empty( $styles ) ) {
			return [
				'error'               => null,
				'warnings'            => $warnings,
				'variable_connections' => [],
			];
		}

		$active_breakpoints    = $this->get_active_breakpoints();
		$variable_connections  = [];

		foreach ( $styles as $config_id => $css_string ) {
			if ( ! is_string( $css_string ) ) {
				$warnings->add(
					'css_parse_failed',
					sprintf( 'style must be a CSS string, got %s.', gettype( $css_string ) ),
					(string) $config_id
				);
				continue;
			}

			if ( ! isset( $config_id_index[ $config_id ] ) ) {
				continue;
			}

			$node = &$config_id_index[ $config_id ];

			if ( V3_Node_Bridge::is_v3_node( $node ) ) {
				$this->apply_v3_style( $node, $css_string, (string) $config_id, $warnings, $style_apply_mode );
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
				$warnings->add(
					'css_parse_failed',
					$result_data['results'][0]['message'] ?? 'CSS parse error.',
					(string) $config_id
				);
				unset( $node );
				continue;
			}

			$built_variants  = Style_Variants_Merger::build_variants_with_fallback_css( $parsed['breakpoint_blocks'], $this->css_converter );
			$new_variants    = $built_variants['variants'];
			$unsupported_css = $this->collect_unsupported_css( $new_variants, $built_variants['fallback_css'] );

			if ( '' !== $unsupported_css ) {
				$warnings->add(
					self::UNSUPPORTED_CSS_CODE,
					sprintf(
						/* translators: %s: CSS declarations that were not saved */
						__( 'These CSS properties or values are not supported and were not saved: %s', 'elementor' ),
						self::truncate_css_snippet( $unsupported_css )
					),
					(string) $config_id
				);
			}

			$this->warn_about_unknown_variables( $css_string, (string) $config_id, $warnings );

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
			'error'               => null,
			'warnings'            => $warnings,
			'variable_connections' => $variable_connections,
		];
	}

	private function apply_v3_style( array &$node, string $css_string, string $config_id, Warnings_Bag $warnings, string $style_apply_mode = 'patch' ): void {
		$widget_type = (string) ( $node['widgetType'] ?? $node['elType'] ?? '' );
		$map = V3_Widget_Map_Registry::instance()->get_map( $widget_type );

		if ( null === $map ) {
			return;
		}

		$css_string = V3_Custom_Css_Fallback::without_statements( $css_string, V3_Map_Style_Clearer::user_css_rules( $node['settings'] ?? [], $map ) );
		$is_empty_css = '' === trim( $css_string );
		$result = null;

		if ( ! $is_empty_css ) {
			$mapper = V3_Style_Mapper_Factory::create( $this->css_converter, $this->get_active_breakpoints() );
			$result = $mapper->apply( $css_string, $widget_type );
		}

		if ( null !== ( $result['error'] ?? null ) ) {
			$warnings->add( 'css_parse_failed', $result['error'], $config_id );
			return;
		}

		if ( 'replace' === $style_apply_mode ) {
			( new V3_Map_Style_Clearer() )->clear( $node, $map, $widget_type );
		}

		if ( $is_empty_css ) {
			return;
		}

		foreach ( $result['warnings'] as $warning ) {
			$warnings->add( 'v3_css_skipped', $warning, $config_id );
		}

		$controls = V3_Widget_Map_Registry::instance()->get_registered_controls( $widget_type );
		V3_Overridden_Setting_Warnings::report( $warnings, $config_id, $node['settings'] ?? [], $result['required_settings'] ?? [], $controls );

		$settings_patch = self::with_border_style_defaults( $result['settings_patch'] ?? [], $result['border_style_defaults'] ?? [], $node['settings'] ?? [] );

		if ( ! empty( $settings_patch ) ) {
			$node['settings'] = V3_Settings_Patch::merge( $node['settings'] ?? [], $settings_patch );
		}

		V3_Inactive_Condition_Warnings::report( $warnings, $config_id, $widget_type, array_keys( $settings_patch ), $node['settings'] ?? [] );
		( new V3_Map_Fallback_Css() )->apply( $node, $result, $widget_type, $config_id, $warnings );
	}

	private function warn_about_unknown_variables( string $css_string, string $config_id, Warnings_Bag $warnings ): void {
		if ( null === $this->variables_service || ! preg_match_all( '/var\(\s*--([A-Za-z0-9_-]+)/', $css_string, $matches ) ) {
			return;
		}

		$unknown = array_filter(
			array_unique( $matches[1] ),
			fn( string $reference ) => null === $this->variables_service->find_by_label_or_id( $reference )
		);

		if ( empty( $unknown ) ) {
			return;
		}

		$warnings->add(
			self::UNKNOWN_VARIABLE_CODE,
			sprintf(
				/* translators: %s: Comma-separated var() references */
				__( 'No Elementor variable matches %s. The declaration was kept as plain CSS and only works if that CSS custom property is defined elsewhere on the page; otherwise the browser ignores it. Use an existing variable from elementor://global-variables or create one with elementor-manage-global-variable.', 'elementor' ),
				implode( ', ', array_map( fn( string $reference ) => 'var(--' . $reference . ')', $unknown ) )
			),
			$config_id
		);
	}

	/**
	 * @param array<string, mixed>  $settings_patch
	 * @param array<string, string> $border_style_defaults
	 * @param array<string, mixed>  $saved_settings
	 * @return array<string, mixed>
	 */
	private static function with_border_style_defaults( array $settings_patch, array $border_style_defaults, array $saved_settings ): array {
		$unset_defaults = array_filter(
			$border_style_defaults,
			fn( string $setting ) => ! self::has_border_style( $settings_patch[ $setting ] ?? null ) && ! self::has_border_style( $saved_settings[ $setting ] ?? null ),
			ARRAY_FILTER_USE_KEY
		);

		return array_merge( $unset_defaults, $settings_patch );
	}

	private static function has_border_style( $value ): bool {
		return is_string( $value ) && '' !== $value && self::BORDER_STYLE_NONE !== $value;
	}

	private static function truncate_css_snippet( string $css, int $max_length = 200 ): string {
		$css = trim( preg_replace( '/\s+/', ' ', $css ) ?? $css );
		if ( strlen( $css ) <= $max_length ) {
			return $css;
		}

		return substr( $css, 0, $max_length - 3 ) . '...';
	}

	/**
	 * @param array[]            $variants
	 * @param array<int, string> $fallback_css Per variant index, CSS the converter could not convert natively.
	 */
	private function collect_unsupported_css( array $variants, array $fallback_css ): string {
		if ( empty( $fallback_css ) ) {
			return '';
		}

		$kept_variants = Atomic_Widget_Styles::get_license_based_filtered_styles(
			[ self::LOCAL_STYLE_LABEL => [ 'variants' => array_intersect_key( $variants, $fallback_css ) ] ]
		)[ self::LOCAL_STYLE_LABEL ]['variants'];

		$dropped_css = [];

		foreach ( $fallback_css as $index => $css ) {
			if ( empty( $kept_variants[ $index ]['custom_css'] ) ) {
				$dropped_css[] = $css;
			}
		}

		return implode( ' ', $dropped_css );
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
