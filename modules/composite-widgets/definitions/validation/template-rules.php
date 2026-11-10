<?php

namespace Elementor\Modules\CompositeWidgets\Definitions\Validation;

use Elementor\Core\Utils\Api\Parse_Errors;
use Elementor\Modules\AtomicWidgets\Elements\Base\Widget_Markers;
use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use Elementor\Modules\AtomicWidgets\Parsers\Style_Parser;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\CompositeWidgets\Definitions\Widget_Definition;
use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;

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
	const FORBIDDEN_NODE_KEYS = [ 'id', Widget_Markers::WIDGET_KEY ];

	private Variable_References $variable_references;
	private Parse_Errors $errors;

	/** @var array<string, array{path: string, schema: array}> */
	private array $parts = [];

	/** @var array<string, string> Repeater container part => item part */
	private array $repeater_items = [];
	private array $allowed_types = [];
	private bool $forbids_globals = true;

	public function __construct( Variable_References $variable_references ) {
		$this->variable_references = $variable_references;
	}

	/**
	 * @return array<string, array{path: string, schema: array}> Part name => where it is and its element's props schema.
	 */
	public function validate( array $definition, Parse_Errors $errors ): array {
		$this->errors = $errors;
		$this->parts = [];
		$this->repeater_items = $this->get_repeater_items( $definition['general'] );
		$this->allowed_types = apply_filters( self::ALLOWED_PART_TYPES_FILTER, self::DEFAULT_ALLOWED_PART_TYPES );
		$this->forbids_globals = Widget_Definition::SOURCE_CODE === $definition['source'];

		$this->validate_node( $definition['template'], 'template', true );

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

		$element_type = $this->get_element_type( $node, $path );
		$schema = $element_type ? $this->get_props_schema( $element_type, $path ) : null;
		$part = $this->validate_part( $node, $path, $schema, $indexes_parts );

		if ( null !== $schema ) {
			$this->validate_settings( $node, $path, $schema );
		}

		$this->validate_styles( $node, $path, $part );

		if ( $this->forbids_globals ) {
			$this->validate_no_global_references( $node, $path );
		}

		$parts = null !== $part ? [ $part ] : [];

		return array_merge( $parts, $this->validate_children( $node, $path, $part, $indexes_parts ) );
	}

	private function validate_children( array $node, string $path, ?string $part, bool $indexes_parts ): array {
		$children = $node['elements'] ?? [];

		if ( ! is_array( $children ) ) {
			$this->errors->add( "{$path}.elements", Definition_Error_Codes::TEMPLATE_NODE_INVALID );
			return [];
		}

		$item_part = null !== $part ? ( $this->repeater_items[ $part ] ?? null ) : null;
		$first_item_parts = null;
		$parts = [];

		foreach ( $children as $index => $child ) {
			$child_path = "{$path}.elements.{$index}";
			$child_part = is_array( $child ) ? ( $child[ Widget_Markers::PART_KEY ] ?? null ) : null;
			$is_repeated_item = null !== $item_part && $child_part === $item_part;
			$is_first_item = $is_repeated_item && null === $first_item_parts;

			$child_parts = $this->validate_node( $child, $child_path, $indexes_parts && ( ! $is_repeated_item || $is_first_item ) );

			if ( ! $is_repeated_item ) {
				$parts = array_merge( $parts, $child_parts );
				continue;
			}

			if ( $is_first_item ) {
				$first_item_parts = $child_parts;
				$parts = array_merge( $parts, $child_parts );
				continue;
			}

			if ( ! $this->have_same_parts( $first_item_parts, $child_parts ) ) {
				$this->errors->add( $child_path, Definition_Error_Codes::REPEATER_ITEM_SHAPE_MISMATCH );
			}
		}

		return $parts;
	}

	private function get_element_type( array $node, string $path ): ?string {
		$el_type = $node['elType'] ?? null;
		$is_widget = self::WIDGET_EL_TYPE === $el_type;
		$element_type = $is_widget ? ( $node['widgetType'] ?? null ) : $el_type;
		$type_path = $is_widget ? "{$path}.widgetType" : "{$path}.elType";

		if ( ! is_string( $element_type ) || '' === $element_type ) {
			$this->errors->add( $type_path, Definition_Error_Codes::TEMPLATE_NODE_INVALID );
			return null;
		}

		if ( ! in_array( $element_type, $this->allowed_types, true ) ) {
			$this->errors->add( $type_path, Definition_Error_Codes::PART_TYPE_NOT_ALLOWED );
			return null;
		}

		return $element_type;
	}

	private function get_props_schema( string $element_type, string $path ): ?array {
		$element = Atomic_Elements_Utils::get_element_instance( $element_type );

		if ( ! $element || ! method_exists( $element, 'get_props_schema' ) ) {
			$this->errors->add( $path, Definition_Error_Codes::ELEMENT_TYPE_NOT_FOUND );
			return null;
		}

		return $element::get_props_schema();
	}

	private function validate_part( array $node, string $path, ?array $schema, bool $indexes_parts ): ?string {
		if ( ! array_key_exists( Widget_Markers::PART_KEY, $node ) ) {
			return null;
		}

		$part = $node[ Widget_Markers::PART_KEY ];

		if ( ! is_string( $part ) || ! preg_match( Widget_Markers::PART_PATTERN, $part ) ) {
			$this->errors->add( "{$path}.part", Definition_Error_Codes::PART_INVALID );
			return null;
		}

		if ( ! $indexes_parts ) {
			return $part;
		}

		if ( isset( $this->parts[ $part ] ) ) {
			$this->errors->add( "{$path}.part", Definition_Error_Codes::PART_DUPLICATE );
			return $part;
		}

		$this->parts[ $part ] = [
			'path' => $path,
			'schema' => $schema ?? [],
		];

		return $part;
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

	private function validate_styles( array $node, string $path, ?string $part ): void {
		$styles = $node['styles'] ?? [];

		if ( ! is_array( $styles ) ) {
			$this->errors->add( "{$path}.styles", Definition_Error_Codes::TEMPLATE_STYLE_INVALID );
			return;
		}

		$expected_style_id = null !== $part ? Widget_Markers::get_template_local_style_id( $part ) : null;
		$style_parser = Style_Parser::make( Style_Schema::get() );

		foreach ( $styles as $style_id => $style ) {
			$style_path = "{$path}.styles.{$style_id}";

			if ( $expected_style_id !== $style_id || ! is_array( $style ) || ( $style['id'] ?? null ) !== $style_id ) {
				$this->errors->add( $style_path, Definition_Error_Codes::TEMPLATE_STYLE_INVALID );
				continue;
			}

			$result = $style_parser->parse( $style );

			foreach ( $result->errors()->all() as $error ) {
				$this->errors->add( "{$style_path}.{$error['key']}", Definition_Error_Codes::TEMPLATE_STYLE_INVALID );
			}
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
