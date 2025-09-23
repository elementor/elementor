<?php
namespace Elementor\Modules\CssConverter\Services\AtomicWidgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Widget_Json_Generator {
	
	private Widget_Id_Generator $id_generator;
	
	public function __construct() {
		$this->id_generator = new Widget_Id_Generator();
	}
	
	public function generate_widget_json( string $widget_type, array $validated_props, array $html_element ): array {
		$widget_id = $this->id_generator->generate_widget_id();
		
		$widget = [
			'id' => $widget_id,
			'elType' => $this->get_element_type( $widget_type ),
			'widgetType' => $widget_type,
			'settings' => $this->convert_props_to_settings( $validated_props, $html_element ),
			'isInner' => false,
			'elements' => [],
			'version' => '0.0',
		];
		
		$styles = $this->generate_styles_from_html( $html_element, $widget_id );
		if ( ! empty( $styles ) ) {
			$widget['styles'] = $styles;
		}
		
		$editor_settings = $this->generate_editor_settings( $validated_props );
		if ( ! empty( $editor_settings ) ) {
			$widget['editor_settings'] = $editor_settings;
		}
		
		return $widget;
	}
	
	private function get_element_type( string $widget_type ): string {
		return in_array( $widget_type, [ 'e-flexbox' ], true ) ? 'e-flexbox' : 'widget';
	}
	
	private function convert_props_to_settings( array $validated_props, array $html_element ): array {
		$settings = [];
		
		foreach ( $validated_props as $prop_name => $prop_value ) {
			$settings[ $prop_name ] = $this->format_prop_for_settings( $prop_value );
		}
		
		if ( ! empty( $html_element['attributes'] ) ) {
			$settings['attributes'] = $html_element['attributes'];
		}
		
		return $settings;
	}
	
	private function format_prop_for_settings( $prop_value ) {
		if ( is_array( $prop_value ) && isset( $prop_value['$$type'] ) ) {
			return $prop_value;
		}
		
		if ( is_string( $prop_value ) ) {
			return [
				'$$type' => 'string',
				'value' => $prop_value,
			];
		}
		
		if ( is_numeric( $prop_value ) ) {
			return [
				'$$type' => 'number',
				'value' => $prop_value,
			];
		}
		
		if ( is_bool( $prop_value ) ) {
			return [
				'$$type' => 'boolean',
				'value' => $prop_value,
			];
		}
		
		if ( is_array( $prop_value ) ) {
			return [
				'$$type' => 'array',
				'value' => $prop_value,
			];
		}
		
		return $prop_value;
	}
	
	private function generate_styles_from_html( array $html_element, string $widget_id ): array {
		$styles = [];
		
		if ( empty( $html_element['inline_styles'] ) ) {
			return $styles;
		}
		
		$class_id = $this->id_generator->generate_class_id( $widget_id );
		
		$styles[ $class_id ] = [
			'id' => $class_id,
			'label' => 'local',
			'type' => 'class',
			'variants' => [
				[
					'meta' => [
						'breakpoint' => 'desktop',
						'state' => null,
					],
					'props' => $this->convert_inline_styles_to_props( $html_element['inline_styles'] ),
					'custom_css' => null,
				],
			],
		];
		
		return $styles;
	}
	
	private function convert_inline_styles_to_props( array $inline_styles ): array {
		$props = [];
		
		foreach ( $inline_styles as $property => $value ) {
			$converted_prop = $this->convert_css_property_to_atomic_prop( $property, $value );
			
			if ( $converted_prop !== null ) {
				$props[ $property ] = $converted_prop;
			}
		}
		
		return $props;
	}
	
	private function convert_css_property_to_atomic_prop( string $property, $value ): ?array {
		switch ( $property ) {
			case 'color':
			case 'background-color':
				return $this->create_color_prop( $value );
				
			case 'font-size':
			case 'width':
			case 'height':
			case 'max-width':
			case 'min-width':
				return $this->create_size_prop( $value );
				
			case 'margin':
			case 'padding':
				return $this->create_dimensions_prop( $value );
				
			case 'display':
			case 'text-align':
			case 'font-weight':
			case 'text-decoration':
				return $this->create_string_prop( $value );
				
			default:
				return $this->create_string_prop( $value );
		}
	}
	
	private function create_color_prop( $value ): array {
		return [
			'$$type' => 'color',
			'value' => $this->normalize_color_value( $value ),
		];
	}
	
	private function create_size_prop( $value ): array {
		$parsed = $this->parse_size_value( $value );
		
		return [
			'$$type' => 'size',
			'value' => [
				'size' => $parsed['size'],
				'unit' => $parsed['unit'],
			],
		];
	}
	
	private function create_dimensions_prop( $value ): array {
		$parsed = $this->parse_dimensions_value( $value );
		
		return [
			'$$type' => 'dimensions',
			'value' => [
				'block-start' => [ '$$type' => 'size', 'value' => $parsed['top'] ],
				'inline-end' => [ '$$type' => 'size', 'value' => $parsed['right'] ],
				'block-end' => [ '$$type' => 'size', 'value' => $parsed['bottom'] ],
				'inline-start' => [ '$$type' => 'size', 'value' => $parsed['left'] ],
			],
		];
	}
	
	private function create_string_prop( $value ): array {
		return [
			'$$type' => 'string',
			'value' => (string) $value,
		];
	}
	
	private function normalize_color_value( $value ): string {
		$value = trim( (string) $value );
		
		if ( preg_match( '/^#[0-9a-f]{3,6}$/i', $value ) ) {
			return strtolower( $value );
		}
		
		if ( preg_match( '/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i', $value, $matches ) ) {
			return sprintf( '#%02x%02x%02x', $matches[1], $matches[2], $matches[3] );
		}
		
		return $value;
	}
	
	private function parse_size_value( $value ): array {
		$value = trim( (string) $value );
		
		if ( preg_match( '/^(\d*\.?\d+)(px|em|rem|%|vh|vw|vmin|vmax)$/i', $value, $matches ) ) {
			return [
				'size' => (float) $matches[1],
				'unit' => strtolower( $matches[2] ),
			];
		}
		
		if ( is_numeric( $value ) ) {
			return [
				'size' => (float) $value,
				'unit' => 'px',
			];
		}
		
		return [
			'size' => 0,
			'unit' => 'px',
		];
	}
	
	private function parse_dimensions_value( $value ): array {
		$value = trim( (string) $value );
		$parts = preg_split( '/\s+/', $value );
		
		$default_size = [ 'size' => 0, 'unit' => 'px' ];
		
		switch ( count( $parts ) ) {
			case 1:
				$parsed = $this->parse_size_value( $parts[0] );
				return [
					'top' => $parsed,
					'right' => $parsed,
					'bottom' => $parsed,
					'left' => $parsed,
				];
				
			case 2:
				$vertical = $this->parse_size_value( $parts[0] );
				$horizontal = $this->parse_size_value( $parts[1] );
				return [
					'top' => $vertical,
					'right' => $horizontal,
					'bottom' => $vertical,
					'left' => $horizontal,
				];
				
			case 3:
				return [
					'top' => $this->parse_size_value( $parts[0] ),
					'right' => $this->parse_size_value( $parts[1] ),
					'bottom' => $this->parse_size_value( $parts[2] ),
					'left' => $this->parse_size_value( $parts[1] ),
				];
				
			case 4:
				return [
					'top' => $this->parse_size_value( $parts[0] ),
					'right' => $this->parse_size_value( $parts[1] ),
					'bottom' => $this->parse_size_value( $parts[2] ),
					'left' => $this->parse_size_value( $parts[3] ),
				];
				
			default:
				return [
					'top' => $default_size,
					'right' => $default_size,
					'bottom' => $default_size,
					'left' => $default_size,
				];
		}
	}
	
	private function generate_editor_settings( array $validated_props ): array {
		return [];
	}
}
