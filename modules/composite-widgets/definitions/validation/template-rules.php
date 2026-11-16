<?php

namespace Elementor\Modules\CompositeWidgets\Definitions\Validation;

use Elementor\Core\Utils\Api\Parse_Errors;
use Elementor\Modules\AtomicWidgets\Elements\Base\Widget_Markers;
use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use Elementor\Modules\CompositeWidgets\Definitions\Widget_Definition;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Template_Rules {
	const ALLOWED_PART_TYPES_FILTER = 'elementor/composite-widgets/allowed-part-types';
	const DEFAULT_ALLOWED_PART_TYPES = [
		'e-flexbox',
		'e-div-block',
		'e-grid',
		'e-heading',
		'e-paragraph',
		'e-button',
		'e-image',
		'e-svg',
		'e-divider',
	];
	const WIDGET_EL_TYPE = 'widget';
	const TEMPLATE_PATH = 'template';
	const EL_TYPE_KEY = 'elType';
	const WIDGET_TYPE_KEY = 'widgetType';
	const FORBIDDEN_NODE_KEYS = [ 'id', Widget_Markers::WIDGET_KEY ];

	private Variable_References $variable_references;
	private Local_Style_Rules $local_style_rules;
	private Parse_Errors $errors;

	/** @var array<string, array{path: string, schema: array}> */
	private array $parts = [];

	/** @var array<string, string> Repeater container part => item part */
	private array $repeater_items = [];
	private array $allowed_types = [];
	private bool $forbids_globals = true;
	private bool $is_inside_slot = false;

	public function __construct( Variable_References $variable_references, Local_Style_Rules $local_style_rules ) {
		$this->variable_references = $variable_references;
		$this->local_style_rules = $local_style_rules;
	}

	/**
	 * @return array<string, array{path: string, schema: array}> Part name => where it is and its element's props schema.
	 */
	public function validate( array $definition, Parse_Errors $errors ): array {
		$this->errors = $errors;
		$this->parts = [];
		$this->repeater_items = $this->get_repeater_items( $definition['general'] );
		$this->allowed_types = $this->get_allowed_types();
		$this->forbids_globals = Widget_Definition::SOURCE_CODE === $definition['source'];
		$this->is_inside_slot = false;

		$this->validate_node( $definition['template'], self::TEMPLATE_PATH, true );

		return $this->parts;
	}

	/**
	 * @return string[] Part names in the node's subtree, used to compare repeater items.
	 */
	private function validate_node( $node, string $path, bool $indexes_parts ): array {
		if ( ! is_array( $node ) || ! empty( array_intersect_key( $node, array_flip( self::FORBIDDEN_NODE_KEYS ) ) ) ) {
			$this->errors->add( $path, Definition_Error_Codes::TEMPLATE_NODE_INVALID );
			return [];
		}

		$schema = $this->get_props_schema( $node, $path );
		$part = $this->validate_part_name( $node, $path );
		$is_slot = $this->validate_slot( $node, $path, $part );
		$part = $this->drop_part_inside_slot( $path, $part );

		if ( null !== $part && $indexes_parts ) {
			$this->index_part( $part, $path, $schema );
		}

		if ( null !== $schema ) {
			$this->validate_settings( $node, $path, $schema );
		}

		$this->local_style_rules->validate( $node, $path, $part, $this->errors );

		if ( $this->forbids_globals ) {
			$this->validate_no_global_references( $node, $path );
		}

		$parts = null !== $part ? [ $part ] : [];
		$children_parts = $this->in_slot_scope(
			$is_slot,
			fn () => $this->validate_children( $node, $path, $part, $indexes_parts )
		);

		return array_merge( $parts, $children_parts );
	}

	private function validate_slot( array $node, string $path, ?string $part ): bool {
		if ( ! array_key_exists( Widget_Markers::SLOT_KEY, $node ) ) {
			return false;
		}

		if ( ! $this->can_be_slot( $node, $path, $part ) ) {
			$this->errors->add( "{$path}.slot", Definition_Error_Codes::SLOT_INVALID );
			return false;
		}

		return true;
	}

	private function can_be_slot( array $node, string $path, ?string $part ): bool {
		$is_enabled = Widget_Markers::sanitize_slot( $node[ Widget_Markers::SLOT_KEY ] );
		$is_named_part = null !== $part;
		$is_below_root = self::TEMPLATE_PATH !== $path;
		$is_container = self::WIDGET_EL_TYPE !== ( $node[ self::EL_TYPE_KEY ] ?? null );

		return $is_enabled && $is_named_part && $is_below_root && $is_container;
	}

	private function drop_part_inside_slot( string $path, ?string $part ): ?string {
		if ( null === $part || ! $this->is_inside_slot ) {
			return $part;
		}

		$this->errors->add( "{$path}.part", Definition_Error_Codes::SLOT_CONTENT_PART );

		return null;
	}

	/**
	 * @return string[]
	 */
	private function in_slot_scope( bool $opens_slot, callable $validate ): array {
		$was_inside_slot = $this->is_inside_slot;
		$this->is_inside_slot = $was_inside_slot || $opens_slot;

		try {
			return $validate();
		} finally {
			$this->is_inside_slot = $was_inside_slot;
		}
	}

	private function validate_children( array $node, string $path, ?string $part, bool $indexes_parts ): array {
		$children = $node['elements'] ?? [];

		if ( ! is_array( $children ) ) {
			$this->errors->add( "{$path}.elements", Definition_Error_Codes::TEMPLATE_NODE_INVALID );
			return [];
		}

		$item_part = null !== $part ? ( $this->repeater_items[ $part ] ?? null ) : null;

		if ( null === $item_part ) {
			return $this->validate_plain_children( $children, $path, $indexes_parts );
		}

		return $this->validate_repeater_children( $children, $path, $item_part, $indexes_parts );
	}

	private function validate_plain_children( array $children, string $path, bool $indexes_parts ): array {
		$parts = [];

		foreach ( $children as $index => $child ) {
			$parts = array_merge( $parts, $this->validate_node( $child, "{$path}.elements.{$index}", $indexes_parts ) );
		}

		return $parts;
	}

	/**
	 * Items repeat the same part names: only the first item is indexed, and every later item
	 * must have the same set of parts as the first one.
	 */
	private function validate_repeater_children( array $children, string $path, string $item_part, bool $indexes_parts ): array {
		$parts = [];
		$first_item_parts = null;

		foreach ( $children as $index => $child ) {
			$child_path = "{$path}.elements.{$index}";

			if ( ! $this->is_repeater_item( $child, $item_part ) ) {
				$parts = array_merge( $parts, $this->validate_node( $child, $child_path, $indexes_parts ) );
				continue;
			}

			if ( null === $first_item_parts ) {
				$first_item_parts = $this->validate_node( $child, $child_path, $indexes_parts );
				$parts = array_merge( $parts, $first_item_parts );
				continue;
			}

			$item_parts = $this->validate_node( $child, $child_path, false );

			if ( ! $this->have_same_parts( $first_item_parts, $item_parts ) ) {
				$this->errors->add( $child_path, Definition_Error_Codes::REPEATER_ITEM_SHAPE_MISMATCH );
			}
		}

		return $parts;
	}

	private function is_repeater_item( $child, string $item_part ): bool {
		$child_part = is_array( $child ) ? ( $child[ Widget_Markers::PART_KEY ] ?? null ) : null;

		return $child_part === $item_part;
	}

	private function get_allowed_types(): array {
		$allowed_types = apply_filters( self::ALLOWED_PART_TYPES_FILTER, self::DEFAULT_ALLOWED_PART_TYPES );

		return is_array( $allowed_types ) ? $allowed_types : self::DEFAULT_ALLOWED_PART_TYPES;
	}

	/**
	 * Widgets (`elType: widget` + `widgetType`) and elements (`elType` only) are looked up in their own manager,
	 * so `{ elType: 'e-heading' }` doesn't resolve to the `e-heading` widget.
	 */
	private function get_props_schema( array $node, string $path ): ?array {
		$is_widget = self::WIDGET_EL_TYPE === ( $node['elType'] ?? null );
		$type_key = $is_widget ? self::WIDGET_TYPE_KEY : self::EL_TYPE_KEY;
		$type_path = "{$path}.{$type_key}";
		$element_type = $node[ $type_key ] ?? null;

		if ( ! $is_widget && array_key_exists( self::WIDGET_TYPE_KEY, $node ) ) {
			$this->errors->add( "{$path}." . self::WIDGET_TYPE_KEY, Definition_Error_Codes::TEMPLATE_NODE_INVALID );
			return null;
		}

		if ( ! is_string( $element_type ) || '' === $element_type ) {
			$this->errors->add( $type_path, Definition_Error_Codes::TEMPLATE_NODE_INVALID );
			return null;
		}

		if ( ! in_array( $element_type, $this->allowed_types, true ) ) {
			$this->errors->add( $type_path, Definition_Error_Codes::PART_TYPE_NOT_ALLOWED );
			return null;
		}

		$element = $is_widget
			? Plugin::$instance->widgets_manager->get_widget_types( $element_type )
			: Plugin::$instance->elements_manager->get_element_types( $element_type );

		if ( ! $element || ! method_exists( $element, 'get_props_schema' ) ) {
			$this->errors->add( $type_path, Definition_Error_Codes::ELEMENT_TYPE_NOT_FOUND );
			return null;
		}

		return $element::get_props_schema();
	}

	private function validate_part_name( array $node, string $path ): ?string {
		if ( ! array_key_exists( Widget_Markers::PART_KEY, $node ) ) {
			return null;
		}

		$part = $node[ Widget_Markers::PART_KEY ];

		if ( ! is_string( $part ) || ! preg_match( Widget_Markers::PART_PATTERN, $part ) ) {
			$this->errors->add( "{$path}.part", Definition_Error_Codes::PART_INVALID );
			return null;
		}

		return $part;
	}

	/**
	 * The element's props schema is kept so field targets can be checked against it later.
	 */
	private function index_part( string $part, string $path, ?array $schema ): void {
		if ( isset( $this->parts[ $part ] ) ) {
			$this->errors->add( "{$path}.part", Definition_Error_Codes::PART_DUPLICATE );
			return;
		}

		$this->parts[ $part ] = [
			'path' => $path,
			'schema' => $schema ?? [],
		];
	}

	private function validate_settings( array $node, string $path, array $schema ): void {
		$settings = $node['settings'] ?? [];

		if ( ! is_array( $settings ) ) {
			$this->errors->add( "{$path}.settings", Definition_Error_Codes::TEMPLATE_SETTINGS_INVALID );
			return;
		}

		$result = Props_Parser::make( $schema )->validate( $settings );

		foreach ( $result->errors()->all() as $error ) {
			$this->errors->add( "{$path}.settings.{$error['key']}", Definition_Error_Codes::TEMPLATE_SETTINGS_INVALID );
		}
	}

	private function validate_no_global_references( array $node, string $path ): void {
		$local_style_ids = is_array( $node['styles'] ?? null ) ? array_keys( $node['styles'] ) : [];
		$classes = $node['settings']['classes']['value'] ?? [];

		if ( is_array( $classes ) && ! empty( array_diff( $classes, $local_style_ids ) ) ) {
			$this->errors->add( "{$path}.settings.classes", Definition_Error_Codes::GLOBAL_REFERENCE_NOT_ALLOWED );
		}

		foreach ( [ 'settings', 'styles' ] as $key ) {
			if ( ! is_array( $node[ $key ] ?? null ) ) {
				continue;
			}

			foreach ( $this->variable_references->find_paths( $node[ $key ], "{$path}.{$key}" ) as $reference_path ) {
				$this->errors->add( $reference_path, Definition_Error_Codes::GLOBAL_REFERENCE_NOT_ALLOWED );
			}
		}
	}

	private function get_repeater_items( array $general ): array {
		$repeater_items = [];

		foreach ( $general as $entry ) {
			if ( is_array( $entry ) && isset( $entry['repeater'] ) && is_string( $entry['container'] ?? null ) && is_string( $entry['item'] ?? null ) ) {
				$repeater_items[ $entry['container'] ] = $entry['item'];
			}
		}

		return $repeater_items;
	}

	private function have_same_parts( array $expected, array $actual ): bool {
		sort( $expected );
		sort( $actual );

		return $expected === $actual;
	}
}
