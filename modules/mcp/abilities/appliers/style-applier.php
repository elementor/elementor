<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Auto_Mapper;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Group_Control_Detector;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Patch_Bisector;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Render_Probe;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Scoped_Css_Splitter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper_Factory;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Widget_Map_Loader;
use Elementor\Modules\Mcp\Abilities\Utils\Bulk_Operations_Result;
use Elementor\Modules\Mcp\Abilities\Utils\Style_Variants_Merger;
use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;
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
	 * @return array{error: \WP_Error|null, warnings: string[]}
	 */
	public function apply( array $config_id_index, array $styles, string $style_apply_mode = 'patch', array $widget_configs = [] ): array {
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
				$v3_warnings = $this->apply_v3_style( $node, $css_string, $style_apply_mode, $widget_configs );
				foreach ( $v3_warnings as $warning ) {
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

	/**
	 * @param array                $node
	 * @param string               $css_string
	 * @param string               $style_apply_mode
	 * @param array<string, array> $widget_configs
	 * @return string[] Warnings (without config-id prefix).
	 */
	private function apply_v3_style( array &$node, string $css_string, string $style_apply_mode = 'patch', array $widget_configs = [] ): array {
		$warnings = [];
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
			return $warnings;
		}

		$controls = is_array( $widget_config['controls'] ?? null ) ? $widget_config['controls'] : [];
		$inner_elements = V3_Widget_Map_Loader::get_inner_elements( (string) $widget_type, $controls );
		if ( ! empty( $inner_elements ) ) {
			return $this->apply_v3_inner_element_styles(
				$node,
				$css_string,
				(string) $widget_type,
				$widget_config,
				$inner_elements,
				$warnings
			);
		}

		$mapper = V3_Style_Mapper_Factory::create( $this->css_converter, $this->get_active_breakpoints() );
		$result = $mapper->apply( $css_string, (string) $widget_type, $widget_config );

		foreach ( $result['warnings'] as $warning ) {
			$warnings[] = $warning;
		}

		if ( ! empty( $result['settings_patch'] ) ) {
			$base_settings = $node['settings'] ?? [];
			$safe_patch = self::guard_v3_render(
				(string) $widget_type,
				$base_settings,
				$result['settings_patch'],
				$controls,
				$warnings
			);
			$node['settings'] = array_merge( $base_settings, $safe_patch );
		}

		$unmapped = $result['unmapped_css'] ?? '';
		$pro_warning = V3_Node_Bridge::apply_custom_css( $node, $unmapped, (string) $widget_type );
		if ( null !== $pro_warning ) {
			$warnings[] = $pro_warning;
		}

		if ( '' !== trim( $unmapped ) ) {
			$snippet = self::truncate_css_snippet( $unmapped );
			$warnings[] = null !== $pro_warning
				? sprintf(
					/* translators: %s: CSS snippet that could not be mapped */
					__( 'Some CSS could not be mapped to V3 settings and was dropped: %s', 'elementor' ),
					$snippet
				)
				: sprintf(
					/* translators: %s: CSS snippet that could not be mapped */
					__( 'Some CSS could not be mapped to V3 settings and was written to custom_css: %s', 'elementor' ),
					$snippet
				);
		}

		return $warnings;
	}

	/**
	 * @param array<string, mixed> $base
	 * @param array<string, mixed> $patch
	 * @param array<string, mixed> $controls
	 * @param string[]             $warnings
	 * @return array<string, mixed> Patch with offending keys removed.
	 */
	private static function guard_v3_render(
		string $widget_type,
		array $base,
		array $patch,
		array $controls,
		array &$warnings
	): array {
		if ( ! apply_filters( 'elementor/mcp/v3_render_probe', true ) ) {
			return $patch;
		}

		$merged = array_merge( $base, $patch );
		$initial = V3_Render_Probe::probe( $widget_type, $merged );

		if ( $initial['ok'] || $initial['timed_out'] ) {
			return $patch;
		}

		$probe = static function ( array $settings ) use ( $widget_type ): bool {
			$result = V3_Render_Probe::probe( $widget_type, $settings );
			return $result['ok'] || $result['timed_out'];
		};

		$offending = V3_Patch_Bisector::find_offending(
			$base,
			$patch,
			$probe,
			self::render_probe_groups( $controls )
		);

		if ( empty( $offending ) ) {
			return $patch;
		}

		$safe = $patch;
		foreach ( $offending as $key ) {
			unset( $safe[ $key ] );
		}

		$warnings[] = sprintf(
			/* translators: 1: widget type, 2: comma-separated setting keys, 3: PHP error message. */
			__( 'V3 render fatal on %1$s for keys [%2$s]: %3$s. Props dropped.', 'elementor' ),
			$widget_type,
			implode( ',', $offending ),
			(string) $initial['error']
		);

		return $safe;
	}

	/**
	 * @param array<string, mixed> $controls
	 * @return array<string, string[]>
	 */
	private static function render_probe_groups( array $controls ): array {
		$groups = [];

		foreach ( V3_Group_Control_Detector::typography_prefixes( $controls ) as $prefix ) {
			$members = [];
			foreach ( V3_Group_Control_Detector::TYPOGRAPHY_SUFFIXES as $suffix ) {
				foreach ( V3_Group_Control_Detector::RESPONSIVE_SUFFIXES as $responsive ) {
					$key = $prefix . '_' . $suffix . $responsive;
					if ( isset( $controls[ $key ] ) ) {
						$members[] = $key;
					}
				}
			}
			if ( ! empty( $members ) ) {
				$groups[ $prefix ] = $members;
			}
		}

		foreach ( V3_Group_Control_Detector::border_prefixes( $controls ) as $prefix ) {
			$members = [];
			foreach ( V3_Group_Control_Detector::BORDER_SUFFIXES as $suffix ) {
				foreach ( V3_Group_Control_Detector::RESPONSIVE_SUFFIXES as $responsive ) {
					$key = $prefix . '_' . $suffix . $responsive;
					if ( isset( $controls[ $key ] ) ) {
						$members[] = $key;
					}
				}
			}
			if ( ! empty( $members ) ) {
				$groups[ $prefix ] = $members;
			}
		}

		foreach ( V3_Group_Control_Detector::box_shadow_prefixes( $controls ) as $prefix ) {
			$members = [];
			foreach ( V3_Group_Control_Detector::BOX_SHADOW_SUFFIXES as $suffix ) {
				$key = $prefix . '_' . $suffix;
				if ( isset( $controls[ $key ] ) ) {
					$members[] = $key;
				}
			}
			if ( ! empty( $members ) ) {
				$groups[ $prefix . '_box_shadow' ] = $members;
			}
		}

		return $groups;
	}

	/**
	 * @param array<string, mixed>                $node
	 * @param string                              $css_string
	 * @param string                              $widget_type
	 * @param array<string, mixed>                $widget_config
	 * @param array<string, array<string, mixed>> $inner_elements
	 * @param string[]                            $warnings
	 * @return string[]
	 */
	private function apply_v3_inner_element_styles(
		array &$node,
		string $css_string,
		string $widget_type,
		array $widget_config,
		array $inner_elements,
		array $warnings
	): array {
		$split = V3_Scoped_Css_Splitter::split( $css_string, array_keys( $inner_elements ) );
		$default_inner_element = V3_Widget_Map_Loader::get_default_inner_element(
			$widget_type,
			is_array( $widget_config['controls'] ?? null ) ? $widget_config['controls'] : []
		);

		foreach ( $split['dropped_blocks'] as $dropped ) {
			$warnings[] = sprintf(
				/* translators: 1: Unknown selector the LLM used, 2: V3 widget type name. */
				__( 'Unknown selector "%1$s" for widget `%2$s`; its rules were dropped. Use the aliases listed under `inner_elements` in the widget schema.', 'elementor' ),
				$dropped['selector'],
				$widget_type
			);
		}

		$mapper = V3_Style_Mapper_Factory::create( $this->css_converter, $this->get_active_breakpoints() );
		$settings_patch = [];
		$unmapped_parts = [];
		$wrapper_unmapped = '';

		if ( '' !== trim( $split['wrapper'] ) ) {
			$result = $mapper->apply( $split['wrapper'], $widget_type, $widget_config );
			$settings_patch = array_merge( $settings_patch, $result['settings_patch'] );
			$warnings = array_merge( $warnings, $result['warnings'] );
			$wrapper_unmapped = trim( $result['unmapped_css'] ?? '' );
		}

		if ( null !== $default_inner_element && '' !== $wrapper_unmapped ) {
			$split['scopes'][ $default_inner_element ] = trim(
				( $split['scopes'][ $default_inner_element ] ?? '' ) . ' ' . $wrapper_unmapped
			);
			$wrapper_unmapped = '';
		}

		if ( '' !== $wrapper_unmapped ) {
			$unmapped_parts[] = $wrapper_unmapped;
		}

		foreach ( $split['scopes'] as $scope_key => $scope_css ) {
			if ( '' === trim( $scope_css ) ) {
				continue;
			}

			$scope_alias = explode( ':', $scope_key, 2 )[0];
			$inner_element = $inner_elements[ $scope_alias ] ?? null;
			if ( null === $inner_element ) {
				$warnings[] = sprintf(
					/* translators: 1: Inner-element alias the LLM used, 2: V3 widget type name. */
					__( 'Unknown inner element "%1$s" for widget `%2$s`; its rules were dropped. Use the aliases listed under `inner_elements` in the widget schema.', 'elementor' ),
					$scope_alias,
					$widget_type
				);
				continue;
			}

			$mapping = V3_Auto_Mapper::for_scope( $widget_config, $inner_element );
			$mapper_css = V3_Scoped_Css_Splitter::scope_to_mapper_css( $scope_key, $scope_css );
			$result = $mapper->apply( $mapper_css, $widget_type, $widget_config, $mapping );

			$settings_patch = array_merge( $settings_patch, $result['settings_patch'] );
			$warnings = array_merge( $warnings, $result['warnings'] );

			$warnings = array_merge(
				$warnings,
				self::unsupported_scope_property_warnings( $scope_alias, $result['unmapped_css'] ?? '' )
			);
		}

		if ( ! empty( $settings_patch ) ) {
			$node['settings'] = array_merge( $node['settings'] ?? [], $settings_patch );
		}

		$unmapped = trim( implode( ' ', array_filter( $unmapped_parts, static fn( $part ) => '' !== trim( $part ) ) ) );
		$pro_warning = V3_Node_Bridge::apply_custom_css( $node, $unmapped, $widget_type );
		if ( null !== $pro_warning ) {
			$warnings[] = $pro_warning;
		}

		if ( '' !== $unmapped ) {
			$snippet = self::truncate_css_snippet( $unmapped );
			$warnings[] = null !== $pro_warning
				? sprintf(
					/* translators: %s: CSS snippet that could not be mapped */
					__( 'Some CSS could not be mapped to V3 settings and was dropped: %s', 'elementor' ),
					$snippet
				)
				: sprintf(
					/* translators: %s: CSS snippet that could not be mapped */
					__( 'Some CSS could not be mapped to V3 settings and was written to custom_css: %s', 'elementor' ),
					$snippet
				);
		}

		return $warnings;
	}

	/**
	 * Inner-element rules cannot survive in `custom_css`: the wrapper-scoped selector Pro
	 * wraps it with cannot express a sub-element, and Pro 3.35+ strips `custom_css` anyway.
	 * Unmapped properties are therefore dropped and reported, so the LLM can retry against
	 * the alias `accepted_css_properties` instead of believing the style was applied.
	 *
	 * @return string[]
	 */
	private static function unsupported_scope_property_warnings( string $scope_alias, string $unmapped_css ): array {
		$warnings = [];

		foreach ( self::css_property_names( $unmapped_css ) as $property ) {
			$warnings[] = sprintf(
				/* translators: 1: CSS property name, 2: Inner-element alias. */
				__( 'Property "%1$s" is not supported on "%2$s" and was dropped. See `accepted_css_properties` for that inner element.', 'elementor' ),
				$property,
				$scope_alias
			);
		}

		return $warnings;
	}

	/**
	 * @return string[]
	 */
	private static function css_property_names( string $css ): array {
		if ( ! preg_match_all( '/([a-zA-Z-]+)\s*:/', $css, $matches ) ) {
			return [];
		}

		return array_values( array_unique( array_map( 'strtolower', $matches[1] ) ) );
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
}
