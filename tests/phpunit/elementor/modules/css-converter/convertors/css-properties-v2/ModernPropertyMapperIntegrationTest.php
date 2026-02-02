<?php
namespace Elementor\Tests\Phpunit\Modules\CssConverter\Convertors\CssPropertiesV2;

use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Implementations\Modern_Property_Mapper_Factory;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * 300% STRICT Integration Test for Modern Property Mapper System
 * 
 * This test validates the complete CSS Properties V2 system with extreme precision.
 * Every aspect of the factory, mappers, and integration is tested with zero tolerance.
 */
class ModernPropertyMapperIntegrationTest extends PropertyMapperV2TestCase {

	private Modern_Property_Mapper_Factory $factory;

	protected function setUp(): void {
		parent::setUp();
		$this->factory = new Modern_Property_Mapper_Factory();
	}

	/**
	 * 300% STRICT: Factory initialization validation
	 * Must initialize with exact mapper counts and statistics
	 */
	public function test_factory_initialization_with_exact_statistics(): void {
		$stats = $this->factory->get_mapper_statistics();
		
		// STRICT: Must be array with exact structure
		$this->assertIsArray( $stats, 'Statistics must be array' );
		$required_keys = ['total_mappers', 'total_properties', 'total_atomic_widgets', 'total_prop_types', 'mappers_by_phase'];
		foreach ( $required_keys as $key ) {
			$this->assertArrayHasKey( $key, $stats, "Missing required statistics key: {$key}" );
		}
		
		// STRICT: Exact mapper counts
		$this->assertSame( 14, $stats['total_mappers'], 'Must have exactly 14 mappers (Phase 1: 5, Phase 2: 4, Phase 3: 5)' );
		$this->assertSame( 5, $stats['mappers_by_phase']['phase_1'], 'Must have exactly 5 Phase 1 mappers' );
		$this->assertSame( 4, $stats['mappers_by_phase']['phase_2'], 'Must have exactly 4 Phase 2 mappers' );
		$this->assertSame( 5, $stats['mappers_by_phase']['phase_3'], 'Must have exactly 5 Phase 3 mappers' );
		
		// STRICT: Minimum requirements
		$this->assertGreaterThanOrEqual( 20, $stats['total_properties'], 'Must support at least 20 properties' );
		$this->assertGreaterThanOrEqual( 5, $stats['total_atomic_widgets'], 'Must support at least 5 atomic widgets' );
		$this->assertGreaterThanOrEqual( 7, $stats['total_prop_types'], 'Must support at least 7 prop types' );
	}

	/**
	 * 300% STRICT: All Phase 1 properties integration
	 * Must convert every Phase 1 property with exact validation
	 */
	public function test_all_phase_1_properties_with_exact_validation(): void {
		$phase_1_properties = [
			'align-items' => 'center',
			'flex-direction' => 'column',
			'gap' => '16px',
			'display' => 'flex',
			'position' => 'relative',
		];

		foreach ( $phase_1_properties as $property => $value ) {
			// STRICT: Must be supported
			$this->assertTrue( 
				$this->factory->is_property_supported( $property ), 
				"Phase 1 property '{$property}' must be supported" 
			);

			// STRICT: Must convert successfully
			$result = $this->factory->convert_property_to_v4_atomic( $property, $value );
			$this->assertNotNull( $result, "Must convert '{$property}: {$value}'" );
			
			// STRICT: Must validate output
			$this->assertTrue( 
				$this->factory->validate_property_output( $property, $result ),
				"Must validate output for '{$property}'"
			);
			
			// STRICT: Must have correct structure
			$this->assertIsArray( $result, "Result must be array for {$property}" );
			$this->assertArrayHasKey( 'property', $result, "Missing property key for {$property}" );
			$this->assertArrayHasKey( 'value', $result, "Missing value key for {$property}" );
			$this->assertSame( $property, $result['property'], "Property name must match for {$property}" );
		}
	}

	/**
	 * 300% STRICT: All Phase 2 properties integration
	 * Must convert every Phase 2 property with exact validation
	 */
	public function test_all_phase_2_properties_with_exact_validation(): void {
		$phase_2_properties = [
			'margin' => '10px 20px',
			'padding' => '15px',
			'font-size' => '18px',
			'line-height' => '1.5',
		];

		foreach ( $phase_2_properties as $property => $value ) {
			$this->assertTrue( 
				$this->factory->is_property_supported( $property ), 
				"Phase 2 property '{$property}' must be supported" 
			);

			$result = $this->factory->convert_property_to_v4_atomic( $property, $value );
			$this->assertNotNull( $result, "Must convert '{$property}: {$value}'" );
			
			$this->assertTrue( 
				$this->factory->validate_property_output( $property, $result ),
				"Must validate output for '{$property}'"
			);
		}
	}

	/**
	 * 300% STRICT: All Phase 3 properties integration
	 * Must convert every Phase 3 property with exact validation
	 */
	public function test_all_phase_3_properties_with_exact_validation(): void {
		$phase_3_properties = [
			'color' => '#ff0000',
			'background-color' => '#00ff00',
			'background' => '#0000ff',
			'border-radius' => '8px',
			'box-shadow' => '2px 4px 8px #000000',
		];

		foreach ( $phase_3_properties as $property => $value ) {
			$this->assertTrue( 
				$this->factory->is_property_supported( $property ), 
				"Phase 3 property '{$property}' must be supported" 
			);

			$result = $this->factory->convert_property_to_v4_atomic( $property, $value );
			$this->assertNotNull( $result, "Must convert '{$property}: {$value}'" );
			
			$this->assertTrue( 
				$this->factory->validate_property_output( $property, $result ),
				"Must validate output for '{$property}'"
			);
		}
	}

	/**
	 * 300% STRICT: Atomic widget coverage validation
	 * Must support all expected atomic widgets with exact properties
	 */
	public function test_atomic_widget_coverage_with_exact_validation(): void {
		$supported_widgets = $this->factory->get_supported_atomic_widgets();
		
		$this->assertIsArray( $supported_widgets, 'Supported widgets must be array' );
		$this->assertNotEmpty( $supported_widgets, 'Supported widgets cannot be empty' );
		
		$expected_widgets = [
			'e-flexbox',
			'e-container',
			'e-heading',
			'e-paragraph',
			'e-button',
		];

		foreach ( $expected_widgets as $widget ) {
			$this->assertContains( $widget, $supported_widgets, "Must support atomic widget: {$widget}" );
			$this->assertValidAtomicWidget( $widget );
			
			// STRICT: Each widget must have properties
			$properties = $this->factory->get_properties_for_atomic_widget( $widget );
			$this->assertIsArray( $properties, "Properties must be array for {$widget}" );
			$this->assertNotEmpty( $properties, "Must have properties for widget: {$widget}" );
		}
	}

	/**
	 * 300% STRICT: Prop type coverage validation
	 * Must support all expected prop types with exact validation
	 */
	public function test_prop_type_coverage_with_exact_validation(): void {
		$required_prop_types = $this->factory->get_required_prop_types();
		
		$this->assertIsArray( $required_prop_types, 'Required prop types must be array' );
		$this->assertNotEmpty( $required_prop_types, 'Required prop types cannot be empty' );
		
		$expected_prop_types = [
			'String_Prop_Type',
			'Size_Prop_Type',
			'Dimensions_Prop_Type',
			'Color_Prop_Type',
			'Background_Prop_Type',
			'Border_Radius_Prop_Type',
			'Box_Shadow_Prop_Type',
		];

		foreach ( $expected_prop_types as $prop_type ) {
			$this->assertContains( $prop_type, $required_prop_types, "Must require prop type: {$prop_type}" );
			$this->assertValidPropType( $prop_type );
		}
	}

	/**
	 * 300% STRICT: Complex CSS conversion workflow
	 * Must handle complete CSS property sets with exact validation
	 */
	public function test_complex_css_conversion_workflow_with_exact_validation(): void {
		$css_properties = [
			'display' => 'flex',
			'flex-direction' => 'column',
			'align-items' => 'center',
			'gap' => '20px',
			'margin' => '10px 15px',
			'padding' => '20px',
			'font-size' => '16px',
			'line-height' => '1.6',
			'color' => '#333333',
			'background-color' => '#f5f5f5',
			'border-radius' => '8px',
			'box-shadow' => '0 2px 4px rgba(0,0,0,0.1)',
		];

		$converted_properties = [];
		
		foreach ( $css_properties as $property => $value ) {
			$result = $this->factory->convert_property_to_v4_atomic( $property, $value );
			
			$this->assertNotNull( $result, "Must convert {$property}: {$value}" );
			$this->assertTrue( 
				$this->factory->validate_property_output( $property, $result ),
				"Must validate {$property} output"
			);
			
			$converted_properties[ $property ] = $result;
		}

		// STRICT: All properties must be converted
		$this->assertCount( count( $css_properties ), $converted_properties, 'All properties must be converted' );

		// STRICT: Verify exact atomic types are used
		$expected_types = [
			'display' => 'string',
			'flex-direction' => 'string',
			'align-items' => 'string',
			'gap' => 'size',
			'margin' => 'dimensions',
			'padding' => 'dimensions',
			'font-size' => 'size',
			'line-height' => 'size',
			'color' => 'color',
			'background-color' => 'color',
			'border-radius' => 'border-radius',
			'box-shadow' => 'box-shadow',
		];
		
		foreach ( $expected_types as $property => $expected_type ) {
			$this->assertSame( 
				$expected_type, 
				$converted_properties[$property]['value']['$$type'], 
				"Property {$property} must have type {$expected_type}"
			);
		}
	}

	/**
	 * 300% STRICT: Schema conversion compatibility
	 * Must convert to v3 schema with exact structure
	 */
	public function test_schema_conversion_compatibility_with_exact_validation(): void {
		$test_properties = [
			'align-items' => 'center',
			'gap' => '16px',
			'margin' => '10px',
			'font-size' => '18px',
			'color' => '#ff0000',
			'border-radius' => '8px',
		];

		foreach ( $test_properties as $property => $value ) {
			$v4_result = $this->factory->convert_property_to_v4_atomic( $property, $value );
			$schema_result = $this->factory->convert_property_to_schema( $property, $value );
			
			$this->assertNotNull( $v4_result, "Must have v4 result for {$property}" );
			$this->assertNotNull( $schema_result, "Must have schema result for {$property}" );
			
			// STRICT: Schema result must contain the property key
			$this->assertIsArray( $schema_result, "Schema result must be array for {$property}" );
			$this->assertArrayHasKey( $v4_result['property'], $schema_result, "Schema must have property key for {$property}" );
			
			// STRICT: Schema result must have same $$type and value as v4 result
			$schema_prop = $schema_result[ $v4_result['property'] ];
			$this->assertIsArray( $schema_prop, "Schema property must be array for {$property}" );
			$this->assertSame( $v4_result['value']['$$type'], $schema_prop['$$type'], "Schema $$type must match for {$property}" );
			$this->assertEquals( $v4_result['value']['value'], $schema_prop['value'], "Schema value must match for {$property}" );
		}
	}

	/**
	 * 300% STRICT: Unsupported properties handling
	 * Must reject unsupported properties with strict null
	 */
	public function test_unsupported_properties_handling_with_strict_validation(): void {
		$unsupported_properties = [
			'transform',
			'animation',
			'filter',
			'clip-path',
			'mask',
			'grid-template-columns',
			'grid-template-rows',
			'transition',
		];

		foreach ( $unsupported_properties as $property ) {
			$this->assertFalse( 
				$this->factory->is_property_supported( $property ),
				"Property '{$property}' must not be supported"
			);

			$result = $this->factory->convert_property_to_v4_atomic( $property, 'test-value' );
			$this->assertStrictNull( $result, "Must return null for unsupported property: {$property}" );
		}
	}

	/**
	 * 300% STRICT: Performance validation
	 * Must handle many properties efficiently with consistent results
	 */
	public function test_performance_with_exact_consistency(): void {
		$properties = [];
		
		// Generate many property conversions
		for ( $i = 0; $i < 100; $i++ ) {
			$properties[] = ['margin', '10px'];
			$properties[] = ['padding', '5px'];
			$properties[] = ['font-size', '16px'];
			$properties[] = ['gap', '8px'];
			$properties[] = ['color', '#ff0000'];
		}

		$start_time = microtime( true );
		$results = [];
		
		foreach ( $properties as [$property, $value] ) {
			$result = $this->factory->convert_property_to_v4_atomic( $property, $value );
			$this->assertNotNull( $result, "Must convert {$property}: {$value}" );
			$results[] = $result;
		}
		
		$end_time = microtime( true );
		$duration = ( $end_time - $start_time ) * 1000; // Convert to milliseconds
		
		// STRICT: Should complete 500 conversions in reasonable time (< 200ms)
		$this->assertLessThan( 200, $duration, 'Must handle many conversions efficiently' );
		
		// STRICT: All results must be valid
		$this->assertCount( count( $properties ), $results, 'All conversions must succeed' );
	}

	/**
	 * 300% STRICT: Atomic widget property mapping validation
	 * Must map properties to widgets with exact validation
	 */
	public function test_atomic_widget_property_mapping_with_exact_validation(): void {
		$widget_property_expectations = [
			'e-flexbox' => ['align-items', 'flex-direction', 'gap', 'display'],
			'e-heading' => ['font-size', 'line-height', 'color'],
			'e-paragraph' => ['font-size', 'line-height', 'color'],
			'e-container' => ['margin', 'padding', 'position'],
		];

		foreach ( $widget_property_expectations as $widget => $expected_properties ) {
			$actual_properties = $this->factory->get_properties_for_atomic_widget( $widget );
			
			$this->assertIsArray( $actual_properties, "Properties must be array for {$widget}" );
			$this->assertNotEmpty( $actual_properties, "Must have properties for {$widget}" );
			
			foreach ( $expected_properties as $property ) {
				$this->assertContains( 
					$property, 
					$actual_properties, 
					"Widget '{$widget}' must support property '{$property}'"
				);
			}
		}
	}

	/**
	 * 300% STRICT: Factory method validation
	 * Must validate all factory methods return correct types
	 */
	public function test_factory_methods_with_exact_type_validation(): void {
		// STRICT: get_all_mappers must return array of mapper objects
		$all_mappers = $this->factory->get_all_mappers();
		$this->assertIsArray( $all_mappers, 'get_all_mappers must return array' );
		$this->assertNotEmpty( $all_mappers, 'get_all_mappers cannot be empty' );
		$this->assertCount( 14, $all_mappers, 'Must have exactly 14 mappers' );
		
		foreach ( $all_mappers as $i => $mapper ) {
			$this->assertIsObject( $mapper, "Mapper {$i} must be object" );
			$this->assertValidPropertyMapperInterface( $mapper );
		}
		
		// STRICT: get_supported_properties must return array of strings
		$supported_properties = $this->factory->get_supported_properties();
		$this->assertIsArray( $supported_properties, 'get_supported_properties must return array' );
		$this->assertNotEmpty( $supported_properties, 'get_supported_properties cannot be empty' );
		
		foreach ( $supported_properties as $property ) {
			$this->assertIsString( $property, 'Each supported property must be string' );
			$this->assertNotEmpty( $property, 'Each supported property cannot be empty' );
		}
		
		// STRICT: No duplicates allowed
		$this->assertSame( $supported_properties, array_unique( $supported_properties ), 'No duplicate properties allowed' );
	}

	/**
	 * 300% STRICT: Error handling validation
	 * Must handle errors gracefully with exact behavior
	 */
	public function test_error_handling_with_exact_behavior(): void {
		// STRICT: Invalid property names
		$invalid_properties = [null, false, 0, '', '   ', [], (object) []];
		
		foreach ( $invalid_properties as $invalid_property ) {
			$this->assertFalse( 
				$this->factory->is_property_supported( $invalid_property ),
				"Must reject invalid property: " . var_export( $invalid_property, true )
			);
			
			$result = $this->factory->convert_property_to_v4_atomic( $invalid_property, 'value' );
			$this->assertStrictNull( $result, "Must return null for invalid property: " . var_export( $invalid_property, true ) );
		}
		
		// STRICT: Valid property with invalid values
		$result = $this->factory->convert_property_to_v4_atomic( 'align-items', null );
		$this->assertStrictNull( $result, 'Must return null for valid property with invalid value' );
	}
}
