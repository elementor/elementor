<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Utils\Plain_Llm_Schema_Converter;
use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Auto_Mapper;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Widget_Map_Loader;
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

	/**
	 * V3 widgets that fill gaps missing from V4 atomic widgets (nav menus, search, etc.). Always
	 * exposed to MCP regardless of the V4 experiment.
	 */
	const V3_ALLOWLIST_GAP = [
		'nav-menu',
		'search',
		'table-of-contents',
	];

	/**
	 * V3 theme-builder widgets used inside theme documents. Always exposed to MCP regardless of
	 * the V4 experiment because atomic equivalents rely on dynamic tags, which need a legacy
	 * fallback for existing theme templates.
	 */
	const V3_ALLOWLIST_THEME = [
		'theme-post-content',
		'theme-post-title',
		'theme-post-featured-image',
		'theme-post-excerpt',
		'theme-archive-title',
	];

	/**
	 * V3 container elements that lay out other elements. Only exposed to MCP when the V4
	 * atomic-elements experiment is inactive, because when V4 is on the LLM uses
	 * `e-div-block` / `e-flexbox` instead. Without this, a V4-off catalog contains widgets
	 * with no branches to attach them to and the LLM cannot assemble a page.
	 */
	const V3_ALLOWLIST_CONTAINERS = [
		'container',
	];

	/**
	 * V3 basic widgets that duplicate V4 atomic widgets. Only exposed to MCP when the V4
	 * atomic-elements experiment is inactive, so the LLM never gets both a V3 heading and a
	 * V4 e-heading in the same catalog.
	 */
	const V3_ALLOWLIST_BASIC = [
		'heading',
		'text-editor',
		'image',
		'video',
		'button',
		'icon',
		'spacer',
		'divider',
		'html',
		'image-box',
		'icon-box',
		'accordion',
		'tabs',
		'toggle',
		'counter',
		'icon-list',
		'testimonial',
	];

	/**
	 * @deprecated 3.36.0 Use {@see get_allowlisted_v3_types()}. Retained so external code that
	 * inlined the constant keeps compiling; the returned list matches the V4-on catalog.
	 */
	const V3_ALLOWLIST = [
		'nav-menu',
		'search',
		'table-of-contents',
		'theme-post-content',
		'theme-post-title',
		'theme-post-featured-image',
		'theme-post-excerpt',
		'theme-archive-title',
	];

	const INNER_ELEMENTS_NOT_SUPPORTED_NOTE = 'Only the properties listed under each alias `accepted_css_properties` are converted. Anything else inside an alias block is rejected and reported in `warnings` — it is not written to `custom_css`. Declarations outside an alias block target the widget wrapper.';

	const V3_FALLBACK_MESSAGE = '`properties` lists the only keys accepted in `element_config` / `manage-elements.settings` for this widget. Put visual styling in the `style` (CSS) input; when `inner_elements` is present, scope rules per alias (e.g. `main-menu { color: red; }`) — see `inner_elements` descriptions.';

	const V3_FALLBACK_FIELDS_NOTE = 'All properties are optional. Object-typed properties describe common shapes but do not include exhaustive inner validation.';

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
		return in_array( $widget_type, self::get_allowlisted_v3_types(), true );
	}

	/**
	 * When the LLM asks for a V4 atomic type on a site where the V4 experiment is off, tell it
	 * so — and, when we can guess the intended V3 equivalent, name it. Returns null when there
	 * is nothing to add (V4 is on, or the type is not an `e-*` we recognize).
	 *
	 * @param string $widget_type The type the LLM asked for.
	 */
	public static function v4_off_type_hint( string $widget_type ): ?string {
		if ( AtomicWidgetsModule::is_active() ) {
			return null;
		}

		if ( 0 !== strpos( $widget_type, 'e-' ) ) {
			return null;
		}

		$v3_equivalent = self::V4_TO_V3_TYPE_HINTS[ $widget_type ] ?? null;

		if ( null === $v3_equivalent ) {
			return sprintf(
				/* translators: %s: widget type */
				__( '`%s` is a V4 atomic widget, but the V4 atomic experiment is off on this site — V4 widgets are not registered. Call `elementor/list-widget-schemas` to see the available V3 catalog.', 'elementor' ),
				$widget_type
			);
		}

		return sprintf(
			/* translators: 1: v4 widget type, 2: v3 equivalent */
			__( '`%1$s` is a V4 atomic widget, but the V4 atomic experiment is off on this site — use `%2$s` instead. Call `elementor/list-widget-schemas` to see the available V3 catalog.', 'elementor' ),
			$widget_type,
			$v3_equivalent
		);
	}

	private const V4_TO_V3_TYPE_HINTS = [
		'e-heading' => 'heading',
		'e-paragraph' => 'text-editor',
		'e-image' => 'image',
		'e-button' => 'button',
		'e-svg' => 'icon',
		'e-icon' => 'icon',
		'e-divider' => 'divider',
		'e-div-block' => 'container',
		'e-flexbox' => 'container',
	];

	/**
	 * Full list of V3 widget types the LLM catalog exposes for the current V4 experiment state.
	 *
	 * V4 atomic experiment on  → gap + theme (v3 basics live as V4 atomic widgets already).
	 * V4 atomic experiment off → containers + basic + gap + theme. Containers are needed so
	 * the LLM has a layout box to place the basics into; without them the catalog is leaves
	 * with no branches.
	 *
	 * @return string[]
	 */
	public static function get_allowlisted_v3_types(): array {
		$types = array_merge( self::V3_ALLOWLIST_GAP, self::V3_ALLOWLIST_THEME );

		if ( ! AtomicWidgetsModule::is_active() ) {
			$types = array_merge( self::V3_ALLOWLIST_CONTAINERS, self::V3_ALLOWLIST_BASIC, $types );
		}

		return $types;
	}

	public static function build_widget_summary( string $widget_type, array $config ): array {
		return self::filter_nulls( [
			'type' => $widget_type,
			'version' => self::get_widget_version( $config ),
			'description' => self::get_description( $config, $widget_type ),
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

			$allowed_keys = V3_Widget_Map_Loader::get_non_style_keys( $widget_type, $config['controls'] );
			$built = V3_Json_Schema_Builder::build( $config['controls'], $allowed_keys );
			$inner_elements = self::build_inner_elements_schema( $widget_type, $config );

			return self::filter_nulls( [
				'type' => 'object',
				'widget_version' => self::VERSION_V3,
				'description' => self::get_description( $config, $widget_type ),
				'message' => self::V3_FALLBACK_MESSAGE,
				'fields_note' => self::V3_FALLBACK_FIELDS_NOTE,
				'properties' => $built['properties'],
				'required' => $built['required'],
				'additionalProperties' => false,
				'inner_elements' => $inner_elements,
			] );
		}

		$properties = self::build_configurable_properties_schema( $props_schema );

		return self::filter_nulls( [
			'type' => 'object',
			'properties' => $properties,
			'description' => self::get_description( $config, $widget_type ),
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

	private static function get_description( array $config, ?string $widget_type = null ): ?string {
		$description = $config['meta']['description'] ?? null;

		if ( is_string( $description ) && '' !== $description ) {
			return $description;
		}

		if ( null !== $widget_type && self::is_v3_allowlisted( $widget_type ) ) {
			return V3_Widget_Map_Loader::get_description( $widget_type );
		}

		return null;
	}

	private static function filter_nulls( array $data ): array {
		return array_filter( $data, fn( $value ) => null !== $value );
	}

	/**
	 * @param string               $widget_type
	 * @param array<string, mixed> $config
	 * @return array<string, array<string, mixed>>|null
	 */
	private static function build_inner_elements_schema( string $widget_type, array $config ): ?array {
		$controls = is_array( $config['controls'] ?? null ) ? $config['controls'] : [];
		$inner_elements = V3_Widget_Map_Loader::get_inner_elements( $widget_type, $controls );

		if ( empty( $inner_elements ) ) {
			return null;
		}

		$elements = [];

		foreach ( $inner_elements as $alias => $inner_element ) {
			if ( ! is_string( $alias ) || ! is_array( $inner_element ) ) {
				continue;
			}

			$label = $inner_element['label'] ?? $alias;
			$states = V3_Auto_Mapper::supported_states( $config, $inner_element );
			$state_hint = empty( $states )
				? ''
				: sprintf(
					' Supports :%s.',
					implode( ', :', $states )
				);

			$elements[ $alias ] = [
				'label' => is_string( $label ) ? $label : $alias,
				'description' => sprintf(
					'Style with `%s { ... }` inside the widget `style` string.%s Supports @media breakpoints.',
					$alias,
					$state_hint
				),
				'accepted_css_properties' => V3_Auto_Mapper::accepted_css_properties( $config, $inner_element ),
				'supported_states' => $states,
			];
		}

		if ( empty( $elements ) ) {
			return null;
		}

		return [
			'default' => V3_Widget_Map_Loader::get_default_inner_element( $widget_type, $controls ),
			'not_supported_note' => self::INNER_ELEMENTS_NOT_SUPPORTED_NOTE,
			'elements' => $elements,
		];
	}
}
