<?php

namespace Elementor\Modules\CssConverter\Tests\PhpUnit\AtomicWidgets;

use PHPUnit\Framework\TestCase;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Box_Shadow_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Border_Radius_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Shadow_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Number_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Background_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Border_Width_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Boolean_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Url_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\Implementations\Atomic_Prop_Mapper_Factory;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Phase3ComplexPropTypesTest extends TestCase {

	public function test_box_shadow_prop_type_mapper_creation() {
		$mapper = new Box_Shadow_Prop_Type_Mapper();
		
		$this->assertInstanceOf( Box_Shadow_Prop_Type_Mapper::class, $mapper );
		$this->assertEquals( 'box-shadow', $mapper->get_atomic_prop_type() );
		$this->assertContains( 'box-shadow', $mapper->get_supported_properties() );
	}

	public function test_box_shadow_single_shadow() {
		$mapper = new Box_Shadow_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( '2px 2px 4px rgba(0,0,0,0.3)' );
		
		$this->assertIsArray( $result );
		$this->assertEquals( 'box-shadow', $result['$$type'] );
		$this->assertIsArray( $result['value'] );
		$this->assertCount( 1, $result['value'] );
		
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
		$this->assertNull( $shadow_value['position'] );
	}

	public function test_box_shadow_inset_shadow() {
		$mapper = new Box_Shadow_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( 'inset 1px 1px 2px #000' );
		
		$this->assertIsArray( $result );
		$shadow = $result['value'][0];
		$this->assertEquals( 'inset', $shadow['value']['position'] );
	}

	public function test_box_shadow_none_value() {
		$mapper = new Box_Shadow_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( 'none' );
		
		$this->assertIsArray( $result );
		$this->assertEquals( 'box-shadow', $result['$$type'] );
		$this->assertEmpty( $result['value'] );
	}

	public function test_border_radius_prop_type_mapper_creation() {
		$mapper = new Border_Radius_Prop_Type_Mapper();
		
		$this->assertInstanceOf( Border_Radius_Prop_Type_Mapper::class, $mapper );
		$this->assertEquals( 'border-radius', $mapper->get_atomic_prop_type() );
		$this->assertContains( 'border-radius', $mapper->get_supported_properties() );
	}

	public function test_border_radius_single_value() {
		$mapper = new Border_Radius_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( '8px' );
		
		$this->assertIsArray( $result );
		$this->assertEquals( 'border-radius', $result['$$type'] );
		$this->assertArrayHasKey( 'value', $result );
		
		$value = $result['value'];
		$this->assertArrayHasKey( 'start-start', $value );
		$this->assertArrayHasKey( 'start-end', $value );
		$this->assertArrayHasKey( 'end-end', $value );
		$this->assertArrayHasKey( 'end-start', $value );
		
		$this->assertEquals( 8.0, $value['start-start']['value']['size'] );
		$this->assertEquals( 'px', $value['start-start']['value']['unit'] );
		$this->assertEquals( 8.0, $value['start-end']['value']['size'] );
		$this->assertEquals( 8.0, $value['end-end']['value']['size'] );
		$this->assertEquals( 8.0, $value['end-start']['value']['size'] );
	}

	public function test_border_radius_four_values() {
		$mapper = new Border_Radius_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( '5px 10px 15px 20px' );
		
		$this->assertIsArray( $result );
		$value = $result['value'];
		
		$this->assertEquals( 5.0, $value['start-start']['value']['size'] );
		$this->assertEquals( 10.0, $value['start-end']['value']['size'] );
		$this->assertEquals( 15.0, $value['end-end']['value']['size'] );
		$this->assertEquals( 20.0, $value['end-start']['value']['size'] );
	}

	public function test_shadow_prop_type_mapper_creation() {
		$mapper = new Shadow_Prop_Type_Mapper();
		
		$this->assertInstanceOf( Shadow_Prop_Type_Mapper::class, $mapper );
		$this->assertEquals( 'shadow', $mapper->get_atomic_prop_type() );
		$this->assertContains( 'text-shadow', $mapper->get_supported_properties() );
	}

	public function test_text_shadow_mapping() {
		$mapper = new Shadow_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( '2px 2px 4px rgba(0,0,0,0.3)' );
		
		$this->assertIsArray( $result );
		$this->assertEquals( 'shadow', $result['$$type'] );
		$this->assertArrayHasKey( 'value', $result );
		
		$value = $result['value'];
		$this->assertArrayHasKey( 'hOffset', $value );
		$this->assertArrayHasKey( 'vOffset', $value );
		$this->assertArrayHasKey( 'blur', $value );
		$this->assertArrayHasKey( 'color', $value );
		
		$this->assertEquals( 2.0, $value['hOffset']['value']['size'] );
		$this->assertEquals( 2.0, $value['vOffset']['value']['size'] );
		$this->assertEquals( 4.0, $value['blur']['value']['size'] );
		$this->assertEquals( 'rgba(0,0,0,0.3)', $value['color']['value'] );
	}

	public function test_number_prop_type_mapper_creation() {
		$mapper = new Number_Prop_Type_Mapper();
		
		$this->assertInstanceOf( Number_Prop_Type_Mapper::class, $mapper );
		$this->assertEquals( 'number', $mapper->get_atomic_prop_type() );
		$this->assertContains( 'opacity', $mapper->get_supported_properties() );
		$this->assertContains( 'z-index', $mapper->get_supported_properties() );
	}

	public function test_number_prop_type_mapping() {
		$mapper = new Number_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( '0.8' );
		
		$this->assertIsArray( $result );
		$this->assertEquals( 'number', $result['$$type'] );
		$this->assertEquals( 0.8, $result['value'] );
		$this->assertTrue( is_float( $result['value'] ) );
	}

	public function test_background_prop_type_mapper_creation() {
		$mapper = new Background_Prop_Type_Mapper();
		
		$this->assertInstanceOf( Background_Prop_Type_Mapper::class, $mapper );
		$this->assertEquals( 'background', $mapper->get_atomic_prop_type() );
		$this->assertContains( 'background', $mapper->get_supported_properties() );
		$this->assertContains( 'background-image', $mapper->get_supported_properties() );
	}

	public function test_background_color_mapping() {
		$mapper = new Background_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( '#ff0000' );
		
		$this->assertIsArray( $result );
		$this->assertEquals( 'background', $result['$$type'] );
		$this->assertArrayHasKey( 'color', $result['value'] );
		$this->assertEquals( 'color', $result['value']['color']['$$type'] );
		$this->assertEquals( '#ff0000', $result['value']['color']['value'] );
	}

	public function test_background_image_mapping() {
		$mapper = new Background_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( 'url(image.jpg)' );
		
		$this->assertIsArray( $result );
		$this->assertEquals( 'background', $result['$$type'] );
		$this->assertArrayHasKey( 'image', $result['value'] );
		$this->assertEquals( 'image', $result['value']['image']['$$type'] );
		$this->assertEquals( 'image.jpg', $result['value']['image']['value']['url'] );
	}

	public function test_border_width_prop_type_mapper_creation() {
		$mapper = new Border_Width_Prop_Type_Mapper();
		
		$this->assertInstanceOf( Border_Width_Prop_Type_Mapper::class, $mapper );
		$this->assertEquals( 'border-width', $mapper->get_atomic_prop_type() );
		$this->assertContains( 'border-width', $mapper->get_supported_properties() );
	}

	public function test_boolean_prop_type_mapper_creation() {
		$mapper = new Boolean_Prop_Type_Mapper();
		
		$this->assertInstanceOf( Boolean_Prop_Type_Mapper::class, $mapper );
		$this->assertEquals( 'boolean', $mapper->get_atomic_prop_type() );
		$this->assertContains( 'visibility', $mapper->get_supported_properties() );
	}

	public function test_boolean_prop_type_mapping() {
		$mapper = new Boolean_Prop_Type_Mapper();
		
		$true_result = $mapper->map_css_to_atomic( 'visible' );
		$false_result = $mapper->map_css_to_atomic( 'hidden' );
		
		$this->assertIsArray( $true_result );
		$this->assertEquals( 'boolean', $true_result['$$type'] );
		$this->assertTrue( $true_result['value'] );
		
		$this->assertIsArray( $false_result );
		$this->assertEquals( 'boolean', $false_result['$$type'] );
		$this->assertFalse( $false_result['value'] );
	}

	public function test_url_prop_type_mapper_creation() {
		$mapper = new Url_Prop_Type_Mapper();
		
		$this->assertInstanceOf( Url_Prop_Type_Mapper::class, $mapper );
		$this->assertEquals( 'url', $mapper->get_atomic_prop_type() );
		$this->assertContains( 'background-image', $mapper->get_supported_properties() );
	}

	public function test_url_prop_type_mapping() {
		$mapper = new Url_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( 'url("image.jpg")' );
		
		$this->assertIsArray( $result );
		$this->assertEquals( 'url', $result['$$type'] );
		$this->assertEquals( 'image.jpg', $result['value'] );
	}

	public function test_factory_phase3_integration() {
		$mappers = Atomic_Prop_Mapper_Factory::get_all_mappers();
		
		$this->assertArrayHasKey( 'box-shadow', $mappers );
		$this->assertArrayHasKey( 'border-radius', $mappers );
		$this->assertArrayHasKey( 'shadow', $mappers );
		$this->assertArrayHasKey( 'number', $mappers );
		$this->assertArrayHasKey( 'background', $mappers );
		$this->assertArrayHasKey( 'border-width', $mappers );
		$this->assertArrayHasKey( 'boolean', $mappers );
		$this->assertArrayHasKey( 'url', $mappers );
	}

	public function test_factory_phase3_property_support() {
		$this->assertTrue( Atomic_Prop_Mapper_Factory::supports_property( 'box-shadow' ) );
		$this->assertTrue( Atomic_Prop_Mapper_Factory::supports_property( 'border-radius' ) );
		$this->assertTrue( Atomic_Prop_Mapper_Factory::supports_property( 'text-shadow' ) );
		$this->assertTrue( Atomic_Prop_Mapper_Factory::supports_property( 'opacity' ) );
		$this->assertTrue( Atomic_Prop_Mapper_Factory::supports_property( 'z-index' ) );
		$this->assertTrue( Atomic_Prop_Mapper_Factory::supports_property( 'background' ) );
		$this->assertTrue( Atomic_Prop_Mapper_Factory::supports_property( 'border-width' ) );
		$this->assertTrue( Atomic_Prop_Mapper_Factory::supports_property( 'visibility' ) );
	}

	public function test_factory_phase3_css_conversion() {
		$box_shadow_result = Atomic_Prop_Mapper_Factory::convert_css_to_atomic( 'box-shadow', '2px 2px 4px #000' );
		$border_radius_result = Atomic_Prop_Mapper_Factory::convert_css_to_atomic( 'border-radius', '8px' );
		$opacity_result = Atomic_Prop_Mapper_Factory::convert_css_to_atomic( 'opacity', '0.5' );
		
		$this->assertIsArray( $box_shadow_result );
		$this->assertEquals( 'box-shadow', $box_shadow_result['$$type'] );
		
		$this->assertIsArray( $border_radius_result );
		$this->assertEquals( 'border-radius', $border_radius_result['$$type'] );
		
		$this->assertIsArray( $opacity_result );
		$this->assertEquals( 'number', $opacity_result['$$type'] );
		$this->assertEquals( 0.5, $opacity_result['value'] );
	}

	public function test_factory_phase_statistics() {
		$stats = Atomic_Prop_Mapper_Factory::get_phase_statistics();
		
		$this->assertIsArray( $stats );
		$this->assertEquals( 4, $stats['phase_1_mappers'] );
		$this->assertEquals( 8, $stats['phase_3_mappers'] );
		$this->assertEquals( 12, $stats['total_mappers'] );
		$this->assertGreaterThan( 30, $stats['total_properties'] );
	}

	public function test_complex_prop_validation() {
		$box_shadow_mapper = new Box_Shadow_Prop_Type_Mapper();
		$border_radius_mapper = new Border_Radius_Prop_Type_Mapper();
		$shadow_mapper = new Shadow_Prop_Type_Mapper();
		
		$valid_box_shadow = [
			'$$type' => 'box-shadow',
			'value' => [
				[
					'$$type' => 'shadow',
					'value' => [
						'hOffset' => [ '$$type' => 'size', 'value' => [ 'size' => 2.0, 'unit' => 'px' ] ],
						'vOffset' => [ '$$type' => 'size', 'value' => [ 'size' => 2.0, 'unit' => 'px' ] ],
						'blur' => [ '$$type' => 'size', 'value' => [ 'size' => 4.0, 'unit' => 'px' ] ],
						'spread' => [ '$$type' => 'size', 'value' => [ 'size' => 0.0, 'unit' => 'px' ] ],
						'color' => [ '$$type' => 'color', 'value' => '#000000' ],
						'position' => null
					]
				]
			]
		];
		
		$valid_border_radius = [
			'$$type' => 'border-radius',
			'value' => [
				'start-start' => [ '$$type' => 'size', 'value' => [ 'size' => 8.0, 'unit' => 'px' ] ],
				'start-end' => [ '$$type' => 'size', 'value' => [ 'size' => 8.0, 'unit' => 'px' ] ],
				'end-end' => [ '$$type' => 'size', 'value' => [ 'size' => 8.0, 'unit' => 'px' ] ],
				'end-start' => [ '$$type' => 'size', 'value' => [ 'size' => 8.0, 'unit' => 'px' ] ],
			]
		];
		
		$this->assertTrue( $box_shadow_mapper->validate_atomic_output( $valid_box_shadow ) );
		$this->assertTrue( $border_radius_mapper->validate_atomic_output( $valid_border_radius ) );
	}

	public function test_edge_cases_and_error_handling() {
		$box_shadow_mapper = new Box_Shadow_Prop_Type_Mapper();
		$shadow_mapper = new Shadow_Prop_Type_Mapper();
		$number_mapper = new Number_Prop_Type_Mapper();
		$background_mapper = new Background_Prop_Type_Mapper();
		
		$this->assertNull( $shadow_mapper->map_css_to_atomic( 'none' ) );
		$this->assertNull( $shadow_mapper->map_css_to_atomic( '' ) );
		$this->assertNull( $number_mapper->map_css_to_atomic( 'invalid-number' ) );
		$this->assertNull( $background_mapper->map_css_to_atomic( '' ) );
		$this->assertNull( $background_mapper->map_css_to_atomic( 'none' ) );
		
		$none_box_shadow = $box_shadow_mapper->map_css_to_atomic( 'none' );
		$this->assertIsArray( $none_box_shadow );
		$this->assertEmpty( $none_box_shadow['value'] );
	}
}
