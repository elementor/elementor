<?php
namespace Elementor\Modules\CssConverter\Services\Css;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Nested_Selector_Flattening_Service {

	private $parser;
	private $name_generator;
	private $flattened_classes = [];

	public function __construct( 
		Nested_Selector_Parser $parser = null,
		Flattened_Class_Name_Generator $name_generator = null
	) {
		$this->parser = $parser ?: Nested_Selector_Parser::make();
		$this->name_generator = $name_generator ?: Flattened_Class_Name_Generator::make();
	}

	public static function make(): self {
		return new self();
	}

	public function should_flatten_selector( string $selector ): bool {
		// Never flatten selectors containing ID components - they need proper specificity calculation
		if ( strpos( $selector, '#' ) !== false ) {
			return false;
		}
		
		return $this->parser->is_nested_selector( $selector );
	}

	public function flatten_css_rule( array $rule ): array {
		$selector = $rule['selector'] ?? '';
		$properties = $rule['properties'] ?? [];

		if ( ! $this->should_flatten_selector( $selector ) ) {
			return $rule;
		}

		$parsed_selector = $this->parser->parse_nested_selector( $selector );
		if ( null === $parsed_selector ) {
			return $rule;
		}

		$flattened_class_name = $this->name_generator->generate_flattened_class_name( $parsed_selector );

		// Store the flattened class for global classes creation
		$this->flattened_classes[ $flattened_class_name ] = [
			'id' => $flattened_class_name,
			'label' => $flattened_class_name,
			'original_selector' => $selector,
			'flattened_selector' => '.' . $flattened_class_name,
			'properties' => $properties,
			'specificity' => $parsed_selector['specificity'],
			'css_converter_specificity' => $parsed_selector['specificity'],
			'css_converter_original_selector' => $selector,
		];

		// Return modified rule with flattened selector
		return [
			'selector' => '.' . $flattened_class_name,
			'properties' => $properties,
			'original_selector' => $selector,
			'flattened' => true,
			'global_class_id' => $flattened_class_name,
		];
	}

	public function get_flattened_classes(): array {
		return $this->flattened_classes;
	}

	public function clear_flattened_classes(): void {
		$this->flattened_classes = [];
	}

	public function get_flattened_classes_for_global_storage(): array {
		$global_classes = [];

		foreach ( $this->flattened_classes as $class_data ) {
			// Convert properties to the format expected by global classes
			$style_properties = [];
			foreach ( $class_data['properties'] as $property_data ) {
				$property = $property_data['property'] ?? '';
				$value = $property_data['value'] ?? '';
				
				if ( ! empty( $property ) && ! empty( $value ) ) {
					$style_properties[] = [
						'property' => $property,
						'value' => $value,
						'original_property' => $property,
					];
				}
			}

			$class_id = $class_data['id'];
			$global_classes[ $class_id ] = [
				'id' => $class_id,
				'label' => $class_data['label'],
				'type' => 'class',
				'properties' => $style_properties,
				'original_selector' => $class_data['original_selector'],
				'css_converter_specificity' => $class_data['css_converter_specificity'],
				'css_converter_original_selector' => $class_data['css_converter_original_selector'],
			];
		}

		return $global_classes;
	}

	public function get_flattened_classes_count(): int {
		return count( $this->flattened_classes );
	}
}
