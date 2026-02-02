<?php
namespace Elementor\Tests\Phpunit\Modules\CssConverter;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Gap_Property_Mapper;
use PHPUnit\Framework\TestCase;

class Test_Gap_Property_Mapper extends TestCase {

	private $mapper;

	public function setUp(): void {
		$this->mapper = new Gap_Property_Mapper();
	}

	public function test_supports_valid_gap_properties() {
		$this->assertTrue( $this->mapper->supports( 'gap', '20px' ) );
		$this->assertTrue( $this->mapper->supports( 'gap', '10px 20px' ) );
		$this->assertTrue( $this->mapper->supports( 'row-gap', '15px' ) );
		$this->assertTrue( $this->mapper->supports( 'column-gap', '25px' ) );
		$this->assertTrue( $this->mapper->supports( 'gap', '1em' ) );
		$this->assertTrue( $this->mapper->supports( 'gap', '0' ) );
	}

	public function test_does_not_support_invalid_properties() {
		$this->assertFalse( $this->mapper->supports( 'margin', '20px' ) );
		$this->assertFalse( $this->mapper->supports( 'gap', 'invalid-value' ) );
		$this->assertFalse( $this->mapper->supports( 'gap', 123 ) );
		$this->assertFalse( $this->mapper->supports( 'gap', '' ) );
	}

	public function test_maps_single_gap_value_to_v4_atomic() {
		$result = $this->mapper->map_to_v4_atomic( 'gap', '20px' );
		$expected = [
			'property' => 'gap',
			'value' => [
				'$$type' => 'size',
				'value' => [
					'size' => 20,
					'unit' => 'px',
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_double_gap_value_to_v4_atomic() {
		$result = $this->mapper->map_to_v4_atomic( 'gap', '10px 20px' );
		$expected = [
			'property' => 'gap',
			'value' => [
				'$$type' => 'dimensions',
				'value' => [
					'row-gap' => [
						'$$type' => 'size',
						'value' => [
							'size' => 10,
							'unit' => 'px',
						],
					],
					'column-gap' => [
						'$$type' => 'size',
						'value' => [
							'size' => 20,
							'unit' => 'px',
						],
					],
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_row_gap_to_v4_atomic() {
		$result = $this->mapper->map_to_v4_atomic( 'row-gap', '15px' );
		$expected = [
			'property' => 'row-gap',
			'value' => [
				'$$type' => 'size',
				'value' => [
					'size' => 15,
					'unit' => 'px',
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_column_gap_to_v4_atomic() {
		$result = $this->mapper->map_to_v4_atomic( 'column-gap', '25px' );
		$expected = [
			'property' => 'column-gap',
			'value' => [
				'$$type' => 'size',
				'value' => [
					'size' => 25,
					'unit' => 'px',
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_gap_with_em_units() {
		$result = $this->mapper->map_to_v4_atomic( 'gap', '1.5em' );
		$expected = [
			'property' => 'gap',
			'value' => [
				'$$type' => 'size',
				'value' => [
					'size' => 1.5,
					'unit' => 'em',
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_zero_gap_value() {
		$result = $this->mapper->map_to_v4_atomic( 'gap', '0' );
		$expected = [
			'property' => 'gap',
			'value' => [
				'$$type' => 'size',
				'value' => [
					'size' => 0,
					'unit' => 'px',
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_to_schema_correctly() {
		$result = $this->mapper->map_to_schema( 'gap', '20px' );
		$expected = [
			'gap' => [
				'$$type' => 'string',
				'value' => '20px',
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_get_supported_properties() {
		$properties = $this->mapper->get_supported_properties();
		$this->assertContains( 'gap', $properties );
		$this->assertContains( 'row-gap', $properties );
		$this->assertContains( 'column-gap', $properties );
		$this->assertCount( 3, $properties );
	}

	public function test_supports_v4_conversion() {
		$this->assertTrue( $this->mapper->supports_v4_conversion( 'gap', '20px' ) );
		$this->assertTrue( $this->mapper->supports_v4_conversion( 'row-gap', '15px' ) );
		$this->assertTrue( $this->mapper->supports_v4_conversion( 'column-gap', '25px' ) );
		$this->assertFalse( $this->mapper->supports_v4_conversion( 'margin', '20px' ) );
	}

	public function test_get_v4_property_name() {
		$this->assertEquals( 'gap', $this->mapper->get_v4_property_name( 'gap' ) );
		$this->assertEquals( 'row-gap', $this->mapper->get_v4_property_name( 'row-gap' ) );
		$this->assertEquals( 'column-gap', $this->mapper->get_v4_property_name( 'column-gap' ) );
	}

	public function test_map_to_v4_atomic_unsupported_property() {
		$result = $this->mapper->map_to_v4_atomic( 'margin', '20px' );
		$this->assertNull( $result );
	}

	public function test_map_to_v4_atomic_invalid_value() {
		$result = $this->mapper->map_to_v4_atomic( 'gap', 'invalid' );
		$this->assertNull( $result );
	}
}
