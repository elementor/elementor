<?php

namespace Elementor\Modules\CssConverter\Tests\PhpUnit\AtomicWidgets;

use PHPUnit\Framework\TestCase;
use Elementor\Modules\CssConverter\Services\AtomicWidgets\Atomic_Widget_Service;
use Elementor\Modules\CssConverter\Services\AtomicWidgets\Widget_JSON_Generator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class AtomicWidgetFoundationTest extends TestCase {
	private $atomic_service;
	private $json_generator;

	protected function setUp(): void {
		$this->atomic_service = new Atomic_Widget_Service();
		$this->json_generator = new Widget_JSON_Generator( $this->atomic_service );
	}

	public function test_atomic_widget_service_instantiation() {
		$this->assertInstanceOf( Atomic_Widget_Service::class, $this->atomic_service );
		$this->assertIsArray( $this->atomic_service->get_supported_prop_types() );
		$this->assertNotEmpty( $this->atomic_service->get_supported_prop_types() );
	}

	public function test_widget_json_generator_instantiation() {
		$this->assertInstanceOf( Widget_JSON_Generator::class, $this->json_generator );
	}

	public function test_size_prop_type_creation() {
		$result = $this->atomic_service->convert_css_to_atomic_prop( 'font-size', '16px' );
		
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( '$$type', $result );
		$this->assertArrayHasKey( 'value', $result );
		$this->assertEquals( 'size', $result['$$type'] );
		
		$this->assertArrayHasKey( 'size', $result['value'] );
		$this->assertArrayHasKey( 'unit', $result['value'] );
		$this->assertEquals( 16.0, $result['value']['size'] );
		$this->assertEquals( 'px', $result['value']['unit'] );
		
		$this->assertTrue( is_float( $result['value']['size'] ) || is_int( $result['value']['size'] ) );
	}

	public function test_color_prop_type_creation() {
		$result = $this->atomic_service->convert_css_to_atomic_prop( 'color', '#ff0000' );
		
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( '$$type', $result );
		$this->assertArrayHasKey( 'value', $result );
		$this->assertEquals( 'color', $result['$$type'] );
		$this->assertEquals( '#ff0000', $result['value'] );
	}

	public function test_dimensions_prop_type_creation() {
		$result = $this->atomic_service->convert_css_to_atomic_prop( 'margin', '10px 20px' );
		
		$this->assertIsArray( $result );
		$this->assertEquals( 'dimensions', $result['$$type'] );
		$this->assertArrayHasKey( 'value', $result );
		
		$value = $result['value'];
		$this->assertArrayHasKey( 'block-start', $value );
		$this->assertArrayHasKey( 'inline-end', $value );
		$this->assertArrayHasKey( 'block-end', $value );
		$this->assertArrayHasKey( 'inline-start', $value );
		
		$this->assertEquals( 'size', $value['block-start']['$$type'] );
		$this->assertEquals( 10.0, $value['block-start']['value']['size'] );
		$this->assertEquals( 'px', $value['block-start']['value']['unit'] );
		
		$this->assertEquals( 20.0, $value['inline-end']['value']['size'] );
		$this->assertEquals( 'px', $value['inline-end']['value']['unit'] );
	}

	public function test_box_shadow_prop_type_creation() {
		$result = $this->atomic_service->convert_css_to_atomic_prop( 'box-shadow', '2px 2px 4px rgba(0,0,0,0.3)' );
		
		$this->assertIsArray( $result );
		$this->assertEquals( 'box-shadow', $result['$$type'] );
		$this->assertIsArray( $result['value'] );
		$this->assertNotEmpty( $result['value'] );
		
		$shadow = $result['value'][0];
		$this->assertEquals( 'shadow', $shadow['$$type'] );
		$this->assertArrayHasKey( 'value', $shadow );
		
		$shadow_value = $shadow['value'];
		$this->assertArrayHasKey( 'hOffset', $shadow_value );
		$this->assertArrayHasKey( 'vOffset', $shadow_value );
		$this->assertArrayHasKey( 'blur', $shadow_value );
		$this->assertArrayHasKey( 'spread', $shadow_value );
		$this->assertArrayHasKey( 'color', $shadow_value );
		$this->assertArrayHasKey( 'position', $shadow_value );
		
		$this->assertEquals( 2.0, $shadow_value['hOffset']['value']['size'] );
		$this->assertEquals( 2.0, $shadow_value['vOffset']['value']['size'] );
		$this->assertEquals( 4.0, $shadow_value['blur']['value']['size'] );
	}

	public function test_border_radius_prop_type_creation() {
		$result = $this->atomic_service->convert_css_to_atomic_prop( 'border-radius', '8px' );
		
		$this->assertIsArray( $result );
		$this->assertEquals( 'border-radius', $result['$$type'] );
		$this->assertArrayHasKey( 'value', $result );
		
		$value = $result['value'];
		$this->assertArrayHasKey( 'start-start', $value );
		$this->assertArrayHasKey( 'start-end', $value );
		$this->assertArrayHasKey( 'end-start', $value );
		$this->assertArrayHasKey( 'end-end', $value );
		
		$this->assertEquals( 8.0, $value['start-start']['value']['size'] );
		$this->assertEquals( 'px', $value['start-start']['value']['unit'] );
	}

	public function test_string_prop_type_creation() {
		$result = $this->atomic_service->convert_css_to_atomic_prop( 'display', 'flex' );
		
		$this->assertIsArray( $result );
		$this->assertEquals( 'string', $result['$$type'] );
		$this->assertEquals( 'flex', $result['value'] );
	}

	public function test_number_prop_type_creation() {
		$result = $this->atomic_service->convert_css_to_atomic_prop( 'opacity', '0.8' );
		
		$this->assertIsArray( $result );
		$this->assertEquals( 'number', $result['$$type'] );
		$this->assertEquals( 0.8, $result['value'] );
		$this->assertTrue( is_float( $result['value'] ) );
	}

	public function test_prop_structure_validation() {
		$valid_prop = [
			'$$type' => 'size',
			'value' => [
				'size' => 16,
				'unit' => 'px'
			]
		];
		
		$this->assertTrue( $this->atomic_service->validate_prop_structure( $valid_prop ) );
		
		$invalid_prop = [
			'value' => 'test'
		];
		
		$this->assertFalse( $this->atomic_service->validate_prop_structure( $invalid_prop ) );
	}

	public function test_widget_json_generation() {
		$element_data = [
			'widget_type' => 'atomic-heading',
			'settings' => [
				'title' => [
					'$$type' => 'string',
					'value' => 'Test Heading'
				]
			],
			'props' => [
				'font-size' => '24px',
				'color' => '#333333'
			]
		];
		
		$result = $this->json_generator->generate_widget_json( $element_data );
		
		$this->assertIsArray( $result );
		$this->assertEquals( 'widget', $result['elType'] );
		$this->assertEquals( 'atomic-heading', $result['widgetType'] );
		$this->assertArrayHasKey( 'settings', $result );
		
		$settings = $result['settings'];
		$this->assertArrayHasKey( 'title', $settings );
		$this->assertArrayHasKey( 'font-size', $settings );
		$this->assertArrayHasKey( 'color', $settings );
		
		$this->assertEquals( 'size', $settings['font-size']['$$type'] );
		$this->assertEquals( 24.0, $settings['font-size']['value']['size'] );
		
		$this->assertEquals( 'color', $settings['color']['$$type'] );
		$this->assertEquals( '#333333', $settings['color']['value'] );
	}

	public function test_element_json_generation() {
		$element_data = [
			'element_type' => 'div-block',
			'props' => [
				'margin' => '10px',
				'background-color' => '#f0f0f0'
			],
			'children' => []
		];
		
		$result = $this->json_generator->generate_element_json( $element_data );
		
		$this->assertIsArray( $result );
		$this->assertEquals( 'div-block', $result['elType'] );
		$this->assertArrayHasKey( 'settings', $result );
		$this->assertArrayHasKey( 'elements', $result );
		
		$settings = $result['settings'];
		$this->assertArrayHasKey( 'margin', $settings );
		$this->assertArrayHasKey( 'background-color', $settings );
		
		$this->assertEquals( 'dimensions', $settings['margin']['$$type'] );
		$this->assertEquals( 'color', $settings['background-color']['$$type'] );
	}

	public function test_css_properties_to_widget_conversion() {
		$css_properties = [
			'font-size' => '18px',
			'color' => '#ff0000',
			'margin' => '5px 10px',
			'opacity' => '0.9'
		];
		
		$result = $this->json_generator->generate_from_css_properties( 'atomic-paragraph', $css_properties );
		
		$this->assertIsArray( $result );
		$this->assertEquals( 'widget', $result['elType'] );
		$this->assertEquals( 'atomic-paragraph', $result['widgetType'] );
		
		$settings = $result['settings'];
		$this->assertArrayHasKey( 'font-size', $settings );
		$this->assertArrayHasKey( 'color', $settings );
		$this->assertArrayHasKey( 'margin', $settings );
		$this->assertArrayHasKey( 'opacity', $settings );
		
		$this->assertEquals( 'size', $settings['font-size']['$$type'] );
		$this->assertEquals( 'color', $settings['color']['$$type'] );
		$this->assertEquals( 'dimensions', $settings['margin']['$$type'] );
		$this->assertEquals( 'number', $settings['opacity']['$$type'] );
	}

	public function test_json_validation() {
		$valid_json = [
			'elType' => 'widget',
			'widgetType' => 'atomic-heading',
			'settings' => [
				'title' => [
					'$$type' => 'string',
					'value' => 'Test'
				]
			]
		];
		
		$this->assertTrue( $this->json_generator->validate_generated_json( $valid_json ) );
		
		$invalid_json = [
			'elType' => 'widget'
		];
		
		$this->assertFalse( $this->json_generator->validate_generated_json( $invalid_json ) );
	}

	public function test_helper_widget_creation_methods() {
		$heading = $this->json_generator->create_heading_widget( 'Test Heading', [ 'font-size' => '24px' ] );
		$this->assertEquals( 'atomic-heading', $heading['widgetType'] );
		$this->assertEquals( 'Test Heading', $heading['settings']['title']['value'] );
		$this->assertEquals( 24.0, $heading['settings']['font-size']['value']['size'] );
		
		$paragraph = $this->json_generator->create_paragraph_widget( 'Test paragraph', [ 'color' => '#333' ] );
		$this->assertEquals( 'atomic-paragraph', $paragraph['widgetType'] );
		$this->assertEquals( 'Test paragraph', $paragraph['settings']['paragraph']['value'] );
		$this->assertEquals( '#333', $paragraph['settings']['color']['value'] );
		
		$button = $this->json_generator->create_button_widget( 'Click me', 'https://example.com', [ 'background-color' => '#007cba' ] );
		$this->assertEquals( 'atomic-button', $button['widgetType'] );
		$this->assertEquals( 'Click me', $button['settings']['text']['value'] );
		$this->assertEquals( 'https://example.com', $button['settings']['link']['value']['url'] );
		$this->assertEquals( '#007cba', $button['settings']['background-color']['value'] );
	}

	public function test_edge_cases_and_error_handling() {
		$this->assertNull( $this->atomic_service->convert_css_to_atomic_prop( 'font-size', '' ) );
		$this->assertNull( $this->atomic_service->convert_css_to_atomic_prop( 'color', 'invalid-color' ) );
		$this->assertNull( $this->atomic_service->convert_css_to_atomic_prop( 'margin', 'invalid-margin' ) );
		
		$this->assertNull( $this->json_generator->generate_widget_json( [] ) );
		$this->assertNull( $this->json_generator->generate_element_json( [] ) );
		$this->assertNull( $this->json_generator->generate_from_css_properties( '', [] ) );
	}

	public function test_complex_css_parsing() {
		$rgba_color = $this->atomic_service->convert_css_to_atomic_prop( 'color', 'rgba(255, 0, 0, 0.5)' );
		$this->assertEquals( 'color', $rgba_color['$$type'] );
		$this->assertEquals( 'rgba(255, 0, 0, 0.5)', $rgba_color['value'] );
		
		$auto_size = $this->atomic_service->convert_css_to_atomic_prop( 'width', 'auto' );
		$this->assertEquals( 'size', $auto_size['$$type'] );
		$this->assertEquals( '', $auto_size['value']['size'] );
		$this->assertEquals( 'auto', $auto_size['value']['unit'] );
		
		$complex_margin = $this->atomic_service->convert_css_to_atomic_prop( 'margin', '10px 20px 30px 40px' );
		$this->assertEquals( 'dimensions', $complex_margin['$$type'] );
		$this->assertEquals( 10.0, $complex_margin['value']['block-start']['value']['size'] );
		$this->assertEquals( 20.0, $complex_margin['value']['inline-end']['value']['size'] );
		$this->assertEquals( 30.0, $complex_margin['value']['block-end']['value']['size'] );
		$this->assertEquals( 40.0, $complex_margin['value']['inline-start']['value']['size'] );
	}
}
