<?php
namespace Elementor\Tests\Phpunit\Modules\CssConverter;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Flex_Direction_Property_Mapper;
use PHPUnit\Framework\TestCase;

class Test_Flex_Direction_Property_Mapper extends TestCase {

	private $mapper;

	public function setUp(): void {
		$this->mapper = new Flex_Direction_Property_Mapper();
	}

	public function test_supports_valid_flex_direction_values() {
		$this->assertTrue( $this->mapper->supports( 'flex-direction', 'row' ) );
		$this->assertTrue( $this->mapper->supports( 'flex-direction', 'column' ) );
		$this->assertTrue( $this->mapper->supports( 'flex-direction', 'row-reverse' ) );
		$this->assertTrue( $this->mapper->supports( 'flex-direction', 'column-reverse' ) );
	}

	public function test_does_not_support_invalid_properties() {
		$this->assertFalse( $this->mapper->supports( 'flex', 'row' ) );
		$this->assertFalse( $this->mapper->supports( 'flex-direction', 'invalid-value' ) );
		$this->assertFalse( $this->mapper->supports( 'flex-direction', 123 ) );
		$this->assertFalse( $this->mapper->supports( 'flex-direction', '' ) );
	}

	public function test_maps_row_direction_to_v4_atomic() {
		$result = $this->mapper->map_to_v4_atomic( 'flex-direction', 'row' );
		$expected = [
			'property' => 'flex-direction',
			'value' => [
				'$$type' => 'string',
				'value' => 'row',
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_column_direction_to_v4_atomic() {
		$result = $this->mapper->map_to_v4_atomic( 'flex-direction', 'column' );
		$expected = [
			'property' => 'flex-direction',
			'value' => [
				'$$type' => 'string',
				'value' => 'column',
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_reverse_directions_to_v4_atomic() {
		$result = $this->mapper->map_to_v4_atomic( 'flex-direction', 'row-reverse' );
		$expected = [
			'property' => 'flex-direction',
			'value' => [
				'$$type' => 'string',
				'value' => 'row-reverse',
			],
		];
		$this->assertEquals( $expected, $result );

		$result = $this->mapper->map_to_v4_atomic( 'flex-direction', 'column-reverse' );
		$expected = [
			'property' => 'flex-direction',
			'value' => [
				'$$type' => 'string',
				'value' => 'column-reverse',
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_to_schema_correctly() {
		$result = $this->mapper->map_to_schema( 'flex-direction', 'column' );
		$expected = [
			'flex-direction' => [
				'$$type' => 'string',
				'value' => 'column',
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_get_supported_properties() {
		$properties = $this->mapper->get_supported_properties();
		$this->assertContains( 'flex-direction', $properties );
		$this->assertCount( 1, $properties );
	}

	public function test_supports_v4_conversion() {
		$this->assertTrue( $this->mapper->supports_v4_conversion( 'flex-direction', 'row' ) );
		$this->assertFalse( $this->mapper->supports_v4_conversion( 'flex', 'row' ) );
	}

	public function test_get_v4_property_name() {
		$this->assertEquals( 'flex-direction', $this->mapper->get_v4_property_name( 'flex-direction' ) );
	}

	public function test_map_to_v4_atomic_unsupported_property() {
		$result = $this->mapper->map_to_v4_atomic( 'flex', 'row' );
		$this->assertNull( $result );
	}

	public function test_map_to_v4_atomic_invalid_value() {
		$result = $this->mapper->map_to_v4_atomic( 'flex-direction', 'invalid' );
		$this->assertNull( $result );
	}
}
