<?php
namespace Elementor\Tests\Phpunit\Modules\CssConverter\Convertors\CssPropertiesV2\Properties;

use Elementor\Tests\Phpunit\Modules\CssConverter\Convertors\CssPropertiesV2\PropertyMapperV2TestCase;
use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties\Box_Shadow_Property_Mapper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * 300% STRICT Test for Box Shadow Property Mapper
 * 
 * This is the most complex property mapper test, validating Box_Shadow_Prop_Type
 * with arrays of Shadow_Prop_Type. Every field must be exact with zero tolerance.
 */
class BoxShadowPropertyMapperTest extends PropertyMapperV2TestCase {

	private Box_Shadow_Property_Mapper $mapper;

	protected function setUp(): void {
		parent::setUp();
		$this->mapper = new Box_Shadow_Property_Mapper();
		
		// 300% STRICT: Validate mapper interface compliance
		$this->assertValidPropertyMapperInterface( $this->mapper );
	}

	/**
	 * 300% STRICT: Property support validation
	 * Must support ONLY box-shadow and reject everything else
	 */
	public function test_supports_box_shadow_property_with_extreme_precision(): void {
		// STRICT: Must support exact property
		$this->assertTrue( $this->mapper->supports_property( 'box-shadow' ), 'Must support box-shadow exactly' );
		
		// STRICT: Must reject similar but different properties
		$rejected_properties = [
			'text-shadow',
			'filter',
			'drop-shadow',
			'box-shadow-color',
			'boxShadow', // camelCase
			'box_shadow', // underscore
			'BOX-SHADOW', // uppercase
			'box-shadow ', // trailing space
			' box-shadow', // leading space
			'box-shadows', // plural
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
	 * 300% STRICT: Simple box shadow validation
	 * Must parse basic box shadow with exact structure
	 */
	public function test_simple_box_shadow_with_exact_structure(): void {
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', '2px 4px 8px #000000' );
		
		// STRICT: Must not be null
		$this->assertNotNull( $result, 'Must successfully map simple box shadow' );
		
		// STRICT: Must have exact property structure
		$this->assertSame( 'box-shadow', $result['property'], 'Property must be box-shadow' );
		$this->assertSame( 'box-shadow', $result['value']['$$type'], 'Must be box-shadow type' );
		
		// STRICT: Must have array of shadows
		$this->assertIsArray( $result['value']['value'], 'Box shadow value must be array' );
		$this->assertCount( 1, $result['value']['value'], 'Must have exactly 1 shadow' );
		
		// STRICT: Validate shadow structure
		$expected_shadows = [
			[
				'hOffset' => ['size' => 2.0, 'unit' => 'px'],
				'vOffset' => ['size' => 4.0, 'unit' => 'px'],
				'blur' => ['size' => 8.0, 'unit' => 'px'],
				'spread' => ['size' => 0.0, 'unit' => 'px'], // default
				'color' => '#000000',
				'position' => null, // not inset
			],
		];
		
		$this->assertBoxShadowPropertyStructure( $result, $expected_shadows, 'Simple box shadow' );
	}

	/**
	 * 300% STRICT: Box shadow with spread validation
	 * Must parse all four size values with exact precision
	 */
	public function test_box_shadow_with_spread_and_exact_precision(): void {
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', '2px 4px 8px 3px #ff0000' );
		
		$this->assertNotNull( $result, 'Must successfully map box shadow with spread' );
		
		$expected_shadows = [
			[
				'hOffset' => ['size' => 2.0, 'unit' => 'px'],
				'vOffset' => ['size' => 4.0, 'unit' => 'px'],
				'blur' => ['size' => 8.0, 'unit' => 'px'],
				'spread' => ['size' => 3.0, 'unit' => 'px'],
				'color' => '#ff0000',
				'position' => null,
			],
		];
		
		$this->assertBoxShadowPropertyStructure( $result, $expected_shadows, 'Box shadow with spread' );
	}

	/**
	 * 300% STRICT: Inset box shadow validation
	 * Must handle inset positioning with exact structure
	 */
	public function test_inset_box_shadow_with_exact_structure(): void {
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', 'inset 2px 4px 8px #000000' );
		
		$this->assertNotNull( $result, 'Must successfully map inset box shadow' );
		
		$expected_shadows = [
			[
				'hOffset' => ['size' => 2.0, 'unit' => 'px'],
				'vOffset' => ['size' => 4.0, 'unit' => 'px'],
				'blur' => ['size' => 8.0, 'unit' => 'px'],
				'spread' => ['size' => 0.0, 'unit' => 'px'],
				'color' => '#000000',
				'position' => 'inset', // inset positioning
			],
		];
		
		$this->assertBoxShadowPropertyStructure( $result, $expected_shadows, 'Inset box shadow' );
	}

	/**
	 * 300% STRICT: Multiple box shadows validation
	 * Must parse comma-separated shadows with exact structure
	 */
	public function test_multiple_box_shadows_with_exact_structure(): void {
		$input = '2px 4px 8px #000000, inset 1px 2px 4px 1px #ff0000';
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', $input );
		
		$this->assertNotNull( $result, 'Must successfully map multiple box shadows' );
		
		// STRICT: Must have exactly 2 shadows
		$this->assertCount( 2, $result['value']['value'], 'Must have exactly 2 shadows' );
		
		$expected_shadows = [
			[
				'hOffset' => ['size' => 2.0, 'unit' => 'px'],
				'vOffset' => ['size' => 4.0, 'unit' => 'px'],
				'blur' => ['size' => 8.0, 'unit' => 'px'],
				'spread' => ['size' => 0.0, 'unit' => 'px'],
				'color' => '#000000',
				'position' => null,
			],
			[
				'hOffset' => ['size' => 1.0, 'unit' => 'px'],
				'vOffset' => ['size' => 2.0, 'unit' => 'px'],
				'blur' => ['size' => 4.0, 'unit' => 'px'],
				'spread' => ['size' => 1.0, 'unit' => 'px'],
				'color' => '#ff0000',
				'position' => 'inset',
			],
		];
		
		$this->assertBoxShadowPropertyStructure( $result, $expected_shadows, 'Multiple box shadows' );
	}

	/**
	 * 300% STRICT: Mixed units validation
	 * Must handle different units with exact precision
	 */
	public function test_mixed_units_with_exact_precision(): void {
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', '1em 2rem 0.5em 1px #000000' );
		
		$this->assertNotNull( $result, 'Must handle mixed units' );
		
		$expected_shadows = [
			[
				'hOffset' => ['size' => 1.0, 'unit' => 'em'],
				'vOffset' => ['size' => 2.0, 'unit' => 'rem'],
				'blur' => ['size' => 0.5, 'unit' => 'em'],
				'spread' => ['size' => 1.0, 'unit' => 'px'],
				'color' => '#000000',
				'position' => null,
			],
		];
		
		$this->assertBoxShadowPropertyStructure( $result, $expected_shadows, 'Mixed units' );
	}

	/**
	 * 300% STRICT: Color variations validation
	 * Must handle different color formats with exact parsing
	 */
	public function test_color_variations_with_exact_parsing(): void {
		$color_tests = [
			'2px 4px 8px #ff0000' => '#ff0000', // hex
			'2px 4px 8px rgb(255, 0, 0)' => '#ff0000', // rgb converted to hex
			'2px 4px 8px red' => '#ff0000', // named color
			'2px 4px 8px transparent' => 'transparent', // transparent
		];
		
		foreach ( $color_tests as $input => $expected_color ) {
			$result = $this->mapper->map_to_v4_atomic( 'box-shadow', $input );
			
			$this->assertNotNull( $result, "Must handle color format: {$input}" );
			
			$shadow = $result['value']['value'][0];
			$this->assertSame( $expected_color, $shadow['value']['color']['value'], "Color must match for: {$input}" );
		}
	}

	/**
	 * 300% STRICT: Color position variations
	 * Must handle color at beginning or end of shadow definition
	 */
	public function test_color_position_variations_with_exact_parsing(): void {
		$position_tests = [
			'#ff0000 2px 4px 8px' => '#ff0000', // color first
			'2px 4px 8px #ff0000' => '#ff0000', // color last
			'inset #00ff00 1px 2px 4px' => '#00ff00', // inset + color first
			'inset 1px 2px 4px #00ff00' => '#00ff00', // inset + color last
		];
		
		foreach ( $position_tests as $input => $expected_color ) {
			$result = $this->mapper->map_to_v4_atomic( 'box-shadow', $input );
			
			$this->assertNotNull( $result, "Must handle color position: {$input}" );
			
			$shadow = $result['value']['value'][0];
			$this->assertSame( $expected_color, $shadow['value']['color']['value'], "Color must match for: {$input}" );
		}
	}

	/**
	 * 300% STRICT: None value validation
	 * Must handle 'none' value with empty array
	 */
	public function test_none_value_with_exact_structure(): void {
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', 'none' );
		
		$this->assertNotNull( $result, 'Must handle none value' );
		$this->assertSame( 'box-shadow', $result['value']['$$type'], 'Must be box-shadow type' );
		$this->assertIsArray( $result['value']['value'], 'Value must be array' );
		$this->assertEmpty( $result['value']['value'], 'None value must result in empty array' );
	}

	/**
	 * 300% STRICT: Invalid values rejection
	 * Must reject ALL invalid values with strict null
	 */
	public function test_rejects_all_invalid_values_with_strict_null(): void {
		$invalid_values = [
			// Missing required values
			'2px', // missing v-offset
			'2px 4px', // missing color (blur is optional)
			
			// Invalid syntax
			'2px invalid 8px #000000', // invalid v-offset
			'invalid 4px 8px #000000', // invalid h-offset
			'2px 4px invalid #000000', // invalid blur
			'2px 4px 8px invalid', // invalid color
			
			// Invalid units
			'2pxx 4px 8px #000000', // invalid unit
			'2px 4pxx 8px #000000', // invalid unit
			
			// Invalid structure
			'2px, 4px 8px #000000', // comma in wrong place
			'2px 4px 8px #000000;', // semicolon
			'2px 4px 8px #000000!important', // important
			
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
			['2px 4px 8px #000000'],
			(object) ['value' => '2px 4px 8px #000000'],
		];
		
		foreach ( $invalid_values as $invalid_value ) {
			$result = $this->mapper->map_to_v4_atomic( 'box-shadow', $invalid_value );
			$this->assertStrictNull( $result, "Must reject invalid value: " . var_export( $invalid_value, true ) );
		}
	}

	/**
	 * 300% STRICT: Complex multiple shadows with RGBA
	 * Must handle complex real-world shadow definitions
	 */
	public function test_complex_multiple_shadows_with_exact_structure(): void {
		$complex_input = '0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.2), 2px 2px 4px #333333';
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', $complex_input );
		
		$this->assertNotNull( $result, 'Must handle complex multiple shadows' );
		$this->assertCount( 3, $result['value']['value'], 'Must have exactly 3 shadows' );
		
		// STRICT: Validate each shadow has complete structure
		$shadows = $result['value']['value'];
		foreach ( $shadows as $i => $shadow ) {
			$this->assertIsArray( $shadow, "Shadow {$i} must be array" );
			$this->assertSame( 'shadow', $shadow['$$type'], "Shadow {$i} must be shadow type" );
			$this->assertIsArray( $shadow['value'], "Shadow {$i} value must be array" );
			
			$shadow_value = $shadow['value'];
			$required_fields = ['hOffset', 'vOffset', 'blur', 'spread', 'color', 'position'];
			
			foreach ( $required_fields as $field ) {
				$this->assertArrayHasKey( $field, $shadow_value, "Shadow {$i} missing field: {$field}" );
			}
			
			$this->assertCount( 6, $shadow_value, "Shadow {$i} must have exactly 6 fields" );
		}
	}

	/**
	 * 300% STRICT: Negative values validation
	 * Must handle negative offsets correctly
	 */
	public function test_negative_values_with_exact_precision(): void {
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', '-2px -4px 8px #000000' );
		
		$this->assertNotNull( $result, 'Must handle negative values' );
		
		$expected_shadows = [
			[
				'hOffset' => ['size' => -2.0, 'unit' => 'px'],
				'vOffset' => ['size' => -4.0, 'unit' => 'px'],
				'blur' => ['size' => 8.0, 'unit' => 'px'],
				'spread' => ['size' => 0.0, 'unit' => 'px'],
				'color' => '#000000',
				'position' => null,
			],
		];
		
		$this->assertBoxShadowPropertyStructure( $result, $expected_shadows, 'Negative values' );
	}

	/**
	 * 300% STRICT: Zero values validation
	 * Must handle zero values with exact precision
	 */
	public function test_zero_values_with_exact_precision(): void {
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', '0 0 0 0 #000000' );
		
		$this->assertNotNull( $result, 'Must handle zero values' );
		
		$expected_shadows = [
			[
				'hOffset' => ['size' => 0.0, 'unit' => 'px'],
				'vOffset' => ['size' => 0.0, 'unit' => 'px'],
				'blur' => ['size' => 0.0, 'unit' => 'px'],
				'spread' => ['size' => 0.0, 'unit' => 'px'],
				'color' => '#000000',
				'position' => null,
			],
		];
		
		$this->assertBoxShadowPropertyStructure( $result, $expected_shadows, 'Zero values' );
	}

	/**
	 * 300% STRICT: Atomic widget integration
	 * Must support correct atomic widgets with strict validation
	 */
	public function test_atomic_widget_integration_with_strict_validation(): void {
		$supported_widgets = $this->mapper->get_supported_atomic_widgets();
		
		$this->assertIsArray( $supported_widgets, 'Supported widgets must be array' );
		$this->assertNotEmpty( $supported_widgets, 'Supported widgets cannot be empty' );
		
		// STRICT: Must contain expected widgets for box-shadow
		$expected_widgets = ['e-container', 'e-flexbox', 'e-heading', 'e-paragraph', 'e-button'];
		foreach ( $expected_widgets as $expected_widget ) {
			$this->assertContains( $expected_widget, $supported_widgets, "Must support widget: {$expected_widget}" );
		}
		
		foreach ( $supported_widgets as $widget ) {
			$this->assertValidAtomicWidget( $widget );
		}
	}

	/**
	 * 300% STRICT: Prop type integration
	 * Must require Box_Shadow_Prop_Type with strict validation
	 */
	public function test_prop_type_integration_with_strict_validation(): void {
		$required_prop_types = $this->mapper->get_required_prop_types();
		
		$this->assertIsArray( $required_prop_types, 'Required prop types must be array' );
		$this->assertNotEmpty( $required_prop_types, 'Required prop types cannot be empty' );
		$this->assertContains( 'Box_Shadow_Prop_Type', $required_prop_types, 'Must require Box_Shadow_Prop_Type' );
		
		foreach ( $required_prop_types as $prop_type ) {
			$this->assertValidPropType( $prop_type );
		}
	}

	/**
	 * 300% STRICT: Supported properties validation
	 * Must support exactly box-shadow
	 */
	public function test_supported_properties_with_exact_list(): void {
		$supported = $this->mapper->get_supported_properties();
		
		$this->assertIsArray( $supported, 'Supported properties must be array' );
		$this->assertNotEmpty( $supported, 'Supported properties cannot be empty' );
		$this->assertContains( 'box-shadow', $supported, 'Must support box-shadow' );
		$this->assertCount( 1, $supported, 'Must support exactly 1 property' );
		$this->assertSame( ['box-shadow'], $supported, 'Must support only box-shadow' );
	}
}
