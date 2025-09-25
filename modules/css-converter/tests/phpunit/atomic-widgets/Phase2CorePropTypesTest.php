<?php

namespace Elementor\Modules\CssConverter\Tests\PhpUnit\AtomicWidgets;

use PHPUnit\Framework\TestCase;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Size_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Color_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Dimensions_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\String_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\Implementations\Atomic_Prop_Mapper_Factory;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Phase2CorePropTypesTest extends TestCase {

	public function test_size_prop_type_mapper_creation() {
		$mapper = new Size_Prop_Type_Mapper();
		
		$this->assertInstanceOf( Size_Prop_Type_Mapper::class, $mapper );
		$this->assertEquals( 'size', $mapper->get_atomic_prop_type() );
		$this->assertContains( 'font-size', $mapper->get_supported_properties() );
		$this->assertContains( 'width', $mapper->get_supported_properties() );
		$this->assertContains( 'height', $mapper->get_supported_properties() );
	}

	public function test_size_prop_type_mapping() {
		$mapper = new Size_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( '16px' );
		
		$this->assertIsArray( $result );
		$this->assertEquals( 'size', $result['$$type'] );
		$this->assertArrayHasKey( 'value', $result );
		$this->assertEquals( 16.0, $result['value']['size'] );
		$this->assertEquals( 'px', $result['value']['unit'] );
		$this->assertTrue( is_float( $result['value']['size'] ) || is_int( $result['value']['size'] ) );
	}

	public function test_size_prop_type_auto_value() {
		$mapper = new Size_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( 'auto' );
		
		$this->assertIsArray( $result );
		$this->assertEquals( 'size', $result['$$type'] );
		$this->assertEquals( '', $result['value']['size'] );
		$this->assertEquals( 'auto', $result['value']['unit'] );
	}

	public function test_size_prop_type_various_units() {
		$mapper = new Size_Prop_Type_Mapper();
		
		$test_cases = [
			'24px' => [ 'size' => 24.0, 'unit' => 'px' ],
			'1.5em' => [ 'size' => 1.5, 'unit' => 'em' ],
			'100%' => [ 'size' => 100.0, 'unit' => '%' ],
			'2rem' => [ 'size' => 2.0, 'unit' => 'rem' ],
			'50vh' => [ 'size' => 50.0, 'unit' => 'vh' ],
		];

		foreach ( $test_cases as $input => $expected ) {
			$result = $mapper->map_css_to_atomic( $input );
			$this->assertEquals( 'size', $result['$$type'], "Failed for input: $input" );
			$this->assertEquals( $expected['size'], $result['value']['size'], "Size mismatch for input: $input" );
			$this->assertEquals( $expected['unit'], $result['value']['unit'], "Unit mismatch for input: $input" );
		}
	}

	public function test_color_prop_type_mapper_creation() {
		$mapper = new Color_Prop_Type_Mapper();
		
		$this->assertInstanceOf( Color_Prop_Type_Mapper::class, $mapper );
		$this->assertEquals( 'color', $mapper->get_atomic_prop_type() );
		$this->assertContains( 'color', $mapper->get_supported_properties() );
		$this->assertContains( 'background-color', $mapper->get_supported_properties() );
	}

	public function test_color_prop_type_mapping() {
		$mapper = new Color_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( '#ff0000' );
		
		$this->assertIsArray( $result );
		$this->assertEquals( 'color', $result['$$type'] );
		$this->assertEquals( '#ff0000', $result['value'] );
	}

	public function test_color_prop_type_various_formats() {
		$mapper = new Color_Prop_Type_Mapper();
		
		$test_cases = [
			'#ff0000' => '#ff0000',
			'#f00' => '#f00',
			'rgba(255, 0, 0, 0.5)' => 'rgba(255, 0, 0, 0.5)',
			'hsl(0, 100%, 50%)' => 'hsl(0, 100%, 50%)',
			'red' => 'red',
			'transparent' => 'transparent',
		];

		foreach ( $test_cases as $input => $expected ) {
			$result = $mapper->map_css_to_atomic( $input );
			$this->assertEquals( 'color', $result['$$type'], "Failed for input: $input" );
			$this->assertEquals( $expected, $result['value'], "Value mismatch for input: $input" );
		}
	}

	public function test_dimensions_prop_type_mapper_creation() {
		$mapper = new Dimensions_Prop_Type_Mapper();
		
		$this->assertInstanceOf( Dimensions_Prop_Type_Mapper::class, $mapper );
		$this->assertEquals( 'dimensions', $mapper->get_atomic_prop_type() );
		$this->assertContains( 'margin', $mapper->get_supported_properties() );
		$this->assertContains( 'padding', $mapper->get_supported_properties() );
	}

	public function test_dimensions_prop_type_single_value() {
		$mapper = new Dimensions_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( '10px' );
		
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
	}

	public function test_dimensions_prop_type_four_values() {
		$mapper = new Dimensions_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( '10px 20px 30px 40px' );
		
		$this->assertIsArray( $result );
		$this->assertEquals( 'dimensions', $result['$$type'] );
		
		$value = $result['value'];
		$this->assertEquals( 10.0, $value['block-start']['value']['size'] );
		$this->assertEquals( 20.0, $value['inline-end']['value']['size'] );
		$this->assertEquals( 30.0, $value['block-end']['value']['size'] );
		$this->assertEquals( 40.0, $value['inline-start']['value']['size'] );
	}

	public function test_string_prop_type_mapper_creation() {
		$mapper = new String_Prop_Type_Mapper();
		
		$this->assertInstanceOf( String_Prop_Type_Mapper::class, $mapper );
		$this->assertEquals( 'string', $mapper->get_atomic_prop_type() );
		$this->assertContains( 'display', $mapper->get_supported_properties() );
		$this->assertContains( 'position', $mapper->get_supported_properties() );
		$this->assertContains( 'flex-direction', $mapper->get_supported_properties() );
	}

	public function test_string_prop_type_mapping() {
		$mapper = new String_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( 'flex' );
		
		$this->assertIsArray( $result );
		$this->assertEquals( 'string', $result['$$type'] );
		$this->assertEquals( 'flex', $result['value'] );
	}

	public function test_factory_initialization() {
		$mappers = Atomic_Prop_Mapper_Factory::get_all_mappers();
		
		$this->assertIsArray( $mappers );
		$this->assertArrayHasKey( 'size', $mappers );
		$this->assertArrayHasKey( 'color', $mappers );
		$this->assertArrayHasKey( 'dimensions', $mappers );
		$this->assertArrayHasKey( 'string', $mappers );
	}

	public function test_factory_property_support() {
		$this->assertTrue( Atomic_Prop_Mapper_Factory::supports_property( 'font-size' ) );
		$this->assertTrue( Atomic_Prop_Mapper_Factory::supports_property( 'color' ) );
		$this->assertTrue( Atomic_Prop_Mapper_Factory::supports_property( 'margin' ) );
		$this->assertTrue( Atomic_Prop_Mapper_Factory::supports_property( 'display' ) );
		$this->assertFalse( Atomic_Prop_Mapper_Factory::supports_property( 'unsupported-property' ) );
	}

	public function test_factory_css_conversion() {
		$result = Atomic_Prop_Mapper_Factory::convert_css_to_atomic( 'font-size', '18px' );
		
		$this->assertIsArray( $result );
		$this->assertEquals( 'size', $result['$$type'] );
		$this->assertEquals( 18.0, $result['value']['size'] );
		$this->assertEquals( 'px', $result['value']['unit'] );
	}

	public function test_factory_statistics() {
		$stats = Atomic_Prop_Mapper_Factory::get_mapper_statistics();
		
		$this->assertIsArray( $stats );
		$this->assertEquals( 4, $stats['total_mappers'] );
		$this->assertGreaterThan( 20, $stats['total_properties'] );
		$this->assertArrayHasKey( 'size', $stats['properties_by_type'] );
		$this->assertArrayHasKey( 'color', $stats['properties_by_type'] );
		$this->assertArrayHasKey( 'dimensions', $stats['properties_by_type'] );
		$this->assertArrayHasKey( 'string', $stats['properties_by_type'] );
	}

	public function test_atomic_output_validation() {
		$size_mapper = new Size_Prop_Type_Mapper();
		$color_mapper = new Color_Prop_Type_Mapper();
		
		$valid_size = [ '$$type' => 'size', 'value' => [ 'size' => 16.0, 'unit' => 'px' ] ];
		$valid_color = [ '$$type' => 'color', 'value' => '#ff0000' ];
		$invalid_output = [ 'value' => 'test' ];
		
		$this->assertTrue( $size_mapper->validate_atomic_output( $valid_size ) );
		$this->assertTrue( $color_mapper->validate_atomic_output( $valid_color ) );
		$this->assertFalse( $size_mapper->validate_atomic_output( $invalid_output ) );
		$this->assertFalse( $color_mapper->validate_atomic_output( $invalid_output ) );
	}

	public function test_edge_cases_and_error_handling() {
		$size_mapper = new Size_Prop_Type_Mapper();
		$color_mapper = new Color_Prop_Type_Mapper();
		$string_mapper = new String_Prop_Type_Mapper();
		
		$this->assertNull( $size_mapper->map_css_to_atomic( '' ) );
		$this->assertNull( $size_mapper->map_css_to_atomic( 'invalid-size' ) );
		$this->assertNull( $color_mapper->map_css_to_atomic( 'invalid-color' ) );
		$this->assertNull( $string_mapper->map_css_to_atomic( '' ) );
		$this->assertNull( $string_mapper->map_css_to_atomic( '   ' ) );
	}

	public function test_comprehensive_property_coverage() {
		$supported_properties = Atomic_Prop_Mapper_Factory::get_supported_properties();
		
		$expected_properties = [
			'font-size', 'width', 'height', 'max-width', 'min-width',
			'color', 'background-color', 'border-color',
			'margin', 'padding',
			'display', 'position', 'flex-direction', 'align-items', 'text-align'
		];

		foreach ( $expected_properties as $property ) {
			$this->assertContains( $property, $supported_properties, "Property '$property' should be supported" );
		}
	}
}
