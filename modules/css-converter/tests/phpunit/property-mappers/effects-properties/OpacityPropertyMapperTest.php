<?php

namespace Elementor\Tests\PhpUnit\PropertyMappers\EffectsProperties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Opacity_Property_Mapper;
use PHPUnit\Framework\TestCase;

class OpacityPropertyMapperTest extends TestCase {

	private Opacity_Property_Mapper $mapper;

	protected function setUp(): void {
		$this->mapper = new Opacity_Property_Mapper();
	}

	public function it_supports_opacity_property(): void {
		$this->assertTrue( $this->mapper->is_supported_property( 'opacity' ) );
	}

	public function it_correctly_identifies_supported_properties(): void {
		$this->assertTrue( $this->mapper->is_supported_property( 'opacity' ) );
		$this->assertFalse( $this->mapper->is_supported_property( 'visibility' ) );
		$this->assertFalse( $this->mapper->is_supported_property( 'display' ) );
		$this->assertFalse( $this->mapper->is_supported_property( 'filter' ) );
	}

	public function it_handles_decimal_opacity_values(): void {
		$test_cases = [
			'0' => 0.0,
			'0.0' => 0.0,
			'0.5' => 50.0,
			'0.75' => 75.0,
			'1' => 100.0,
			'1.0' => 100.0,
		];

		foreach ( $test_cases as $input => $expected_percentage ) {
			$result = $this->mapper->map_to_v4_atomic( 'opacity', $input );

			$this->assertUniversalMapperCompliance( $result, 'opacity' );
			$this->assertValidSizePropType( $result );
			$this->assertEquals( $expected_percentage, $result['value']['value']['size'] );
			$this->assertEquals( '%', $result['value']['value']['unit'] );
		}
	}

	public function it_handles_percentage_opacity_values(): void {
		$test_cases = [
			'0%' => 0.0,
			'25%' => 25.0,
			'50%' => 50.0,
			'75%' => 75.0,
			'100%' => 100.0,
		];

		foreach ( $test_cases as $input => $expected_percentage ) {
			$result = $this->mapper->map_to_v4_atomic( 'opacity', $input );

			$this->assertUniversalMapperCompliance( $result, 'opacity' );
			$this->assertValidSizePropType( $result );
			$this->assertEquals( $expected_percentage, $result['value']['value']['size'] );
			$this->assertEquals( '%', $result['value']['value']['unit'] );
		}
	}

	public function it_handles_numeric_opacity_values(): void {
		$result = $this->mapper->map_to_v4_atomic( 'opacity', 0.8 );

		$this->assertUniversalMapperCompliance( $result, 'opacity' );
		$this->assertValidSizePropType( $result );
		$this->assertEquals( 80.0, $result['value']['value']['size'] );
		$this->assertEquals( '%', $result['value']['value']['unit'] );
	}

	public function it_handles_edge_case_opacity_values(): void {
		$edge_cases = [
			'0.01' => 1.0,
			'0.99' => 99.0,
			'0.001' => 0.1,
			'0.999' => 99.9,
		];

		foreach ( $edge_cases as $input => $expected_percentage ) {
			$result = $this->mapper->map_to_v4_atomic( 'opacity', $input );

			$this->assertUniversalMapperCompliance( $result, 'opacity' );
			$this->assertValidSizePropType( $result );
			$this->assertEquals( $expected_percentage, $result['value']['value']['size'] );
			$this->assertEquals( '%', $result['value']['value']['unit'] );
		}
	}

	public function it_rejects_invalid_opacity_values(): void {
		$invalid_values = [
			null,
			'',
			'invalid',
			'2',
			'1.5',
			'-0.5',
			'150%',
			'-25%',
			'auto',
			'inherit',
			'initial',
			'unset',
			[],
			new \stdClass(),
		];

		foreach ( $invalid_values as $invalid_value ) {
			$result = $this->mapper->map_to_v4_atomic( 'opacity', $invalid_value );
			$this->assertNull( $result, "Should reject invalid value: " . var_export( $invalid_value, true ) );
		}
	}

	public function it_rejects_out_of_range_decimal_values(): void {
		$out_of_range_values = [
			'1.1',
			'2.0',
			'-0.1',
			'-1.0',
			'5',
			'-5',
		];

		foreach ( $out_of_range_values as $invalid_value ) {
			$result = $this->mapper->map_to_v4_atomic( 'opacity', $invalid_value );
			$this->assertNull( $result, "Should reject out of range value: {$invalid_value}" );
		}
	}

	public function it_handles_string_numeric_values(): void {
		$result = $this->mapper->map_to_v4_atomic( 'opacity', '0.6' );

		$this->assertUniversalMapperCompliance( $result, 'opacity' );
		$this->assertValidSizePropType( $result );
		$this->assertEquals( 60.0, $result['value']['value']['size'] );
		$this->assertEquals( '%', $result['value']['value']['unit'] );
	}

	public function it_handles_whitespace_in_values(): void {
		$test_cases = [
			' 0.5 ' => 50.0,
			' 75% ' => 75.0,
			'  1  ' => 100.0,
		];

		foreach ( $test_cases as $input => $expected_percentage ) {
			$result = $this->mapper->map_to_v4_atomic( 'opacity', $input );

			$this->assertUniversalMapperCompliance( $result, 'opacity' );
			$this->assertValidSizePropType( $result );
			$this->assertEquals( $expected_percentage, $result['value']['value']['size'] );
			$this->assertEquals( '%', $result['value']['value']['unit'] );
		}
	}

	public function it_rejects_unsupported_properties(): void {
		$unsupported_properties = [
			'visibility',
			'display',
			'filter',
			'backdrop-filter',
			'mix-blend-mode',
		];

		foreach ( $unsupported_properties as $property ) {
			$result = $this->mapper->map_to_v4_atomic( $property, '0.5' );
			$this->assertNull( $result, "Should reject unsupported property: {$property}" );
		}
	}

	public function it_maintains_atomic_widget_compliance(): void {
		$result = $this->mapper->map_to_v4_atomic( 'opacity', '0.7' );

		$this->assertUniversalMapperCompliance( $result, 'opacity' );
		$this->assertValidSizePropType( $result );

		$this->assertEquals( 'size', $result['value']['$$type'] );
		$this->assertIsArray( $result['value']['value'] );
		$this->assertArrayHasKey( 'size', $result['value']['value'] );
		$this->assertArrayHasKey( 'unit', $result['value']['value'] );
		$this->assertIsFloat( $result['value']['value']['size'] );
		$this->assertEquals( '%', $result['value']['value']['unit'] );
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

	private function assertValidSizePropType( array $result ): void {
		$this->assertEquals( 'size', $result['value']['$$type'], 'Should have size type' );
		$this->assertIsArray( $result['value']['value'], 'Size value should be array' );
		$this->assertArrayHasKey( 'size', $result['value']['value'], 'Size should have size field' );
		$this->assertArrayHasKey( 'unit', $result['value']['value'], 'Size should have unit field' );
		$this->assertIsNumeric( $result['value']['value']['size'], 'Size should be numeric' );
		$this->assertIsString( $result['value']['value']['unit'], 'Unit should be string' );
		$this->assertEquals( '%', $result['value']['value']['unit'], 'Opacity should always use percentage unit' );
	}
}
