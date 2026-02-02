<?php
namespace Elementor\Tests\Phpunit\Modules\CssConverter\Convertors\CssPropertiesV2\Properties;

use Elementor\Tests\Phpunit\Modules\CssConverter\Convertors\CssPropertiesV2\PropertyMapperV2TestCase;
use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties\Margin_Property_Mapper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * 300% STRICT Test for Margin Property Mapper
 * 
 * This test validates the most complex property mapper with Dimensions_Prop_Type.
 * Every aspect of shorthand parsing and logical properties is tested with zero tolerance.
 */
class MarginPropertyMapperTest extends PropertyMapperV2TestCase {

	private Margin_Property_Mapper $mapper;

	protected function setUp(): void {
		parent::setUp();
		$this->mapper = new Margin_Property_Mapper();
		
		// 300% STRICT: Validate mapper interface compliance
		$this->assertValidPropertyMapperInterface( $this->mapper );
	}

	/**
	 * 300% STRICT: Property support validation
	 * Must support ALL margin properties and reject everything else
	 */
	public function test_supports_all_margin_properties_with_extreme_precision(): void {
		$supported_properties = [
			'margin',
			'margin-top',
			'margin-right',
			'margin-bottom',
			'margin-left',
		];
		
		// STRICT: Must support all margin properties
		foreach ( $supported_properties as $property ) {
			$this->assertTrue( 
				$this->mapper->supports_property( $property ), 
				"Must support margin property: {$property}" 
			);
		}
		
		// STRICT: Must reject non-margin properties
		$rejected_properties = [
			'padding',
			'padding-top',
			'border',
			'margin-inline',
			'margin-block',
			'margin-top-left', // invalid
			'margins', // plural
			'margin_top', // underscore
			'marginTop', // camelCase
			'MARGIN', // uppercase
			'margin ', // trailing space
			' margin', // leading space
			'',
			null,
			false,
			0,
			[],
		];
		
		foreach ( $rejected_properties as $property ) {
			$this->assertFalse( 
				$this->mapper->supports_property( $property ), 
				"Must reject property: " . var_export( $property, true ) 
			);
		}
	}

	/**
	 * 300% STRICT: Margin shorthand single value
	 * Must parse single value to all four logical directions
	 */
	public function test_margin_shorthand_single_value_with_exact_structure(): void {
		$test_cases = [
			'10px' => ['size' => 10.0, 'unit' => 'px'],
			'1em' => ['size' => 1.0, 'unit' => 'em'],
			'2rem' => ['size' => 2.0, 'unit' => 'rem'],
			'5%' => ['size' => 5.0, 'unit' => '%'],
			'0' => ['size' => 0.0, 'unit' => 'px'], // unitless zero
		];
		
		foreach ( $test_cases as $input => $expected_size ) {
			$result = $this->mapper->map_to_v4_atomic( 'margin', $input );
			
			// STRICT: Must not be null
			$this->assertNotNull( $result, "Must successfully map margin: {$input}" );
			
			// STRICT: Must normalize property name to 'margin'
			$this->assertSame( 'margin', $result['property'], 'Property must be normalized to margin' );
			
			// STRICT: Must have dimensions type
			$this->assertSame( 'dimensions', $result['value']['$$type'], 'Must be dimensions type' );
			
			// STRICT: All four directions must have same value
			$expected_dimensions = [
				'block-start' => $expected_size,
				'inline-end' => $expected_size,
				'block-end' => $expected_size,
				'inline-start' => $expected_size,
			];
			
			$this->assertDimensionsPropertyStructure( $result, $expected_dimensions, "Single value: {$input}" );
		}
	}

	/**
	 * 300% STRICT: Margin shorthand two values
	 * Must parse two values to vertical/horizontal pattern
	 */
	public function test_margin_shorthand_two_values_with_exact_structure(): void {
		$test_cases = [
			'10px 20px' => [
				'block-start' => ['size' => 10.0, 'unit' => 'px'],
				'inline-end' => ['size' => 20.0, 'unit' => 'px'],
				'block-end' => ['size' => 10.0, 'unit' => 'px'],
				'inline-start' => ['size' => 20.0, 'unit' => 'px'],
			],
			'1em 2em' => [
				'block-start' => ['size' => 1.0, 'unit' => 'em'],
				'inline-end' => ['size' => 2.0, 'unit' => 'em'],
				'block-end' => ['size' => 1.0, 'unit' => 'em'],
				'inline-start' => ['size' => 2.0, 'unit' => 'em'],
			],
			'0 auto' => [
				'block-start' => ['size' => 0.0, 'unit' => 'px'],
				'inline-end' => null, // auto should be rejected for now
				'block-end' => ['size' => 0.0, 'unit' => 'px'],
				'inline-start' => null, // auto should be rejected for now
			],
		];
		
		foreach ( $test_cases as $input => $expected_dimensions ) {
			// Skip auto test for now (not implemented)
			if ( str_contains( $input, 'auto' ) ) {
				$result = $this->mapper->map_to_v4_atomic( 'margin', $input );
				$this->assertStrictNull( $result, "Auto values should be rejected: {$input}" );
				continue;
			}
			
			$result = $this->mapper->map_to_v4_atomic( 'margin', $input );
			
			$this->assertNotNull( $result, "Must successfully map margin: {$input}" );
			$this->assertDimensionsPropertyStructure( $result, $expected_dimensions, "Two values: {$input}" );
		}
	}

	/**
	 * 300% STRICT: Margin shorthand four values
	 * Must parse four values to exact logical property mapping
	 */
	public function test_margin_shorthand_four_values_with_exact_structure(): void {
		$test_cases = [
			'10px 20px 30px 40px' => [
				'block-start' => ['size' => 10.0, 'unit' => 'px'], // top
				'inline-end' => ['size' => 20.0, 'unit' => 'px'], // right
				'block-end' => ['size' => 30.0, 'unit' => 'px'], // bottom
				'inline-start' => ['size' => 40.0, 'unit' => 'px'], // left
			],
			'1em 2em 3em 4em' => [
				'block-start' => ['size' => 1.0, 'unit' => 'em'],
				'inline-end' => ['size' => 2.0, 'unit' => 'em'],
				'block-end' => ['size' => 3.0, 'unit' => 'em'],
				'inline-start' => ['size' => 4.0, 'unit' => 'em'],
			],
			'5% 10% 15% 20%' => [
				'block-start' => ['size' => 5.0, 'unit' => '%'],
				'inline-end' => ['size' => 10.0, 'unit' => '%'],
				'block-end' => ['size' => 15.0, 'unit' => '%'],
				'inline-start' => ['size' => 20.0, 'unit' => '%'],
			],
		];
		
		foreach ( $test_cases as $input => $expected_dimensions ) {
			$result = $this->mapper->map_to_v4_atomic( 'margin', $input );
			
			$this->assertNotNull( $result, "Must successfully map margin: {$input}" );
			$this->assertDimensionsPropertyStructure( $result, $expected_dimensions, "Four values: {$input}" );
		}
	}

	/**
	 * 300% STRICT: Individual margin properties
	 * Must map individual properties to correct logical directions
	 */
	public function test_individual_margin_properties_with_exact_logical_mapping(): void {
		$individual_properties = [
			'margin-top' => 'block-start',
			'margin-right' => 'inline-end',
			'margin-bottom' => 'block-end',
			'margin-left' => 'inline-start',
		];
		
		foreach ( $individual_properties as $property => $logical_direction ) {
			$result = $this->mapper->map_to_v4_atomic( $property, '15px' );
			
			// STRICT: Must not be null
			$this->assertNotNull( $result, "Must successfully map {$property}" );
			
			// STRICT: Must normalize property name to 'margin'
			$this->assertSame( 'margin', $result['property'], "Property must be normalized to margin for {$property}" );
			
			// STRICT: Must have dimensions type
			$this->assertSame( 'dimensions', $result['value']['$$type'], "Must be dimensions type for {$property}" );
			
			// STRICT: Target direction must have correct value, others must be zero
			$dimensions = $result['value']['value'];
			$this->assertIsArray( $dimensions, "Dimensions must be array for {$property}" );
			
			$expected_size = ['size' => 15.0, 'unit' => 'px'];
			$zero_size = ['size' => 0.0, 'unit' => 'px'];
			
			foreach ( ['block-start', 'inline-end', 'block-end', 'inline-start'] as $direction ) {
				$this->assertArrayHasKey( $direction, $dimensions, "Missing direction {$direction} for {$property}" );
				$this->assertSame( 'size', $dimensions[$direction]['$$type'], "Direction {$direction} must be size type for {$property}" );
				
				if ( $direction === $logical_direction ) {
					$this->assertSame( $expected_size, $dimensions[$direction]['value'], "Target direction {$direction} must have correct value for {$property}" );
				} else {
					$this->assertSame( $zero_size, $dimensions[$direction]['value'], "Non-target direction {$direction} must be zero for {$property}" );
				}
			}
		}
	}

	/**
	 * 300% STRICT: Mixed units handling
	 * Must handle different units correctly with exact precision
	 */
	public function test_mixed_units_with_exact_precision(): void {
		$mixed_unit_tests = [
			'10px 1em 20px 2rem' => [
				'block-start' => ['size' => 10.0, 'unit' => 'px'],
				'inline-end' => ['size' => 1.0, 'unit' => 'em'],
				'block-end' => ['size' => 20.0, 'unit' => 'px'],
				'inline-start' => ['size' => 2.0, 'unit' => 'rem'],
			],
			'5% 10px' => [
				'block-start' => ['size' => 5.0, 'unit' => '%'],
				'inline-end' => ['size' => 10.0, 'unit' => 'px'],
				'block-end' => ['size' => 5.0, 'unit' => '%'],
				'inline-start' => ['size' => 10.0, 'unit' => 'px'],
			],
		];
		
		foreach ( $mixed_unit_tests as $input => $expected_dimensions ) {
			$result = $this->mapper->map_to_v4_atomic( 'margin', $input );
			
			$this->assertNotNull( $result, "Must handle mixed units: {$input}" );
			$this->assertDimensionsPropertyStructure( $result, $expected_dimensions, "Mixed units: {$input}" );
		}
	}

	/**
	 * 300% STRICT: Invalid value rejection
	 * Must reject ALL invalid values with strict null
	 */
	public function test_rejects_all_invalid_values_with_strict_null(): void {
		$invalid_values = [
			// Invalid CSS values
			'invalid',
			'10',
			'px',
			'10 px', // space in unit
			'10pxx', // invalid unit
			'10px 20px 30px 40px 50px', // too many values
			'10px 20px 30px', // three values (not supported in CSS)
			
			// Auto values (not implemented yet)
			'auto',
			'10px auto',
			'auto 10px',
			
			// Negative values (might be valid but test rejection)
			'-10px',
			
			// Empty/null values
			'',
			'   ',
			"\t",
			"\n",
			null,
			
			// Wrong types
			123,
			0,
			-1,
			1.5,
			true,
			false,
			[],
			['10px'],
			(object) ['value' => '10px'],
			
			// Invalid syntax
			'10px;', // semicolon
			'10px,', // comma
			'10px!important', // important
			'calc(10px + 5px)', // calc (not implemented)
		];
		
		foreach ( $invalid_values as $invalid_value ) {
			$result = $this->mapper->map_to_v4_atomic( 'margin', $invalid_value );
			$this->assertStrictNull( $result, "Must reject invalid value: " . var_export( $invalid_value, true ) );
		}
	}

	/**
	 * 300% STRICT: Numeric precision validation
	 * Must handle numeric values with exact precision
	 */
	public function test_numeric_precision_with_exact_validation(): void {
		$precision_tests = [
			'10.5px' => ['size' => 10.5, 'unit' => 'px'],
			'0.25em' => ['size' => 0.25, 'unit' => 'em'],
			'100.0px' => ['size' => 100.0, 'unit' => 'px'],
			'0.0px' => ['size' => 0.0, 'unit' => 'px'],
		];
		
		foreach ( $precision_tests as $input => $expected_size ) {
			$result = $this->mapper->map_to_v4_atomic( 'margin', $input );
			
			$this->assertNotNull( $result, "Must handle precision: {$input}" );
			
			$dimensions = $result['value']['value'];
			$actual_size = $dimensions['block-start']['value'];
			
			// STRICT: Size must be exact float
			$this->assertTrue( 
				is_float( $actual_size['size'] ) || is_int( $actual_size['size'] ), 
				"Size must be numeric for {$input}" 
			);
			$this->assertSame( $expected_size['size'], $actual_size['size'], "Size precision must be exact for {$input}" );
			$this->assertSame( $expected_size['unit'], $actual_size['unit'], "Unit must be exact for {$input}" );
		}
	}

	/**
	 * 300% STRICT: Atomic widget integration
	 * Must support correct atomic widgets with strict validation
	 */
	public function test_atomic_widget_integration_with_strict_validation(): void {
		$supported_widgets = $this->mapper->get_supported_atomic_widgets();
		
		// STRICT: Must be array and not empty
		$this->assertIsArray( $supported_widgets, 'Supported widgets must be array' );
		$this->assertNotEmpty( $supported_widgets, 'Supported widgets cannot be empty' );
		
		// STRICT: Must contain expected widgets for margin
		$expected_widgets = ['e-container', 'e-flexbox', 'e-heading', 'e-paragraph', 'e-button'];
		foreach ( $expected_widgets as $expected_widget ) {
			$this->assertContains( $expected_widget, $supported_widgets, "Must support widget: {$expected_widget}" );
		}
		
		// STRICT: All widgets must be valid
		foreach ( $supported_widgets as $widget ) {
			$this->assertValidAtomicWidget( $widget );
		}
	}

	/**
	 * 300% STRICT: Prop type integration
	 * Must require Dimensions_Prop_Type with strict validation
	 */
	public function test_prop_type_integration_with_strict_validation(): void {
		$required_prop_types = $this->mapper->get_required_prop_types();
		
		// STRICT: Must be array and not empty
		$this->assertIsArray( $required_prop_types, 'Required prop types must be array' );
		$this->assertNotEmpty( $required_prop_types, 'Required prop types cannot be empty' );
		
		// STRICT: Must contain Dimensions_Prop_Type
		$this->assertContains( 'Dimensions_Prop_Type', $required_prop_types, 'Must require Dimensions_Prop_Type' );
		
		// STRICT: All prop types must be valid
		foreach ( $required_prop_types as $prop_type ) {
			$this->assertValidPropType( $prop_type );
		}
	}

	/**
	 * 300% STRICT: Property name normalization
	 * All individual margin properties must normalize to 'margin'
	 */
	public function test_property_name_normalization_with_strict_validation(): void {
		$individual_properties = ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'];
		
		foreach ( $individual_properties as $property ) {
			$result = $this->mapper->map_to_v4_atomic( $property, '10px' );
			
			$this->assertNotNull( $result, "Must map {$property}" );
			$this->assertSame( 'margin', $result['property'], "Must normalize {$property} to 'margin'" );
		}
	}

	/**
	 * 300% STRICT: Supported properties validation
	 * Must return exact list of supported properties
	 */
	public function test_supported_properties_with_exact_list(): void {
		$supported = $this->mapper->get_supported_properties();
		
		// STRICT: Must be array and not empty
		$this->assertIsArray( $supported, 'Supported properties must be array' );
		$this->assertNotEmpty( $supported, 'Supported properties cannot be empty' );
		
		// STRICT: Must contain all margin properties
		$expected_properties = ['margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left'];
		foreach ( $expected_properties as $expected_property ) {
			$this->assertContains( $expected_property, $supported, "Must support: {$expected_property}" );
		}
		
		$this->assertCount( 5, $supported, 'Must support exactly 5 properties' );
	}
}
