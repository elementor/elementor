<?php
namespace Elementor\Tests\Phpunit\Modules\CssConverter\Convertors\CssPropertiesV2;

use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * 300% STRICT Base Test Case for CSS Properties V2
 * 
 * This test case enforces extremely strict validation to catch ANY possible bugs
 * in property mappers. Every assertion is designed to fail if there's even the
 * slightest deviation from expected atomic widget structures.
 */
class PropertyMapperV2TestCase extends TestCase {

	protected function setUp(): void {
		parent::setUp();
	}

	protected function tearDown(): void {
		parent::tearDown();
	}

	/**
	 * 300% STRICT: Atomic property structure validation
	 * Validates EVERY aspect of the atomic property structure with zero tolerance
	 */
	protected function assertAtomicPropertyStructure( array $expected, array $actual, string $message = '' ): void {
		// STRICT: Must be exact array structure
		$this->assertIsArray( $actual, $message . ' - Result must be array.' );
		$this->assertNotEmpty( $actual, $message . ' - Result cannot be empty.' );
		
		// STRICT: Must have exactly these keys and no others
		$this->assertArrayHasKey( 'property', $actual, $message . ' - Missing required property key.' );
		$this->assertArrayHasKey( 'value', $actual, $message . ' - Missing required value key.' );
		$this->assertCount( 2, $actual, $message . ' - Must have exactly 2 keys: property and value.' );
		
		// STRICT: Property must be exact string match
		$this->assertIsString( $actual['property'], $message . ' - Property must be string.' );
		$this->assertNotEmpty( $actual['property'], $message . ' - Property cannot be empty.' );
		$this->assertSame( $expected['property'], $actual['property'], $message . ' - Property must match exactly.' );
		
		// STRICT: Value must have exact atomic structure
		$this->assertIsArray( $actual['value'], $message . ' - Value must be array.' );
		$this->assertArrayHasKey( '$$type', $actual['value'], $message . ' - Missing required $$type in value.' );
		$this->assertArrayHasKey( 'value', $actual['value'], $message . ' - Missing required value in value structure.' );
		$this->assertCount( 2, $actual['value'], $message . ' - Value must have exactly 2 keys: $$type and value.' );
		
		// STRICT: $$type must be exact string match
		$this->assertIsString( $actual['value']['$$type'], $message . ' - $$type must be string.' );
		$this->assertNotEmpty( $actual['value']['$$type'], $message . ' - $$type cannot be empty.' );
		$this->assertSame( $expected['value']['$$type'], $actual['value']['$$type'], $message . ' - $$type must match exactly.' );
		
		// STRICT: Value content must match exactly
		$this->assertEquals( $expected['value']['value'], $actual['value']['value'], $message . ' - Value content must match exactly.' );
	}

	/**
	 * 300% STRICT: Size property structure validation
	 * Validates Size_Prop_Type with extreme precision
	 */
	protected function assertSizePropertyStructure( array $actual, float $expected_size, string $expected_unit, string $message = '' ): void {
		$this->assertIsArray( $actual, $message . ' - Size property must be array.' );
		$this->assertArrayHasKey( 'value', $actual, $message . ' - Missing value key.' );
		$this->assertIsArray( $actual['value'], $message . ' - Value must be array.' );
		
		// STRICT: $$type validation
		$this->assertArrayHasKey( '$$type', $actual['value'], $message . ' - Missing $$type.' );
		$this->assertIsString( $actual['value']['$$type'], $message . ' - $$type must be string.' );
		$this->assertSame( 'size', $actual['value']['$$type'], $message . ' - Expected exact size type.' );
		
		// STRICT: Value structure validation
		$this->assertArrayHasKey( 'value', $actual['value'], $message . ' - Missing value in atomic structure.' );
		$this->assertIsArray( $actual['value']['value'], $message . ' - Size value must be array.' );
		
		$size_value = $actual['value']['value'];
		
		// STRICT: Size field validation
		$this->assertArrayHasKey( 'size', $size_value, $message . ' - Missing size field.' );
		$this->assertArrayHasKey( 'unit', $size_value, $message . ' - Missing unit field.' );
		$this->assertCount( 2, $size_value, $message . ' - Size value must have exactly 2 fields: size and unit.' );
		
		// STRICT: Size must be numeric (not string!)
		$this->assertIsNumeric( $size_value['size'], $message . ' - Size must be numeric.' );
		$this->assertTrue( 
			is_float( $size_value['size'] ) || is_int( $size_value['size'] ), 
			$message . ' - Size must be float or int.' 
		);
		$this->assertSame( $expected_size, (float) $size_value['size'], $message . ' - Size value must match exactly.' );
		
		// STRICT: Unit must be exact string
		$this->assertIsString( $size_value['unit'], $message . ' - Unit must be string.' );
		$this->assertSame( $expected_unit, $size_value['unit'], $message . ' - Unit must match exactly.' );
	}

	/**
	 * 300% STRICT: Color property structure validation
	 * Validates Color_Prop_Type with zero tolerance
	 */
	protected function assertColorPropertyStructure( array $actual, string $expected_color, string $message = '' ): void {
		$this->assertIsArray( $actual, $message . ' - Color property must be array.' );
		$this->assertArrayHasKey( 'value', $actual, $message . ' - Missing value key.' );
		$this->assertIsArray( $actual['value'], $message . ' - Value must be array.' );
		
		// STRICT: $$type validation
		$this->assertArrayHasKey( '$$type', $actual['value'], $message . ' - Missing $$type.' );
		$this->assertIsString( $actual['value']['$$type'], $message . ' - $$type must be string.' );
		$this->assertSame( 'color', $actual['value']['$$type'], $message . ' - Expected exact color type.' );
		
		// STRICT: Color value validation
		$this->assertArrayHasKey( 'value', $actual['value'], $message . ' - Missing color value.' );
		$this->assertIsString( $actual['value']['value'], $message . ' - Color value must be string.' );
		$this->assertSame( $expected_color, $actual['value']['value'], $message . ' - Color must match exactly.' );
		$this->assertCount( 2, $actual['value'], $message . ' - Color structure must have exactly 2 fields.' );
	}

	/**
	 * 300% STRICT: String property structure validation
	 * Validates String_Prop_Type with extreme precision
	 */
	protected function assertStringPropertyStructure( array $actual, string $expected_value, string $message = '' ): void {
		$this->assertIsArray( $actual, $message . ' - String property must be array.' );
		$this->assertArrayHasKey( 'value', $actual, $message . ' - Missing value key.' );
		$this->assertIsArray( $actual['value'], $message . ' - Value must be array.' );
		
		// STRICT: $$type validation
		$this->assertArrayHasKey( '$$type', $actual['value'], $message . ' - Missing $$type.' );
		$this->assertIsString( $actual['value']['$$type'], $message . ' - $$type must be string.' );
		$this->assertSame( 'string', $actual['value']['$$type'], $message . ' - Expected exact string type.' );
		
		// STRICT: String value validation
		$this->assertArrayHasKey( 'value', $actual['value'], $message . ' - Missing string value.' );
		$this->assertIsString( $actual['value']['value'], $message . ' - String value must be string.' );
		$this->assertSame( $expected_value, $actual['value']['value'], $message . ' - String must match exactly.' );
		$this->assertCount( 2, $actual['value'], $message . ' - String structure must have exactly 2 fields.' );
	}

	/**
	 * 300% STRICT: Dimensions property structure validation
	 * Validates Dimensions_Prop_Type with complete logical property validation
	 */
	protected function assertDimensionsPropertyStructure( array $actual, array $expected_dimensions, string $message = '' ): void {
		$this->assertIsArray( $actual, $message . ' - Dimensions property must be array.' );
		$this->assertArrayHasKey( 'value', $actual, $message . ' - Missing value key.' );
		$this->assertIsArray( $actual['value'], $message . ' - Value must be array.' );
		
		// STRICT: $$type validation
		$this->assertArrayHasKey( '$$type', $actual['value'], $message . ' - Missing $$type.' );
		$this->assertIsString( $actual['value']['$$type'], $message . ' - $$type must be string.' );
		$this->assertSame( 'dimensions', $actual['value']['$$type'], $message . ' - Expected exact dimensions type.' );
		
		// STRICT: Dimensions value validation
		$this->assertArrayHasKey( 'value', $actual['value'], $message . ' - Missing dimensions value.' );
		$this->assertIsArray( $actual['value']['value'], $message . ' - Dimensions value must be array.' );
		
		$dimensions = $actual['value']['value'];
		
		// STRICT: Must have exactly these logical properties
		$required_directions = ['block-start', 'inline-end', 'block-end', 'inline-start'];
		foreach ( $required_directions as $direction ) {
			$this->assertArrayHasKey( $direction, $dimensions, $message . " - Missing required direction: {$direction}." );
		}
		$this->assertCount( 4, $dimensions, $message . ' - Must have exactly 4 logical directions.' );
		
		// STRICT: Each direction must be a Size_Prop_Type
		foreach ( $required_directions as $direction ) {
			$this->assertIsArray( $dimensions[$direction], $message . " - {$direction} must be array." );
			$this->assertArrayHasKey( '$$type', $dimensions[$direction], $message . " - Missing $$type in {$direction}." );
			$this->assertSame( 'size', $dimensions[$direction]['$$type'], $message . " - {$direction} must be size type." );
			$this->assertArrayHasKey( 'value', $dimensions[$direction], $message . " - Missing value in {$direction}." );
			$this->assertCount( 2, $dimensions[$direction], $message . " - {$direction} must have exactly 2 fields." );
			
			// STRICT: Validate the size structure
			$expected_size = $expected_dimensions[$direction];
			$this->assertSame( $expected_size, $dimensions[$direction]['value'], $message . " - {$direction} size must match exactly." );
		}
	}

	/**
	 * 300% STRICT: Border radius property structure validation
	 * Validates Border_Radius_Prop_Type with logical corner properties
	 */
	protected function assertBorderRadiusPropertyStructure( array $actual, array $expected_corners, string $message = '' ): void {
		$this->assertIsArray( $actual, $message . ' - Border radius property must be array.' );
		$this->assertArrayHasKey( 'value', $actual, $message . ' - Missing value key.' );
		$this->assertIsArray( $actual['value'], $message . ' - Value must be array.' );
		
		// STRICT: $$type validation
		$this->assertArrayHasKey( '$$type', $actual['value'], $message . ' - Missing $$type.' );
		$this->assertIsString( $actual['value']['$$type'], $message . ' - $$type must be string.' );
		$this->assertSame( 'border-radius', $actual['value']['$$type'], $message . ' - Expected exact border-radius type.' );
		
		// STRICT: Border radius value validation
		$this->assertArrayHasKey( 'value', $actual['value'], $message . ' - Missing border radius value.' );
		$this->assertIsArray( $actual['value']['value'], $message . ' - Border radius value must be array.' );
		
		$corners = $actual['value']['value'];
		
		// STRICT: Must have exactly these logical corner properties
		$required_corners = ['start-start', 'start-end', 'end-start', 'end-end'];
		foreach ( $required_corners as $corner ) {
			$this->assertArrayHasKey( $corner, $corners, $message . " - Missing required corner: {$corner}." );
		}
		$this->assertCount( 4, $corners, $message . ' - Must have exactly 4 logical corners.' );
		
		// STRICT: Each corner must be a Size_Prop_Type
		foreach ( $required_corners as $corner ) {
			$this->assertIsArray( $corners[$corner], $message . " - {$corner} must be array." );
			$this->assertArrayHasKey( '$$type', $corners[$corner], $message . " - Missing $$type in {$corner}." );
			$this->assertSame( 'size', $corners[$corner]['$$type'], $message . " - {$corner} must be size type." );
			$this->assertArrayHasKey( 'value', $corners[$corner], $message . " - Missing value in {$corner}." );
			$this->assertCount( 2, $corners[$corner], $message . " - {$corner} must have exactly 2 fields." );
			
			// STRICT: Validate the size structure
			$expected_size = $expected_corners[$corner];
			$this->assertSame( $expected_size, $corners[$corner]['value'], $message . " - {$corner} size must match exactly." );
		}
	}

	/**
	 * 300% STRICT: Box shadow property structure validation
	 * Validates Box_Shadow_Prop_Type with complete Shadow_Prop_Type validation
	 */
	protected function assertBoxShadowPropertyStructure( array $actual, array $expected_shadows, string $message = '' ): void {
		$this->assertIsArray( $actual, $message . ' - Box shadow property must be array.' );
		$this->assertArrayHasKey( 'value', $actual, $message . ' - Missing value key.' );
		$this->assertIsArray( $actual['value'], $message . ' - Value must be array.' );
		
		// STRICT: $$type validation
		$this->assertArrayHasKey( '$$type', $actual['value'], $message . ' - Missing $$type.' );
		$this->assertIsString( $actual['value']['$$type'], $message . ' - $$type must be string.' );
		$this->assertSame( 'box-shadow', $actual['value']['$$type'], $message . ' - Expected exact box-shadow type.' );
		
		// STRICT: Box shadow value validation (array of shadows)
		$this->assertArrayHasKey( 'value', $actual['value'], $message . ' - Missing box shadow value.' );
		$this->assertIsArray( $actual['value']['value'], $message . ' - Box shadow value must be array.' );
		
		$shadows = $actual['value']['value'];
		$this->assertCount( count( $expected_shadows ), $shadows, $message . ' - Shadow count must match exactly.' );
		
		// STRICT: Each shadow must be a Shadow_Prop_Type
		foreach ( $shadows as $i => $shadow ) {
			$expected_shadow = $expected_shadows[$i];
			$shadow_message = $message . " - Shadow {$i}";
			
			$this->assertIsArray( $shadow, $shadow_message . ' must be array.' );
			$this->assertArrayHasKey( '$$type', $shadow, $shadow_message . ' - Missing $$type.' );
			$this->assertSame( 'shadow', $shadow['$$type'], $shadow_message . ' - Must be shadow type.' );
			$this->assertArrayHasKey( 'value', $shadow, $shadow_message . ' - Missing value.' );
			$this->assertCount( 2, $shadow, $shadow_message . ' - Must have exactly 2 fields.' );
			
			$shadow_value = $shadow['value'];
			$this->assertIsArray( $shadow_value, $shadow_message . ' - Value must be array.' );
			
			// STRICT: All shadow fields must be present and correct
			$required_fields = ['hOffset', 'vOffset', 'blur', 'spread', 'color', 'position'];
			foreach ( $required_fields as $field ) {
				$this->assertArrayHasKey( $field, $shadow_value, $shadow_message . " - Missing {$field}." );
			}
			$this->assertCount( 6, $shadow_value, $shadow_message . ' - Must have exactly 6 fields.' );
			
			// STRICT: Size fields validation
			$size_fields = ['hOffset', 'vOffset', 'blur', 'spread'];
			foreach ( $size_fields as $field ) {
				$this->assertIsArray( $shadow_value[$field], $shadow_message . " - {$field} must be array." );
				$this->assertSame( 'size', $shadow_value[$field]['$$type'], $shadow_message . " - {$field} must be size type." );
				$this->assertArrayHasKey( 'value', $shadow_value[$field], $shadow_message . " - Missing value in {$field}." );
				$this->assertSame( $expected_shadow[$field], $shadow_value[$field]['value'], $shadow_message . " - {$field} must match exactly." );
			}
			
			// STRICT: Color field validation
			$this->assertIsArray( $shadow_value['color'], $shadow_message . ' - Color must be array.' );
			$this->assertSame( 'color', $shadow_value['color']['$$type'], $shadow_message . ' - Color must be color type.' );
			$this->assertSame( $expected_shadow['color'], $shadow_value['color']['value'], $shadow_message . ' - Color must match exactly.' );
			
			// STRICT: Position field validation
			if ( null === $expected_shadow['position'] ) {
				$this->assertNull( $shadow_value['position'], $shadow_message . ' - Position must be null.' );
			} else {
				$this->assertSame( $expected_shadow['position'], $shadow_value['position'], $shadow_message . ' - Position must match exactly.' );
			}
		}
	}

	/**
	 * 300% STRICT: Atomic widget validation
	 * Validates that widget names are exactly correct
	 */
	protected function assertValidAtomicWidget( string $widget_name ): void {
		$valid_widgets = [
			'e-heading',
			'e-paragraph', 
			'e-button',
			'e-flexbox',
			'e-container',
			'e-image',
		];
		
		$this->assertIsString( $widget_name, 'Widget name must be string.' );
		$this->assertNotEmpty( $widget_name, 'Widget name cannot be empty.' );
		$this->assertContains( $widget_name, $valid_widgets, "Widget '{$widget_name}' is not a valid atomic widget." );
	}

	/**
	 * 300% STRICT: Prop type validation
	 * Validates that prop type names are exactly correct
	 */
	protected function assertValidPropType( string $prop_type ): void {
		$valid_prop_types = [
			'String_Prop_Type',
			'Size_Prop_Type',
			'Color_Prop_Type',
			'Dimensions_Prop_Type',
			'Background_Prop_Type',
			'Border_Radius_Prop_Type',
			'Box_Shadow_Prop_Type',
			'Number_Prop_Type',
		];
		
		$this->assertIsString( $prop_type, 'Prop type must be string.' );
		$this->assertNotEmpty( $prop_type, 'Prop type cannot be empty.' );
		$this->assertContains( $prop_type, $valid_prop_types, "Prop type '{$prop_type}' is not a valid atomic widget prop type." );
	}

	/**
	 * 300% STRICT: Null result validation
	 * Ensures null results are truly null (not false, empty array, etc.)
	 */
	protected function assertStrictNull( $actual, string $message = '' ): void {
		$this->assertNull( $actual, $message . ' - Must be exactly null.' );
		$this->assertNotSame( false, $actual, $message . ' - Must not be false.' );
		$this->assertNotSame( 0, $actual, $message . ' - Must not be zero.' );
		$this->assertNotSame( '', $actual, $message . ' - Must not be empty string.' );
		$this->assertNotSame( [], $actual, $message . ' - Must not be empty array.' );
	}

	/**
	 * 300% STRICT: Property mapper interface validation
	 * Validates that all required methods exist and return correct types
	 */
	protected function assertValidPropertyMapperInterface( $mapper ): void {
		$this->assertIsObject( $mapper, 'Mapper must be object.' );
		
		// STRICT: All required methods must exist
		$required_methods = [
			'supports_property',
			'map_to_v4_atomic',
			'map_to_schema',
			'validate_atomic_output',
			'get_supported_atomic_widgets',
			'get_required_prop_types',
			'get_supported_properties',
		];
		
		foreach ( $required_methods as $method ) {
			$this->assertTrue( method_exists( $mapper, $method ), "Missing required method: {$method}" );
		}
		
		// STRICT: Method return type validation
		$this->assertIsArray( $mapper->get_supported_atomic_widgets(), 'get_supported_atomic_widgets must return array.' );
		$this->assertIsArray( $mapper->get_required_prop_types(), 'get_required_prop_types must return array.' );
		$this->assertIsArray( $mapper->get_supported_properties(), 'get_supported_properties must return array.' );
		
		// STRICT: Arrays must not be empty
		$this->assertNotEmpty( $mapper->get_supported_atomic_widgets(), 'Supported atomic widgets cannot be empty.' );
		$this->assertNotEmpty( $mapper->get_required_prop_types(), 'Required prop types cannot be empty.' );
		$this->assertNotEmpty( $mapper->get_supported_properties(), 'Supported properties cannot be empty.' );
	}
}
