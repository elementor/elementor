<?php
namespace Elementor\Tests\Phpunit\Modules\CssConverter\Convertors\CssPropertiesV2\Properties;

use Elementor\Tests\Phpunit\Modules\CssConverter\Convertors\CssPropertiesV2\PropertyMapperV2TestCase;
use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties\Align_Items_Property_Mapper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * 300% STRICT Test for Align Items Property Mapper
 * 
 * This test is designed to catch ANY deviation from expected atomic widget behavior.
 * Every test case validates the complete atomic structure with zero tolerance for errors.
 */
class AlignItemsPropertyMapperTest extends PropertyMapperV2TestCase {

	private Align_Items_Property_Mapper $mapper;

	protected function setUp(): void {
		parent::setUp();
		$this->mapper = new Align_Items_Property_Mapper();
		
		// 300% STRICT: Validate mapper interface compliance
		$this->assertValidPropertyMapperInterface( $this->mapper );
	}

	/**
	 * 300% STRICT: Property support validation
	 * Must support ONLY align-items and reject everything else
	 */
	public function test_supports_align_items_property_with_extreme_precision(): void {
		// STRICT: Must support exact property
		$this->assertTrue( $this->mapper->supports_property( 'align-items' ), 'Must support align-items exactly' );
		
		// STRICT: Must reject similar but different properties
		$rejected_properties = [
			'align-content',
			'align-self',
			'justify-items',
			'justify-content',
			'flex-direction',
			'align_items', // underscore instead of dash
			'alignItems', // camelCase
			'ALIGN-ITEMS', // uppercase
			'align-items ', // trailing space
			' align-items', // leading space
			'align-item', // singular
			'align-itemss', // double s
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
	 * 300% STRICT: Valid align-items values mapping
	 * Tests every valid CSS align-items value with exact atomic structure validation
	 */
	public function test_maps_all_valid_align_items_values_with_exact_structure(): void {
		$valid_values = [
			'stretch' => 'stretch',
			'flex-start' => 'flex-start',
			'flex-end' => 'flex-end',
			'center' => 'center',
			'baseline' => 'baseline',
			'start' => 'start',
			'end' => 'end',
			'self-start' => 'self-start',
			'self-end' => 'self-end',
		];

		foreach ( $valid_values as $input => $expected_output ) {
			$result = $this->mapper->map_to_v4_atomic( 'align-items', $input );
			
			// STRICT: Must not be null
			$this->assertNotNull( $result, "Must successfully map '{$input}'" );
			
			// STRICT: Must have exact atomic structure
			$expected_structure = [
				'property' => 'align-items',
				'value' => [
					'$$type' => 'string',
					'value' => $expected_output,
				],
			];
			
			$this->assertAtomicPropertyStructure( $expected_structure, $result, "align-items: {$input}" );
			$this->assertStringPropertyStructure( $result, $expected_output, "align-items: {$input}" );
		}
	}

	/**
	 * 300% STRICT: Case insensitive handling
	 * Must normalize case but maintain exact output
	 */
	public function test_handles_case_variations_with_exact_normalization(): void {
		$case_variations = [
			'CENTER' => 'center',
			'Center' => 'center',
			'cEnTeR' => 'center',
			'FLEX-START' => 'flex-start',
			'Flex-Start' => 'flex-start',
			'STRETCH' => 'stretch',
			'Stretch' => 'stretch',
			'BASELINE' => 'baseline',
			'BaseLine' => 'baseline',
		];

		foreach ( $case_variations as $input => $expected_output ) {
			$result = $this->mapper->map_to_v4_atomic( 'align-items', $input );
			
			$this->assertNotNull( $result, "Must handle case variation: {$input}" );
			$this->assertStringPropertyStructure( $result, $expected_output, "Case handling: {$input}" );
		}
	}

	/**
	 * 300% STRICT: Whitespace handling
	 * Must handle whitespace correctly but produce exact output
	 */
	public function test_handles_whitespace_with_exact_trimming(): void {
		$whitespace_variations = [
			'  center  ' => 'center',
			' flex-start ' => 'flex-start',
			'	stretch	' => 'stretch', // tabs
			"\n baseline \n" => 'baseline', // newlines
			'  FLEX-END  ' => 'flex-end',
		];

		foreach ( $whitespace_variations as $input => $expected_output ) {
			$result = $this->mapper->map_to_v4_atomic( 'align-items', $input );
			
			$this->assertNotNull( $result, "Must handle whitespace: " . var_export( $input, true ) );
			$this->assertStringPropertyStructure( $result, $expected_output, "Whitespace handling: {$input}" );
		}
	}

	/**
	 * 300% STRICT: Invalid value rejection
	 * Must reject ALL invalid values and return exactly null
	 */
	public function test_rejects_all_invalid_values_with_strict_null(): void {
		$invalid_values = [
			// Invalid CSS values
			'invalid-value',
			'left',
			'right',
			'top',
			'bottom',
			'middle',
			'justify',
			'space-between',
			'space-around',
			'space-evenly',
			
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
			['center'],
			(object) ['value' => 'center'],
			
			// Almost correct but wrong
			'flex_start', // underscore
			'flexStart', // camelCase
			'flex start', // space
			'flex-starts', // plural
			'center;', // semicolon
			'center,', // comma
			'center!important', // important
		];

		foreach ( $invalid_values as $invalid_value ) {
			$result = $this->mapper->map_to_v4_atomic( 'align-items', $invalid_value );
			$this->assertStrictNull( $result, "Must reject invalid value: " . var_export( $invalid_value, true ) );
		}
	}

	/**
	 * 300% STRICT: Atomic widget integration validation
	 * Must return exact atomic widgets with strict validation
	 */
	public function test_atomic_widget_integration_with_strict_validation(): void {
		$supported_widgets = $this->mapper->get_supported_atomic_widgets();
		
		// STRICT: Must be array
		$this->assertIsArray( $supported_widgets, 'Supported widgets must be array' );
		$this->assertNotEmpty( $supported_widgets, 'Supported widgets cannot be empty' );
		
		// STRICT: Must contain e-flexbox (primary widget for align-items)
		$this->assertContains( 'e-flexbox', $supported_widgets, 'Must support e-flexbox widget' );
		
		// STRICT: All widgets must be valid atomic widgets
		foreach ( $supported_widgets as $widget ) {
			$this->assertValidAtomicWidget( $widget );
		}
		
		// STRICT: No duplicates allowed
		$this->assertSame( $supported_widgets, array_unique( $supported_widgets ), 'No duplicate widgets allowed' );
	}

	/**
	 * 300% STRICT: Prop type integration validation
	 * Must return exact prop types with strict validation
	 */
	public function test_prop_type_integration_with_strict_validation(): void {
		$required_prop_types = $this->mapper->get_required_prop_types();
		
		// STRICT: Must be array
		$this->assertIsArray( $required_prop_types, 'Required prop types must be array' );
		$this->assertNotEmpty( $required_prop_types, 'Required prop types cannot be empty' );
		
		// STRICT: Must contain String_Prop_Type (align-items uses string type)
		$this->assertContains( 'String_Prop_Type', $required_prop_types, 'Must require String_Prop_Type' );
		
		// STRICT: All prop types must be valid
		foreach ( $required_prop_types as $prop_type ) {
			$this->assertValidPropType( $prop_type );
		}
		
		// STRICT: No duplicates allowed
		$this->assertSame( $required_prop_types, array_unique( $required_prop_types ), 'No duplicate prop types allowed' );
	}

	/**
	 * 300% STRICT: Atomic output validation
	 * Must validate atomic output structure with extreme precision
	 */
	public function test_validates_atomic_output_with_extreme_precision(): void {
		$result = $this->mapper->map_to_v4_atomic( 'align-items', 'center' );
		
		$this->assertNotNull( $result, 'Result must not be null' );
		$this->assertTrue( $this->mapper->validate_atomic_output( $result ), 'Must validate atomic output' );
		
		// STRICT: Test validation with invalid structures
		$invalid_structures = [
			[], // empty array
			['property' => 'align-items'], // missing value
			['value' => ['$$type' => 'string', 'value' => 'center']], // missing property
			['property' => 'align-items', 'value' => ['$$type' => 'string']], // missing value in value
			['property' => 'align-items', 'value' => ['value' => 'center']], // missing $$type
			['property' => 'align-items', 'value' => ['$$type' => 'size', 'value' => 'center']], // wrong type
		];
		
		foreach ( $invalid_structures as $invalid_structure ) {
			$this->assertFalse( 
				$this->mapper->validate_atomic_output( $invalid_structure ), 
				'Must reject invalid structure: ' . wp_json_encode( $invalid_structure ) 
			);
		}
	}

	/**
	 * 300% STRICT: Schema conversion validation
	 * Must convert to v3 schema with exact structure
	 */
	public function test_schema_conversion_with_exact_structure(): void {
		$result = $this->mapper->map_to_schema( 'align-items', 'center' );
		
		// STRICT: Must not be null
		$this->assertNotNull( $result, 'Schema result must not be null' );
		$this->assertIsArray( $result, 'Schema result must be array' );
		
		// STRICT: Must have exact v3 structure
		$this->assertArrayHasKey( 'align-items', $result, 'Must have align-items key' );
		$this->assertCount( 1, $result, 'Must have exactly 1 key' );
		
		$schema_value = $result['align-items'];
		$this->assertIsArray( $schema_value, 'Schema value must be array' );
		$this->assertArrayHasKey( '$$type', $schema_value, 'Must have $$type in schema' );
		$this->assertArrayHasKey( 'value', $schema_value, 'Must have value in schema' );
		$this->assertCount( 2, $schema_value, 'Schema value must have exactly 2 keys' );
		$this->assertSame( 'string', $schema_value['$$type'], 'Schema $$type must be string' );
		$this->assertSame( 'center', $schema_value['value'], 'Schema value must be center' );
	}

	/**
	 * 300% STRICT: Supported properties validation
	 * Must return exact supported properties list
	 */
	public function test_supported_properties_with_exact_list(): void {
		$supported = $this->mapper->get_supported_properties();
		
		// STRICT: Must be array
		$this->assertIsArray( $supported, 'Supported properties must be array' );
		$this->assertNotEmpty( $supported, 'Supported properties cannot be empty' );
		
		// STRICT: Must contain exactly align-items
		$this->assertContains( 'align-items', $supported, 'Must support align-items' );
		$this->assertCount( 1, $supported, 'Must support exactly 1 property' );
		$this->assertSame( ['align-items'], $supported, 'Must support only align-items' );
	}

	/**
	 * 300% STRICT: Edge case validation
	 * Must handle all edge cases correctly
	 */
	public function test_edge_cases_with_strict_validation(): void {
		// STRICT: Test with unsupported property
		$result = $this->mapper->map_to_v4_atomic( 'justify-content', 'center' );
		$this->assertStrictNull( $result, 'Must reject unsupported property' );
		
		// STRICT: Test with valid property but invalid value
		$result = $this->mapper->map_to_v4_atomic( 'align-items', 'invalid' );
		$this->assertStrictNull( $result, 'Must reject invalid value' );
		
		// STRICT: Test boundary values
		$boundary_tests = [
			'stretch' => 'stretch', // first valid value
			'self-end' => 'self-end', // last valid value
		];
		
		foreach ( $boundary_tests as $input => $expected ) {
			$result = $this->mapper->map_to_v4_atomic( 'align-items', $input );
			$this->assertNotNull( $result, "Must handle boundary value: {$input}" );
			$this->assertStringPropertyStructure( $result, $expected, "Boundary test: {$input}" );
		}
	}

	/**
	 * 300% STRICT: Performance and consistency validation
	 * Must perform consistently across multiple calls
	 */
	public function test_performance_and_consistency_validation(): void {
		$test_value = 'center';
		$results = [];
		
		// STRICT: Multiple calls must produce identical results
		for ( $i = 0; $i < 10; $i++ ) {
			$results[] = $this->mapper->map_to_v4_atomic( 'align-items', $test_value );
		}
		
		// STRICT: All results must be identical
		$first_result = $results[0];
		foreach ( $results as $i => $result ) {
			$this->assertSame( $first_result, $result, "Result {$i} must be identical to first result" );
		}
		
		// STRICT: Validate the structure is correct
		$this->assertStringPropertyStructure( $first_result, $test_value, 'Consistency test' );
	}
}
