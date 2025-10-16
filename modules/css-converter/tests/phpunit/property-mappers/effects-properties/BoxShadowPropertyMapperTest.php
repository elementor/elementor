<?php

namespace Elementor\Tests\PhpUnit\PropertyMappers\EffectsProperties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Box_Shadow_Property_Mapper;
use PHPUnit\Framework\TestCase;

class BoxShadowPropertyMapperTest extends TestCase {

	private Box_Shadow_Property_Mapper $mapper;

	protected function setUp(): void {
		$this->mapper = new Box_Shadow_Property_Mapper();
	}

	public function it_supports_box_shadow_property(): void {
		$this->assertTrue( $this->mapper->is_supported_property( 'box-shadow' ) );
	}

	public function it_correctly_identifies_supported_properties(): void {
		$this->assertTrue( $this->mapper->is_supported_property( 'box-shadow' ) );
		$this->assertFalse( $this->mapper->is_supported_property( 'text-shadow' ) );
		$this->assertFalse( $this->mapper->is_supported_property( 'filter' ) );
		$this->assertFalse( $this->mapper->is_supported_property( 'background' ) );
	}

	public function it_handles_simple_box_shadow(): void {
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', '2px 4px 8px rgba(0, 0, 0, 0.3)' );

		$this->assertUniversalMapperCompliance( $result, 'box-shadow' );
		$this->assertValidBoxShadowPropType( $result );

		$shadow = $result['value']['value'][0];
		$this->assertEquals( 'shadow', $shadow['$$type'] );
		$this->assertEquals( 2.0, $shadow['value']['hOffset']['value']['size'] );
		$this->assertEquals( 'px', $shadow['value']['hOffset']['value']['unit'] );
		$this->assertEquals( 4.0, $shadow['value']['vOffset']['value']['size'] );
		$this->assertEquals( 'px', $shadow['value']['vOffset']['value']['unit'] );
		$this->assertEquals( 8.0, $shadow['value']['blur']['value']['size'] );
		$this->assertEquals( 'px', $shadow['value']['blur']['value']['unit'] );
		$this->assertEquals( 0.0, $shadow['value']['spread']['value']['size'] );
		$this->assertEquals( 'px', $shadow['value']['spread']['value']['unit'] );
		$this->assertEquals( 'rgba(0, 0, 0, 0.3)', $shadow['value']['color']['value'] );
		$this->assertNull( $shadow['value']['position'] );
	}

	public function it_handles_box_shadow_with_spread(): void {
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', '1px 2px 3px 4px #ff0000' );

		$this->assertUniversalMapperCompliance( $result, 'box-shadow' );
		$this->assertValidBoxShadowPropType( $result );

		$shadow = $result['value']['value'][0];
		$this->assertEquals( 1.0, $shadow['value']['hOffset']['value']['size'] );
		$this->assertEquals( 2.0, $shadow['value']['vOffset']['value']['size'] );
		$this->assertEquals( 3.0, $shadow['value']['blur']['value']['size'] );
		$this->assertEquals( 4.0, $shadow['value']['spread']['value']['size'] );
		$this->assertEquals( '#ff0000', $shadow['value']['color']['value'] );
		$this->assertNull( $shadow['value']['position'] );
	}

	public function it_handles_inset_box_shadow(): void {
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', 'inset 2px 4px 6px rgba(0, 0, 0, 0.5)' );

		$this->assertUniversalMapperCompliance( $result, 'box-shadow' );
		$this->assertValidBoxShadowPropType( $result );

		$shadow = $result['value']['value'][0];
		$this->assertEquals( 2.0, $shadow['value']['hOffset']['value']['size'] );
		$this->assertEquals( 4.0, $shadow['value']['vOffset']['value']['size'] );
		$this->assertEquals( 6.0, $shadow['value']['blur']['value']['size'] );
		$this->assertEquals( 0.0, $shadow['value']['spread']['value']['size'] );
		$this->assertEquals( 'rgba(0, 0, 0, 0.5)', $shadow['value']['color']['value'] );
		$this->assertEquals( 'inset', $shadow['value']['position'] );
	}

	public function it_handles_multiple_box_shadows(): void {
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', '2px 4px 8px rgba(0, 0, 0, 0.3), inset 1px 2px 4px #ff0000' );

		$this->assertUniversalMapperCompliance( $result, 'box-shadow' );
		$this->assertValidBoxShadowPropType( $result );

		$this->assertCount( 2, $result['value']['value'] );

		$first_shadow = $result['value']['value'][0];
		$this->assertEquals( 2.0, $first_shadow['value']['hOffset']['value']['size'] );
		$this->assertEquals( 4.0, $first_shadow['value']['vOffset']['value']['size'] );
		$this->assertEquals( 8.0, $first_shadow['value']['blur']['value']['size'] );
		$this->assertEquals( 'rgba(0, 0, 0, 0.3)', $first_shadow['value']['color']['value'] );
		$this->assertNull( $first_shadow['value']['position'] );

		$second_shadow = $result['value']['value'][1];
		$this->assertEquals( 1.0, $second_shadow['value']['hOffset']['value']['size'] );
		$this->assertEquals( 2.0, $second_shadow['value']['vOffset']['value']['size'] );
		$this->assertEquals( 4.0, $second_shadow['value']['blur']['value']['size'] );
		$this->assertEquals( '#ff0000', $second_shadow['value']['color']['value'] );
		$this->assertEquals( 'inset', $second_shadow['value']['position'] );
	}

	public function it_handles_box_shadow_with_mixed_units(): void {
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', '1em 2rem 0.5vh 10% rgba(255, 0, 0, 0.8)' );

		$this->assertUniversalMapperCompliance( $result, 'box-shadow' );
		$this->assertValidBoxShadowPropType( $result );

		$shadow = $result['value']['value'][0];
		$this->assertEquals( 1.0, $shadow['value']['hOffset']['value']['size'] );
		$this->assertEquals( 'em', $shadow['value']['hOffset']['value']['unit'] );
		$this->assertEquals( 2.0, $shadow['value']['vOffset']['value']['size'] );
		$this->assertEquals( 'rem', $shadow['value']['vOffset']['value']['unit'] );
		$this->assertEquals( 0.5, $shadow['value']['blur']['value']['size'] );
		$this->assertEquals( 'vh', $shadow['value']['blur']['value']['unit'] );
		$this->assertEquals( 10.0, $shadow['value']['spread']['value']['size'] );
		$this->assertEquals( '%', $shadow['value']['spread']['value']['unit'] );
		$this->assertEquals( 'rgba(255, 0, 0, 0.8)', $shadow['value']['color']['value'] );
	}

	public function it_handles_box_shadow_with_negative_values(): void {
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', '-2px -4px 6px 2px #000000' );

		$this->assertUniversalMapperCompliance( $result, 'box-shadow' );
		$this->assertValidBoxShadowPropType( $result );

		$shadow = $result['value']['value'][0];
		$this->assertEquals( -2.0, $shadow['value']['hOffset']['value']['size'] );
		$this->assertEquals( -4.0, $shadow['value']['vOffset']['value']['size'] );
		$this->assertEquals( 6.0, $shadow['value']['blur']['value']['size'] );
		$this->assertEquals( 2.0, $shadow['value']['spread']['value']['size'] );
		$this->assertEquals( '#000000', $shadow['value']['color']['value'] );
	}

	public function it_handles_box_shadow_with_zero_values(): void {
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', '0 0 10px rgba(0, 0, 0, 0.5)' );

		$this->assertUniversalMapperCompliance( $result, 'box-shadow' );
		$this->assertValidBoxShadowPropType( $result );

		$shadow = $result['value']['value'][0];
		$this->assertEquals( 0.0, $shadow['value']['hOffset']['value']['size'] );
		$this->assertEquals( 0.0, $shadow['value']['vOffset']['value']['size'] );
		$this->assertEquals( 10.0, $shadow['value']['blur']['value']['size'] );
		$this->assertEquals( 0.0, $shadow['value']['spread']['value']['size'] );
	}

	public function it_handles_box_shadow_with_named_colors(): void {
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', '2px 4px 8px red' );

		$this->assertUniversalMapperCompliance( $result, 'box-shadow' );
		$this->assertValidBoxShadowPropType( $result );

		$shadow = $result['value']['value'][0];
		$this->assertEquals( 'red', $shadow['value']['color']['value'] );
	}

	public function it_handles_box_shadow_without_color(): void {
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', '2px 4px 8px' );

		$this->assertUniversalMapperCompliance( $result, 'box-shadow' );
		$this->assertValidBoxShadowPropType( $result );

		$shadow = $result['value']['value'][0];
		$this->assertEquals( 'rgba(0, 0, 0, 0.5)', $shadow['value']['color']['value'] );
	}

	public function it_handles_box_shadow_none(): void {
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', 'none' );

		$this->assertUniversalMapperCompliance( $result, 'box-shadow' );
		$this->assertValidBoxShadowPropType( $result );
		$this->assertEmpty( $result['value']['value'] );
	}

	public function it_handles_complex_multiple_shadows_with_rgba(): void {
		$complex_shadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', $complex_shadow );

		$this->assertUniversalMapperCompliance( $result, 'box-shadow' );
		$this->assertValidBoxShadowPropType( $result );
		$this->assertCount( 3, $result['value']['value'] );

		$first_shadow = $result['value']['value'][0];
		$this->assertEquals( 0.0, $first_shadow['value']['hOffset']['value']['size'] );
		$this->assertEquals( 4.0, $first_shadow['value']['vOffset']['value']['size'] );
		$this->assertEquals( 6.0, $first_shadow['value']['blur']['value']['size'] );
		$this->assertEquals( -1.0, $first_shadow['value']['spread']['value']['size'] );
		$this->assertEquals( 'rgba(0, 0, 0, 0.1)', $first_shadow['value']['color']['value'] );
		$this->assertNull( $first_shadow['value']['position'] );

		$third_shadow = $result['value']['value'][2];
		$this->assertEquals( 'inset', $third_shadow['value']['position'] );
		$this->assertEquals( 'rgba(255, 255, 255, 0.1)', $third_shadow['value']['color']['value'] );
	}

	public function it_rejects_invalid_box_shadow_values(): void {
		$invalid_values = [
			null,
			'',
			'invalid',
			'2px',
			'rgba(0, 0, 0, 0.5)',
			'2px invalid 4px',
			'2px 4px invalid rgba(0, 0, 0, 0.5)',
		];

		foreach ( $invalid_values as $invalid_value ) {
			$result = $this->mapper->map_to_v4_atomic( 'box-shadow', $invalid_value );
			$this->assertNull( $result, "Should reject invalid value: " . var_export( $invalid_value, true ) );
		}
	}

	public function it_rejects_unsupported_properties(): void {
		$unsupported_properties = [
			'text-shadow',
			'filter',
			'backdrop-filter',
			'drop-shadow',
			'shadow',
		];

		foreach ( $unsupported_properties as $property ) {
			$result = $this->mapper->map_to_v4_atomic( $property, '2px 4px 8px rgba(0, 0, 0, 0.3)' );
			$this->assertNull( $result, "Should reject unsupported property: {$property}" );
		}
	}

	private function assertUniversalMapperCompliance( $result, string $expected_property ): void {
		$this->assertIsArray( $result, 'Result should be an array' );
		$this->assertArrayHasKey( 'property', $result, 'Result should have property key' );
		$this->assertArrayHasKey( 'value', $result, 'Result should have value key' );
		$this->assertEquals( $expected_property, $result['property'], 'Property should match expected' );
		$this->assertIsArray( $result['value'], 'Value should be an array' );
		$this->assertArrayHasKey( '$$type', $result['value'], 'Value should have $$type' );
		$this->assertArrayHasKey( 'value', $result['value'], 'Value should have nested value' );
	}

	private function assertValidBoxShadowPropType( array $result ): void {
		$this->assertEquals( 'box-shadow', $result['value']['$$type'], 'Should have box-shadow type' );
		$this->assertIsArray( $result['value']['value'], 'Box shadow value should be array' );

		foreach ( $result['value']['value'] as $shadow ) {
			$this->assertValidShadowPropType( $shadow );
		}
	}

	private function assertValidShadowPropType( array $shadow ): void {
		$this->assertEquals( 'shadow', $shadow['$$type'], 'Shadow should have shadow type' );
		$this->assertIsArray( $shadow['value'], 'Shadow value should be array' );

		$required_fields = [ 'hOffset', 'vOffset', 'blur', 'spread', 'color' ];
		foreach ( $required_fields as $field ) {
			$this->assertArrayHasKey( $field, $shadow['value'], "Shadow should have {$field} field" );
		}

		$this->assertValidSizePropType( $shadow['value']['hOffset'] );
		$this->assertValidSizePropType( $shadow['value']['vOffset'] );
		$this->assertValidSizePropType( $shadow['value']['blur'] );
		$this->assertValidSizePropType( $shadow['value']['spread'] );
		$this->assertValidColorPropType( $shadow['value']['color'] );

		if ( isset( $shadow['value']['position'] ) ) {
			$this->assertContains( $shadow['value']['position'], [ null, 'inset' ], 'Position should be null or inset' );
		}
	}

	private function assertValidSizePropType( array $size ): void {
		$this->assertEquals( 'size', $size['$$type'], 'Should have size type' );
		$this->assertIsArray( $size['value'], 'Size value should be array' );
		$this->assertArrayHasKey( 'size', $size['value'], 'Size should have size field' );
		$this->assertArrayHasKey( 'unit', $size['value'], 'Size should have unit field' );
		$this->assertIsNumeric( $size['value']['size'], 'Size should be numeric' );
		$this->assertIsString( $size['value']['unit'], 'Unit should be string' );

		$valid_units = [ 'px', 'em', 'rem', '%', 'vw', 'vh' ];
		$this->assertContains( $size['value']['unit'], $valid_units, 'Unit should be valid box-shadow unit' );
	}

	private function assertValidColorPropType( array $color ): void {
		$this->assertEquals( 'color', $color['$$type'], 'Should have color type' );
		$this->assertIsString( $color['value'], 'Color value should be string' );
		$this->assertNotEmpty( $color['value'], 'Color value should not be empty' );
	}
}
