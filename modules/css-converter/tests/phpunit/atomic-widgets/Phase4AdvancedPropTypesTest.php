<?php

namespace Elementor\Modules\CssConverter\Tests\PhpUnit\AtomicWidgets;

use PHPUnit\Framework\TestCase;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Transform_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes\Transition_Prop_Type_Mapper;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\Implementations\Atomic_Prop_Mapper_Factory;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Phase4AdvancedPropTypesTest extends TestCase {

	public function test_transform_prop_type_mapper_creation() {
		$mapper = new Transform_Prop_Type_Mapper();
		
		$this->assertInstanceOf( Transform_Prop_Type_Mapper::class, $mapper );
		$this->assertEquals( 'transform', $mapper->get_atomic_prop_type() );
		$this->assertContains( 'transform', $mapper->get_supported_properties() );
	}

	public function test_transform_translate_function() {
		$mapper = new Transform_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( 'translateX(10px)' );
		
		$this->assertIsArray( $result );
		$this->assertEquals( 'transform', $result['$$type'] );
		$this->assertIsArray( $result['value'] );
		$this->assertCount( 1, $result['value'] );
		
		$transform = $result['value'][0];
		$this->assertEquals( 'translate', $transform['type'] );
		$this->assertEquals( 10.0, $transform['x']['value']['size'] );
		$this->assertEquals( 'px', $transform['x']['value']['unit'] );
		$this->assertEquals( 0.0, $transform['y']['value']['size'] );
	}

	public function test_transform_translate_xy_function() {
		$mapper = new Transform_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( 'translate(20px, 30px)' );
		
		$this->assertIsArray( $result );
		$transform = $result['value'][0];
		$this->assertEquals( 'translate', $transform['type'] );
		$this->assertEquals( 20.0, $transform['x']['value']['size'] );
		$this->assertEquals( 30.0, $transform['y']['value']['size'] );
	}

	public function test_transform_scale_function() {
		$mapper = new Transform_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( 'scale(1.5)' );
		
		$this->assertIsArray( $result );
		$transform = $result['value'][0];
		$this->assertEquals( 'scale', $transform['type'] );
		$this->assertEquals( 1.5, $transform['x']['value'] );
		$this->assertEquals( 1.5, $transform['y']['value'] );
		$this->assertEquals( 1.0, $transform['z']['value'] );
	}

	public function test_transform_rotate_function() {
		$mapper = new Transform_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( 'rotate(45deg)' );
		
		$this->assertIsArray( $result );
		$transform = $result['value'][0];
		$this->assertEquals( 'rotate', $transform['type'] );
		$this->assertEquals( 45.0, $transform['angle']['value'] );
		$this->assertEquals( 0.0, $transform['x']['value'] );
		$this->assertEquals( 0.0, $transform['y']['value'] );
		$this->assertEquals( 1.0, $transform['z']['value'] );
	}

	public function test_transform_multiple_functions() {
		$mapper = new Transform_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( 'translateX(10px) rotate(45deg) scale(1.2)' );
		
		$this->assertIsArray( $result );
		$this->assertCount( 3, $result['value'] );
		
		$translate = $result['value'][0];
		$rotate = $result['value'][1];
		$scale = $result['value'][2];
		
		$this->assertEquals( 'translate', $translate['type'] );
		$this->assertEquals( 'rotate', $rotate['type'] );
		$this->assertEquals( 'scale', $scale['type'] );
	}

	public function test_transform_none_value() {
		$mapper = new Transform_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( 'none' );
		
		$this->assertNull( $result );
	}

	public function test_transition_prop_type_mapper_creation() {
		$mapper = new Transition_Prop_Type_Mapper();
		
		$this->assertInstanceOf( Transition_Prop_Type_Mapper::class, $mapper );
		$this->assertEquals( 'transition', $mapper->get_atomic_prop_type() );
		$this->assertContains( 'transition', $mapper->get_supported_properties() );
		$this->assertContains( 'transition-duration', $mapper->get_supported_properties() );
		$this->assertContains( 'transition-property', $mapper->get_supported_properties() );
	}

	public function test_transition_shorthand_parsing() {
		$mapper = new Transition_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( 'opacity 0.3s ease-in-out 0.1s' );
		
		$this->assertIsArray( $result );
		$this->assertEquals( 'transition', $result['$$type'] );
		$this->assertIsArray( $result['value'] );
		$this->assertCount( 1, $result['value'] );
		
		$transition = $result['value'][0];
		$this->assertEquals( 'opacity', $transition['property']['value'] );
		$this->assertEquals( 0.3, $transition['duration']['value']['value'] );
		$this->assertEquals( 's', $transition['duration']['value']['unit'] );
		$this->assertEquals( 'ease-in-out', $transition['timing-function']['value'] );
		$this->assertEquals( 0.1, $transition['delay']['value']['value'] );
	}

	public function test_transition_multiple_properties() {
		$mapper = new Transition_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( 'opacity 0.3s, transform 0.5s' );
		
		$this->assertIsArray( $result );
		$this->assertCount( 2, $result['value'] );
		
		$opacity_transition = $result['value'][0];
		$transform_transition = $result['value'][1];
		
		$this->assertEquals( 'opacity', $opacity_transition['property']['value'] );
		$this->assertEquals( 0.3, $opacity_transition['duration']['value']['value'] );
		$this->assertEquals( 'transform', $transform_transition['property']['value'] );
		$this->assertEquals( 0.5, $transform_transition['duration']['value']['value'] );
	}

	public function test_transition_duration_only() {
		$mapper = new Transition_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( '0.5s' );
		
		$this->assertIsArray( $result );
		$transition = $result['value'][0];
		$this->assertEquals( 'all', $transition['property']['value'] );
		$this->assertEquals( 0.5, $transition['duration']['value']['value'] );
		$this->assertEquals( 'ease', $transition['timing-function']['value'] );
	}

	public function test_transition_milliseconds_conversion() {
		$mapper = new Transition_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( '500ms' );
		
		$this->assertIsArray( $result );
		$transition = $result['value'][0];
		$this->assertEquals( 0.5, $transition['duration']['value']['value'] );
		$this->assertEquals( 's', $transition['duration']['value']['unit'] );
	}

	public function test_transition_none_value() {
		$mapper = new Transition_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( 'none' );
		
		$this->assertNull( $result );
	}

	public function test_factory_phase4_integration() {
		$mappers = Atomic_Prop_Mapper_Factory::get_all_atomic_prop_mappers();
		
		$this->assertArrayHasKey( 'transform', $mappers );
		$this->assertArrayHasKey( 'transition', $mappers );
		$this->assertInstanceOf( Transform_Prop_Type_Mapper::class, $mappers['transform'] );
		$this->assertInstanceOf( Transition_Prop_Type_Mapper::class, $mappers['transition'] );
	}

	public function test_factory_phase4_property_support() {
		$this->assertTrue( Atomic_Prop_Mapper_Factory::can_convert_css_property( 'transform' ) );
		$this->assertTrue( Atomic_Prop_Mapper_Factory::can_convert_css_property( 'transition' ) );
		$this->assertTrue( Atomic_Prop_Mapper_Factory::can_convert_css_property( 'transition-duration' ) );
		$this->assertTrue( Atomic_Prop_Mapper_Factory::can_convert_css_property( 'transition-property' ) );
		$this->assertTrue( Atomic_Prop_Mapper_Factory::can_convert_css_property( 'transition-timing-function' ) );
		$this->assertTrue( Atomic_Prop_Mapper_Factory::can_convert_css_property( 'transition-delay' ) );
	}

	public function test_factory_phase4_css_conversion() {
		$transform_result = Atomic_Prop_Mapper_Factory::convert_css_property_to_atomic_format( 'transform', 'translateX(10px) rotate(45deg)' );
		$transition_result = Atomic_Prop_Mapper_Factory::convert_css_property_to_atomic_format( 'transition', 'opacity 0.3s ease' );
		
		$this->assertIsArray( $transform_result );
		$this->assertEquals( 'transform', $transform_result['$$type'] );
		$this->assertCount( 2, $transform_result['value'] );
		
		$this->assertIsArray( $transition_result );
		$this->assertEquals( 'transition', $transition_result['$$type'] );
		$this->assertCount( 1, $transition_result['value'] );
	}

	public function test_factory_updated_statistics() {
		$stats = Atomic_Prop_Mapper_Factory::get_conversion_capability_statistics();
		
		$this->assertIsArray( $stats );
		$this->assertEquals( 14, $stats['total_atomic_prop_mappers'] );
		$this->assertGreaterThan( 40, $stats['total_convertible_css_properties'] );
		$this->assertArrayHasKey( 'transform', $stats['atomic_prop_types_coverage'] );
		$this->assertArrayHasKey( 'transition', $stats['atomic_prop_types_coverage'] );
	}

	public function test_factory_css_categories_coverage() {
		$coverage = Atomic_Prop_Mapper_Factory::get_css_property_categories_coverage();
		
		$this->assertIsArray( $coverage );
		$this->assertEquals( 2, $coverage['animation_mappers_count'] );
		$this->assertGreaterThan( 5, $coverage['animation_css_properties_count'] );
		$this->assertEquals( 14, $coverage['total_atomic_prop_mappers'] );
	}

	public function test_factory_organized_by_css_purpose() {
		$organized = Atomic_Prop_Mapper_Factory::get_atomic_prop_mappers_organized_by_css_purpose();
		
		$this->assertIsArray( $organized );
		$this->assertArrayHasKey( 'animations_and_transitions', $organized );
		$this->assertArrayHasKey( 'transform', $organized['animations_and_transitions'] );
		$this->assertArrayHasKey( 'transition', $organized['animations_and_transitions'] );
		$this->assertInstanceOf( Transform_Prop_Type_Mapper::class, $organized['animations_and_transitions']['transform'] );
		$this->assertInstanceOf( Transition_Prop_Type_Mapper::class, $organized['animations_and_transitions']['transition'] );
	}

	public function test_transform_angle_conversion() {
		$mapper = new Transform_Prop_Type_Mapper();
		
		$deg_result = $mapper->map_css_to_atomic( 'rotate(90deg)' );
		$rad_result = $mapper->map_css_to_atomic( 'rotate(1.57rad)' );
		$turn_result = $mapper->map_css_to_atomic( 'rotate(0.25turn)' );
		
		$this->assertEquals( 90.0, $deg_result['value'][0]['angle']['value'] );
		$this->assertEqualsWithDelta( 90.0, $rad_result['value'][0]['angle']['value'], 0.1 );
		$this->assertEquals( 90.0, $turn_result['value'][0]['angle']['value'] );
	}

	public function test_transition_timing_function_recognition() {
		$mapper = new Transition_Prop_Type_Mapper();
		
		$ease_result = $mapper->map_css_to_atomic( 'opacity 0.3s ease' );
		$linear_result = $mapper->map_css_to_atomic( 'opacity 0.3s linear' );
		$cubic_result = $mapper->map_css_to_atomic( 'opacity 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)' );
		
		$this->assertEquals( 'ease', $ease_result['value'][0]['timing-function']['value'] );
		$this->assertEquals( 'linear', $linear_result['value'][0]['timing-function']['value'] );
		$this->assertEquals( 'cubic-bezier(0.25, 0.1, 0.25, 1)', $cubic_result['value'][0]['timing-function']['value'] );
	}

	public function test_complex_transform_combinations() {
		$mapper = new Transform_Prop_Type_Mapper();
		
		$result = $mapper->map_css_to_atomic( 'translate3d(10px, 20px, 30px) rotateX(45deg) scaleY(1.5) skew(10deg, 20deg)' );
		
		$this->assertIsArray( $result );
		$this->assertCount( 4, $result['value'] );
		
		$translate3d = $result['value'][0];
		$rotateX = $result['value'][1];
		$scaleY = $result['value'][2];
		$skew = $result['value'][3];
		
		$this->assertEquals( 'translate', $translate3d['type'] );
		$this->assertEquals( 30.0, $translate3d['z']['value']['size'] );
		
		$this->assertEquals( 'rotate', $rotateX['type'] );
		$this->assertEquals( 1.0, $rotateX['x']['value'] );
		
		$this->assertEquals( 'scale', $scaleY['type'] );
		$this->assertEquals( 1.5, $scaleY['y']['value'] );
		
		$this->assertEquals( 'skew', $skew['type'] );
		$this->assertEquals( 10.0, $skew['x']['value'] );
		$this->assertEquals( 20.0, $skew['y']['value'] );
	}

	public function test_edge_cases_and_error_handling() {
		$transform_mapper = new Transform_Prop_Type_Mapper();
		$transition_mapper = new Transition_Prop_Type_Mapper();
		
		$this->assertNull( $transform_mapper->map_css_to_atomic( '' ) );
		$this->assertNull( $transform_mapper->map_css_to_atomic( 'none' ) );
		$this->assertNull( $transform_mapper->map_css_to_atomic( 'invalid-function(10px)' ) );
		
		$this->assertNull( $transition_mapper->map_css_to_atomic( '' ) );
		$this->assertNull( $transition_mapper->map_css_to_atomic( 'none' ) );
		
		$invalid_transform = $transform_mapper->map_css_to_atomic( 'rotate()' );
		$this->assertNull( $invalid_transform );
	}
}
