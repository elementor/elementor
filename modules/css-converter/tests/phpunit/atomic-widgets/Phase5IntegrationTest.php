<?php

namespace Elementor\Modules\CssConverter\Tests\PhpUnit\AtomicWidgets;

use PHPUnit\Framework\TestCase;
use Elementor\Modules\CssConverter\Services\AtomicWidgets\Widget_JSON_Generator;
use Elementor\Modules\CssConverter\Services\AtomicWidgets\Atomic_Widget_Service;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\Implementations\Atomic_Prop_Mapper_Factory;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Phase5IntegrationTest extends TestCase {

	private $widget_json_generator;
	private $atomic_widget_service;

	protected function setUp(): void {
		$this->atomic_widget_service = new Atomic_Widget_Service();
		$this->widget_json_generator = new Widget_JSON_Generator( $this->atomic_widget_service );
	}

	public function test_widget_json_generator_integration_with_factory() {
		$css_properties = [
			'color' => '#ff0000',
			'font-size' => '18px',
			'margin' => '10px 20px',
			'background-color' => '#ffffff'
		];

		$heading_widget = $this->widget_json_generator->create_heading_widget( 'Test Heading', $css_properties );

		$this->assertIsArray( $heading_widget );
		$this->assertEquals( 'atomic-heading', $heading_widget['widgetType'] ?? $heading_widget['widget_type'] );
		$this->assertArrayHasKey( 'settings', $heading_widget );
		$this->assertArrayHasKey( 'title', $heading_widget['settings'] );
		$this->assertEquals( 'Test Heading', $heading_widget['settings']['title']['value'] );
	}

	public function test_css_property_conversion_through_widget_generator() {
		$css_properties = [
			'transform' => 'translateX(10px) rotate(45deg)',
			'transition' => 'opacity 0.3s ease',
			'box-shadow' => '2px 2px 4px rgba(0,0,0,0.3)',
			'border-radius' => '8px'
		];

		$paragraph_widget = $this->widget_json_generator->create_paragraph_widget( 'Test Text', $css_properties );

		$this->assertIsArray( $paragraph_widget );
		$this->assertArrayHasKey( 'settings', $paragraph_widget );
		
		$props = $paragraph_widget['props'] ?? [];
		$this->assertNotEmpty( $props );
		
		if ( isset( $props['transform'] ) ) {
			$this->assertEquals( 'transform', $props['transform']['$$type'] );
			$this->assertIsArray( $props['transform']['value'] );
		}
		
		if ( isset( $props['transition'] ) ) {
			$this->assertEquals( 'transition', $props['transition']['$$type'] );
			$this->assertIsArray( $props['transition']['value'] );
		}
	}

	public function test_button_widget_with_complex_css_properties() {
		$css_properties = [
			'background' => 'linear-gradient(45deg, #ff0000, #0000ff)',
			'border-width' => '2px',
			'padding' => '10px 20px 15px 25px',
			'opacity' => '0.8'
		];

		$button_widget = $this->widget_json_generator->create_button_widget( 
			'Click Me', 
			'https://example.com', 
			$css_properties 
		);

		$this->assertIsArray( $button_widget );
		$this->assertEquals( 'atomic-button', $button_widget['widgetType'] ?? $button_widget['widget_type'] );
		
		$settings = $button_widget['settings'];
		$this->assertEquals( 'Click Me', $settings['text']['value'] );
		$this->assertEquals( 'https://example.com', $settings['link']['value']['url'] );
		
		$props = $button_widget['props'] ?? [];
		$this->assertNotEmpty( $props );
	}

	public function test_factory_integration_with_all_prop_types() {
		$all_css_properties = [
			'color' => '#ff0000',
			'font-size' => '16px',
			'margin' => '10px',
			'padding' => '5px 10px',
			'background-color' => '#ffffff',
			'border-radius' => '4px',
			'box-shadow' => '1px 1px 2px #000',
			'text-shadow' => '1px 1px 1px #ccc',
			'opacity' => '0.9',
			'z-index' => '100',
			'transform' => 'scale(1.1)',
			'transition' => 'all 0.3s ease',
			'border-width' => '1px',
			'visibility' => 'visible'
		];

		$converted_props = [];
		foreach ( $all_css_properties as $property => $value ) {
			$atomic_prop = Atomic_Prop_Mapper_Factory::convert_css_property_to_atomic_format( $property, $value );
			if ( null !== $atomic_prop ) {
				$converted_props[ $property ] = $atomic_prop;
			}
		}

		$this->assertGreaterThan( 10, count( $converted_props ) );
		
		foreach ( $converted_props as $property => $atomic_prop ) {
			$this->assertIsArray( $atomic_prop );
			$this->assertArrayHasKey( '$$type', $atomic_prop );
			$this->assertArrayHasKey( 'value', $atomic_prop );
		}
	}

	public function test_end_to_end_widget_creation_with_validation() {
		$css_properties = [
			'color' => '#333333',
			'font-size' => '20px',
			'line-height' => '1.5',
			'margin-bottom' => '16px',
			'text-align' => 'center'
		];

		$heading_widget = $this->widget_json_generator->create_heading_widget( 'Main Title', $css_properties );

		$this->assertIsArray( $heading_widget );
		$this->assertArrayHasKey( 'widgetType', $heading_widget );
		$this->assertArrayHasKey( 'settings', $heading_widget );
		
		$settings = $heading_widget['settings'];
		$this->assertArrayHasKey( 'title', $settings );
		$this->assertEquals( 'string', $settings['title']['$$type'] );
		$this->assertEquals( 'Main Title', $settings['title']['value'] );
		
		if ( isset( $heading_widget['props'] ) ) {
			foreach ( $heading_widget['props'] as $prop_name => $prop_value ) {
				$this->assertIsArray( $prop_value );
				$this->assertArrayHasKey( '$$type', $prop_value );
				$this->assertArrayHasKey( 'value', $prop_value );
				
				$prop_type = $prop_value['$$type'];
				$this->assertTrue( 
					$this->atomic_widget_service->validate_prop_structure( $prop_type, $prop_value['value'] ),
					"Property {$prop_name} with type {$prop_type} should pass atomic widget validation"
				);
			}
		}
	}

	public function test_complex_nested_widget_structure() {
		$container_css = [
			'display' => 'flex',
			'flex-direction' => 'column',
			'gap' => '20px',
			'padding' => '30px'
		];

		$heading_css = [
			'font-size' => '24px',
			'color' => '#2c3e50',
			'margin-bottom' => '10px'
		];

		$paragraph_css = [
			'font-size' => '16px',
			'line-height' => '1.6',
			'color' => '#34495e'
		];

		$button_css = [
			'background-color' => '#3498db',
			'color' => '#ffffff',
			'padding' => '12px 24px',
			'border-radius' => '6px',
			'transition' => 'background-color 0.3s ease'
		];

		$heading_widget = $this->widget_json_generator->create_heading_widget( 'Welcome', $heading_css );
		$paragraph_widget = $this->widget_json_generator->create_paragraph_widget( 'This is a test paragraph.', $paragraph_css );
		$button_widget = $this->widget_json_generator->create_button_widget( 'Get Started', '#', $button_css );

		$this->assertIsArray( $heading_widget );
		$this->assertIsArray( $paragraph_widget );
		$this->assertIsArray( $button_widget );

		$container_element = $this->widget_json_generator->create_div_element( 
			[ $heading_widget, $paragraph_widget, $button_widget ],
			$container_css
		);

		$this->assertIsArray( $container_element );
		$this->assertArrayHasKey( 'children', $container_element );
		$this->assertCount( 3, $container_element['children'] );
	}

	public function test_factory_statistics_accuracy() {
		$stats = Atomic_Prop_Mapper_Factory::get_conversion_capability_statistics();
		
		$this->assertIsArray( $stats );
		$this->assertEquals( 14, $stats['total_atomic_prop_mappers'] );
		$this->assertGreaterThan( 50, $stats['total_convertible_css_properties'] );
		
		$categories = Atomic_Prop_Mapper_Factory::get_css_property_categories_coverage();
		$this->assertIsArray( $categories );
		$this->assertGreaterThan( 0, $categories['layout_css_properties_count'] );
		$this->assertGreaterThan( 0, $categories['visual_css_properties_count'] );
		$this->assertGreaterThan( 0, $categories['interaction_css_properties_count'] );
		$this->assertGreaterThan( 0, $categories['animation_css_properties_count'] );
	}

	public function test_performance_with_large_css_property_set() {
		$large_css_set = [];
		for ( $i = 0; $i < 100; $i++ ) {
			$large_css_set["custom-property-{$i}"] = "value-{$i}";
		}
		
		$large_css_set['color'] = '#ff0000';
		$large_css_set['font-size'] = '16px';
		$large_css_set['margin'] = '10px';
		$large_css_set['transform'] = 'translateX(10px)';
		$large_css_set['transition'] = 'opacity 0.3s';

		$start_time = microtime( true );
		$widget = $this->widget_json_generator->create_heading_widget( 'Performance Test', $large_css_set );
		$end_time = microtime( true );

		$execution_time = $end_time - $start_time;
		$this->assertLessThan( 1.0, $execution_time, 'Widget generation should complete within 1 second' );
		$this->assertIsArray( $widget );
	}

	public function test_error_handling_with_invalid_css_values() {
		$invalid_css_properties = [
			'color' => 'invalid-color-value',
			'font-size' => 'not-a-size',
			'margin' => 'invalid-margin',
			'transform' => 'invalid-transform-function()',
			'transition' => 'invalid-transition-syntax'
		];

		$widget = $this->widget_json_generator->create_paragraph_widget( 'Error Test', $invalid_css_properties );

		$this->assertIsArray( $widget );
		$this->assertArrayHasKey( 'settings', $widget );
		$this->assertEquals( 'Error Test', $widget['settings']['paragraph']['value'] );
		
		$props = $widget['props'] ?? [];
		$this->assertEmpty( $props, 'Invalid CSS properties should not be converted to atomic props' );
	}

	public function test_mixed_valid_invalid_css_properties() {
		$mixed_css_properties = [
			'color' => '#ff0000',
			'invalid-property' => 'invalid-value',
			'font-size' => '18px',
			'margin' => 'invalid-margin-value',
			'background-color' => '#ffffff',
			'transform' => 'invalid-transform()',
			'opacity' => '0.8'
		];

		$widget = $this->widget_json_generator->create_heading_widget( 'Mixed Test', $mixed_css_properties );

		$this->assertIsArray( $widget );
		$props = $widget['props'] ?? [];
		
		$this->assertArrayHasKey( 'color', $props );
		$this->assertArrayHasKey( 'font-size', $props );
		$this->assertArrayHasKey( 'background-color', $props );
		$this->assertArrayHasKey( 'opacity', $props );
		
		$this->assertArrayNotHasKey( 'invalid-property', $props );
		$this->assertArrayNotHasKey( 'margin', $props );
		$this->assertArrayNotHasKey( 'transform', $props );
	}

	public function test_atomic_widget_service_integration() {
		$supported_prop_types = $this->atomic_widget_service->get_supported_prop_types();
		
		$this->assertIsArray( $supported_prop_types );
		$this->assertContains( 'size', $supported_prop_types );
		$this->assertContains( 'color', $supported_prop_types );
		$this->assertContains( 'dimensions', $supported_prop_types );
		$this->assertContains( 'transform', $supported_prop_types );
		$this->assertContains( 'transition', $supported_prop_types );

		$size_prop_instance = $this->atomic_widget_service->get_prop_type_instance( 'size' );
		$this->assertNotNull( $size_prop_instance );
		
		$color_prop_instance = $this->atomic_widget_service->get_prop_type_instance( 'color' );
		$this->assertNotNull( $color_prop_instance );
	}
}
