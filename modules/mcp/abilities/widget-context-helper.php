<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Plugin;
use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Builds widget metadata for the MCP abilities, mirroring the frontend's
 * `element-data-util`/`widgets-schema-resource`/`build-llm-guidance` (packages/packages/core/editor-canvas/src/mcp).
 */
class Widget_Context_Helper {
	const NON_CONFIGURABLE_PROP_KEYS = [ '_cssid', 'classes', 'attributes' ];

	const V3_LAYOUT_CONTROL_TYPES = [ 'section', 'tab', 'tabs' ];

	const DEFAULT_STYLES_INSTRUCTION = 'These are the default styles applied to the widget. Override only when necessary.';

	const DEFAULT_SETTINGS_INSTRUCTION = 'These are the default settings applied to the widget. Omit them from elementConfig unless the user explicitly asks to change them.';

	const BASE_SETTING_PROP_HINT = 'Has a widget default — omit unless user explicitly requests a change. See llm_guidance.default_settings.';

	/**
	 * @return array<string, array> widget_type => config, filtered to widgets eligible for LLM use.
	 */
	public static function get_llm_eligible_widgets(): array {
		$eligible = [];

		foreach ( Plugin::$instance->widgets_manager->get_widget_types() as $widget_type => $widget ) {
			$config = $widget->get_config();

			if ( self::is_widget_eligible_for_llm( $config ) ) {
				$eligible[ $widget_type ] = $config;
			}
		}

		foreach ( Plugin::$instance->elements_manager->get_element_types() as $element_type => $element ) {
			$config = $element->get_config();

			if ( self::is_widget_eligible_for_llm( $config ) ) {
				$eligible[ $element_type ] = $config;
			}
		}

		return $eligible;
	}

	public static function get_widget_config( string $widget_type ): ?array {
		$widget = Plugin::$instance->widgets_manager->get_widget_types( $widget_type );

		if ( $widget instanceof Widget_Base ) {
			return $widget->get_config();
		}

		$element = Plugin::$instance->elements_manager->get_element_types( $widget_type );

		return $element ? $element->get_config() : null;
	}

	public static function is_widget_eligible_for_llm( array $config ): bool {
		if ( false === ( $config['meta']['llm_support'] ?? null ) ) {
			return false;
		}

		// TODO: Restore component once working in compositions. Mirrors the frontend's exclusion.
		if ( 'Component' === ( $config['title'] ?? null ) ) {
			return false;
		}

		if ( ! empty( $config['atomic_props_schema'] ) ) {
			return true;
		}

		return self::has_v3_controls( $config['controls'] ?? null );
	}

	public static function has_v3_controls( $controls ): bool {
		return is_array( $controls ) && ! empty( $controls );
	}

	public static function get_widget_version( array $config ): string {
		return empty( $config['atomic_props_schema'] ) ? 'v3' : 'v4';
	}

	public static function build_widget_summary( string $widget_type, array $config ): array {
		return array_filter(
			[
				'type' => $widget_type,
				'version' => self::get_widget_version( $config ),
				'description' => self::get_description( $config ),
			],
			fn( $value ) => null !== $value
		);
	}

	/**
	 * Builds the JSON Schema for a widget's props, mirroring the frontend `widgets-schema-resource`.
	 * Returns null for widgets that can't be schematized at all (no atomic props and no V3 controls).
	 *
	 * @param string               $widget_type        Widget type to build the schema for.
	 * @param array                $config              The widget's own config, from `get_config()`.
	 * @param array<string, array> $all_widget_configs Configs for every widget, keyed by type, used
	 *                                                   to resolve `llm_guidance.nesting.allowed_parents`.
	 */
	public static function build_widget_schema( string $widget_type, array $config, array $all_widget_configs = [] ): ?array {
		$props_schema = $config['atomic_props_schema'] ?? null;

		if ( ! $props_schema ) {
			if ( ! self::has_v3_controls( $config['controls'] ?? null ) ) {
				return null;
			}

			return [
				'widget_version' => 'v3',
				'message' => 'This widget exists in the editor but has no atomic props schema (V4). Use control_metadata as non-authoritative hints from legacy controls.',
				'fields_note' => 'All settings are optional; there is no JSON schema for this widget type.',
				'properties' => self::extract_v3_controls_metadata( $config['controls'] ),
			];
		}

		$properties = self::build_configurable_properties_schema( $props_schema, $config['base_settings'] ?? [] );

		return array_filter(
			[
				'type' => 'object',
				'properties' => $properties,
				'description' => self::get_description( $config ),
				'llm_guidance' => self::build_llm_guidance( $config, $widget_type, $all_widget_configs ),
			],
			fn( $value ) => null !== $value
		);
	}

	/**
	 * @param array<string, Prop_Type> $props_schema
	 * @param array<string, mixed>     $base_settings
	 */
	private static function build_configurable_properties_schema( array $props_schema, array $base_settings ): array {
		$properties = [];

		foreach ( $props_schema as $key => $prop_type ) {
			if ( ! $prop_type instanceof Prop_Type || ! self::is_prop_key_configurable( $key, $prop_type ) ) {
				continue;
			}

			$properties[ $key ] = $prop_type->to_json_schema();
		}

		return self::enrich_properties_with_base_settings_hints( $properties, array_keys( $base_settings ) );
	}

	public static function is_prop_key_configurable( string $key, Prop_Type $prop_type ): bool {
		if ( ! in_array( $key, self::NON_CONFIGURABLE_PROP_KEYS, true ) ) {
			return true;
		}

		return (bool) $prop_type->get_meta_item( 'llm_configurable', false );
	}

	private static function enrich_properties_with_base_settings_hints( array $properties, array $base_settings_keys ): array {
		if ( empty( $base_settings_keys ) ) {
			return $properties;
		}

		foreach ( $base_settings_keys as $key ) {
			if ( ! isset( $properties[ $key ] ) ) {
				continue;
			}

			$existing_description = $properties[ $key ]['description'] ?? null;

			$properties[ $key ]['description'] = $existing_description
				? "{$existing_description} " . self::BASE_SETTING_PROP_HINT
				: self::BASE_SETTING_PROP_HINT;
		}

		return $properties;
	}

	/**
	 * `$all_widget_configs` holds every widget's config, keyed by type, needed to resolve
	 * `nesting.allowed_parents` below.
	 */
	public static function build_llm_guidance( array $config, string $widget_type, array $all_widget_configs ): array {
		$guidance = [
			'can_have_children' => ! empty( $config['meta']['is_container'] ),
		];

		$default_styles = self::collect_default_styles( $config['base_styles'] ?? [] );
		$default_settings = $config['base_settings'] ?? [];

		if ( ! empty( $default_styles ) ) {
			$guidance['instructions'] = self::merge_instructions( $guidance['instructions'] ?? null, self::DEFAULT_STYLES_INSTRUCTION );
			$guidance['default_styles'] = $default_styles;
		}

		if ( ! empty( $default_settings ) ) {
			$guidance['instructions'] = self::merge_instructions( $guidance['instructions'] ?? null, self::DEFAULT_SETTINGS_INSTRUCTION );
			$guidance['default_settings'] = $default_settings;
		}

		$nesting = self::build_nesting_guidance( $config, $widget_type, $all_widget_configs );

		if ( ! empty( $nesting ) ) {
			$guidance['nesting'] = $nesting;
		}

		$required_children = self::get_required_default_child_types( $config );

		if ( ! empty( $required_children ) ) {
			$guidance['required_direct_children'] = $required_children;
		}

		return $guidance;
	}

	/**
	 * Collects default styles from base_styles and converts PropValue envelopes to plain CSS strings.
	 * The LLM is expected to use plain CSS (our converter transforms it), so we show the defaults
	 * as they would appear in CSS rather than as PropValue envelopes.
	 *
	 * @param array<string, array> $base_styles Style_Definition::build() output, keyed by style ID.
	 */
	private static function collect_default_styles( array $base_styles ): array {
		$default_styles = [];

		foreach ( $base_styles as $style ) {
			foreach ( $style['variants'] ?? [] as $variant ) {
				$default_styles = array_merge( $default_styles, $variant['props'] ?? [] );
			}
		}

		return self::convert_prop_values_to_css( $default_styles );
	}

	/**
	 * Converts an array of PropValue envelopes to plain CSS strings.
	 * Uses the Render_Props_Resolver which transforms PropValues to their CSS representation.
	 *
	 * @param array<string, mixed> $props PropValue envelopes keyed by CSS property name.
	 * @return array<string, string> Plain CSS values keyed by CSS property name.
	 */
	private static function convert_prop_values_to_css( array $props ): array {
		if ( empty( $props ) ) {
			return [];
		}

		$schema = Style_Schema::get();
		$resolved = Render_Props_Resolver::for_styles()->resolve( $schema, $props );

		return array_filter( $resolved, fn( $value ) => null !== $value && '' !== $value );
	}

	private static function merge_instructions( ?string $existing, string $additional ): string {
		return $existing ? "{$existing} {$additional}" : $additional;
	}

	/**
	 * `$all_widget_configs` holds every widget's config, keyed by type, needed to resolve
	 * `allowed_parents` below.
	 */
	private static function build_nesting_guidance( array $config, string $widget_type, array $all_widget_configs ): array {
		$allowed_child_types = $config['allowed_child_types'] ?? [];
		$allowed_parents = [];

		foreach ( $all_widget_configs as $parent_type => $parent_config ) {
			if ( in_array( $widget_type, $parent_config['allowed_child_types'] ?? [], true ) ) {
				$allowed_parents[] = $parent_type;
			}
		}

		return array_filter(
			[
				'allowed_child_types' => empty( $allowed_child_types ) ? null : $allowed_child_types,
				'allowed_parents' => empty( $allowed_parents ) ? null : $allowed_parents,
			],
			fn( $value ) => null !== $value
		);
	}

	private static function get_required_default_child_types( array $config ): array {
		$default_children = $config['default_children'] ?? null;

		if ( ! is_array( $default_children ) ) {
			return [];
		}

		$types = [];

		foreach ( $default_children as $child ) {
			if ( empty( $child['meta']['required'] ) ) {
				continue;
			}

			$type = $child['widgetType'] ?? $child['elType'] ?? null;

			if ( $type ) {
				$types[] = $type;
			}
		}

		return $types;
	}

	private static function extract_v3_controls_metadata( $controls ): array {
		if ( ! self::has_v3_controls( $controls ) ) {
			return [];
		}

		$result = [];

		foreach ( $controls as $control_key => $control ) {
			if ( ! is_array( $control ) ) {
				continue;
			}

			$control_type = is_string( $control['type'] ?? null ) ? $control['type'] : null;

			if ( $control_type && in_array( $control_type, self::V3_LAYOUT_CONTROL_TYPES, true ) ) {
				continue;
			}

			$result[ $control_key ] = self::build_v3_control_entry( $control, $control_type );
		}

		return $result;
	}

	private static function build_v3_control_entry( array $control, ?string $control_type ): array {
		$entry = [];

		if ( array_key_exists( 'default', $control ) ) {
			$entry['default'] = $control['default'];
		}

		if ( $control_type ) {
			$entry['type'] = $control_type;
		}

		if ( array_key_exists( 'options', $control ) && null !== $control['options'] ) {
			$options = $control['options'];
			$entry['options'] = ( is_array( $options ) && self::is_associative_array( $options ) )
				? array_keys( $options )
				: $options;
		}

		return $entry;
	}

	private static function is_associative_array( array $options ): bool {
		return array_keys( $options ) !== range( 0, count( $options ) - 1 );
	}

	private static function get_description( array $config ): ?string {
		$description = $config['meta']['description'] ?? null;

		return is_string( $description ) ? $description : null;
	}
}
