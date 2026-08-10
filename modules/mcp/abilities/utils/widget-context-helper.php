<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Utils\Plain_Llm_Schema_Converter;
use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Provides widget metadata for MCP abilities: eligibility checks, summaries, and JSON schemas
 * for LLM consumption. The schema output includes property types and LLM guidance.
 */
class Widget_Context_Helper {

	const NON_CONFIGURABLE_PROP_KEYS = [ '_cssid', 'classes', 'attributes', 'display-conditions' ];

	const EXCLUDED_WIDGET_TITLE = 'Component';

	const VERSION_V3 = 'v3';

	const VERSION_V4 = 'v4';

	const V3_ALLOWLIST = [
		'nav-menu',
		'theme-post-content',
		'theme-post-title',
		'theme-post-featured-image',
		'theme-post-excerpt',
		'theme-archive-title',
	];

	const V3_FALLBACK_MESSAGE = 'This widget exists in the editor but has no atomic props schema (V4). Use control_metadata as non-authoritative hints from legacy controls.';

	const V3_FALLBACK_FIELDS_NOTE = 'All settings are optional; there is no JSON schema for this widget type.';

	/**
	 * @return array<string, array> widget_type => config, filtered to widgets eligible for LLM use.
	 */
	public static function get_llm_eligible_widgets(): array {
		$all_types = array_merge(
			Plugin::$instance->widgets_manager->get_widget_types(),
			Plugin::$instance->elements_manager->get_element_types()
		);

		$eligible = [];

		foreach ( $all_types as $type => $instance ) {
			if ( self::is_v3_allowlisted( (string) $type ) && method_exists( $instance, 'get_stack' ) ) {
				$instance->get_stack();
			}

			$config = $instance->get_config();

			if ( self::is_widget_eligible_for_llm( $config ) ) {
				$eligible[ $type ] = $config;
			}
		}

		return $eligible;
	}

	public static function get_widget_config( string $widget_type ): ?array {
		$instance = Atomic_Elements_Utils::get_element_instance( $widget_type );

		if ( ! $instance ) {
			return null;
		}

		if ( self::is_v3_allowlisted( $widget_type ) && method_exists( $instance, 'get_stack' ) ) {
			$instance->get_stack();
		}

		return $instance->get_config();
	}

	public static function is_widget_eligible_for_llm( array $config ): bool {
		if ( false === ( $config['meta']['llm_support'] ?? null ) ) {
			return false;
		}

		if ( self::EXCLUDED_WIDGET_TITLE === ( $config['title'] ?? null ) ) {
			return false;
		}

		if ( ! empty( $config['atomic_props_schema'] ) ) {
			return true;
		}

		return self::has_v3_controls( $config['controls'] ?? null );
	}

	private static function has_v3_controls( $controls ): bool {
		return is_array( $controls ) && ! empty( $controls );
	}

	public static function get_widget_version( array $config ): string {
		return empty( $config['atomic_props_schema'] ) ? self::VERSION_V3 : self::VERSION_V4;
	}

	public static function is_v3_allowlisted( string $widget_type ): bool {
		return in_array( $widget_type, self::V3_ALLOWLIST, true );
	}

	public static function build_widget_summary( string $widget_type, array $config ): array {
		return self::filter_nulls( [
			'type' => $widget_type,
			'version' => self::get_widget_version( $config ),
			'description' => self::get_description( $config ),
		] );
	}

	/**
	 * Builds a parents index for efficient allowed_parents lookup.
	 *
	 * @param array<string, array> $all_configs All widget configs keyed by type.
	 * @return array<string, string[]> child_type => parent_types[].
	 */
	public static function build_parents_index( array $all_configs ): array {
		$index = [];

		foreach ( $all_configs as $parent_type => $parent_config ) {
			foreach ( $parent_config['allowed_child_types'] ?? [] as $child_type ) {
				$index[ $child_type ][] = $parent_type;
			}
		}

		return $index;
	}

	/**
	 * Builds the JSON Schema for a widget's props.
	 * Returns null for widgets that can't be schematized at all (no atomic props and no V3 controls).
	 *
	 * @param string $widget_type   Widget type to build the schema for.
	 * @param array  $config        The widget's own config, from `get_config()`.
	 * @param array  $parents_index Precomputed child_type => parent_types[] index for nesting guidance.
	 */
	public static function build_widget_schema( string $widget_type, array $config, array $parents_index = [] ): ?array {
		$props_schema = $config['atomic_props_schema'] ?? null;

		if ( ! $props_schema ) {
			if ( ! self::has_v3_controls( $config['controls'] ?? null ) ) {
				return null;
			}

			return [
				'widget_version' => self::VERSION_V3,
				'message' => self::V3_FALLBACK_MESSAGE,
				'fields_note' => self::V3_FALLBACK_FIELDS_NOTE,
				'properties' => V3_Controls_Metadata::extract( $config['controls'] ),
			];
		}

		$properties = self::build_configurable_properties_schema( $props_schema );

		return self::filter_nulls( [
			'type' => 'object',
			'properties' => $properties,
			'description' => self::get_description( $config ),
			'llm_guidance' => Llm_Guidance_Builder::build( $config, $widget_type, $parents_index ),
		] );
	}

	/**
	 * @param array<string, Prop_Type> $props_schema
	 */
	private static function build_configurable_properties_schema( array $props_schema ): array {
		$properties = [];

		foreach ( $props_schema as $key => $prop_type ) {
			if ( ! $prop_type instanceof Prop_Type || ! self::is_prop_key_configurable( $key, $prop_type ) ) {
				continue;
			}

			$properties[ $key ] = $prop_type->to_json_schema();
		}

		return self::apply_llm_schema_filters( $properties );
	}

	private static function apply_llm_schema_filters( array $properties ): array {
		foreach ( $properties as $key => $schema ) {
			$properties[ $key ] = self::to_plain_llm_schema_from_json( $schema );
		}

		return $properties;
	}

	public static function to_plain_llm_schema( Prop_Type $prop_type ): array {
		$schema = self::to_plain_llm_schema_from_json( $prop_type->to_json_schema() );

		return self::refine_from_prop_type( $schema, $prop_type, Utils::has_pro() );
	}

	private static function to_plain_llm_schema_from_json( array $schema ): array {
		$filtered = apply_filters( 'elementor/atomic-widgets/llm-json-schema', $schema );

		return Plain_Llm_Schema_Converter::convert( $filtered );
	}

	/**
	 * Walks a plain LLM schema alongside its PropType tree to:
	 *   - Enrich primitive enums from `meta('enum')` when the JSON schema lacks them.
	 *   - Strip fields marked `meta('pro') === true` and enum values listed in `meta('pro')`
	 *     when Pro is inactive.
	 */
	private static function refine_from_prop_type( array $schema, Prop_Type $prop_type, bool $is_pro_active ): array {
		if ( $prop_type instanceof Object_Prop_Type ) {
			return self::refine_object( $schema, $prop_type, $is_pro_active );
		}

		if ( $prop_type instanceof Array_Prop_Type ) {
			return self::refine_array( $schema, $prop_type, $is_pro_active );
		}

		return self::refine_primitive( $schema, $prop_type, $is_pro_active );
	}

	private static function refine_object( array $schema, Object_Prop_Type $prop_type, bool $is_pro_active ): array {
		if ( ! isset( $schema['properties'] ) || ! is_array( $schema['properties'] ) ) {
			return $schema;
		}

		$properties = $schema['properties'];

		foreach ( $prop_type->get_shape() as $key => $child_prop_type ) {
			if ( ! isset( $properties[ $key ] ) ) {
				continue;
			}

			if ( ! $is_pro_active && self::is_pro_only_field( $child_prop_type ) ) {
				unset( $properties[ $key ] );
				continue;
			}

			$properties[ $key ] = self::refine_from_prop_type( $properties[ $key ], $child_prop_type, $is_pro_active );
		}

		$schema['properties'] = $properties;

		return $schema;
	}

	private static function refine_array( array $schema, Array_Prop_Type $prop_type, bool $is_pro_active ): array {
		if ( isset( $schema['items'] ) && is_array( $schema['items'] ) ) {
			$schema['items'] = self::refine_from_prop_type( $schema['items'], $prop_type->get_item_type(), $is_pro_active );
		}

		return $schema;
	}

	private static function refine_primitive( array $schema, Prop_Type $prop_type, bool $is_pro_active ): array {
		$enum_values = $prop_type->get_meta_item( 'enum' );

		if ( is_array( $enum_values ) ) {
			$schema['enum'] = $is_pro_active
				? array_values( $enum_values )
				: self::filter_pro_enum_values( $enum_values, $prop_type );
		}

		return $schema;
	}

	private static function filter_pro_enum_values( array $enum_values, Prop_Type $prop_type ): array {
		if ( self::is_pro_only_field( $prop_type ) ) {
			return [];
		}

		$pro_values = $prop_type->get_meta_item( 'pro' );

		if ( ! is_array( $pro_values ) ) {
			return array_values( $enum_values );
		}

		return array_values( array_diff( $enum_values, $pro_values ) );
	}

	private static function is_pro_only_field( Prop_Type $prop_type ): bool {
		return true === $prop_type->get_meta_item( 'pro' );
	}

	private static function is_prop_key_configurable( string $key, Prop_Type $prop_type ): bool {
		if ( ! in_array( $key, self::NON_CONFIGURABLE_PROP_KEYS, true ) ) {
			return true;
		}

		return (bool) $prop_type->get_meta_item( 'llm_configurable', false );
	}

	private static function get_description( array $config ): ?string {
		$description = $config['meta']['description'] ?? null;

		return is_string( $description ) ? $description : null;
	}

	private static function filter_nulls( array $data ): array {
		return array_filter( $data, fn( $value ) => null !== $value );
	}
}
