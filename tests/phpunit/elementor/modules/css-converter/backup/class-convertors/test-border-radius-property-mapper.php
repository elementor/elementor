<?php
namespace Elementor\Tests\Phpunit\Modules\CssConverter;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Border_Radius_Property_Mapper;
use PHPUnit\Framework\TestCase;

class Test_Border_Radius_Property_Mapper extends TestCase {

	private $mapper;

	public function setUp(): void {
		$this->mapper = new Border_Radius_Property_Mapper();
	}

	public function test_supports_valid_border_radius_properties() {
		$this->assertTrue( $this->mapper->supports( 'border-radius', '8px' ) );
		$this->assertTrue( $this->mapper->supports( 'border-radius', '10px 5px' ) );
		$this->assertTrue( $this->mapper->supports( 'border-radius', '10px 5px 15px' ) );
		$this->assertTrue( $this->mapper->supports( 'border-radius', '10px 5px 15px 20px' ) );
		$this->assertTrue( $this->mapper->supports( 'border-top-left-radius', '5px' ) );
		$this->assertTrue( $this->mapper->supports( 'border-top-right-radius', '10%' ) );
		$this->assertTrue( $this->mapper->supports( 'border-bottom-left-radius', '2em' ) );
		$this->assertTrue( $this->mapper->supports( 'border-bottom-right-radius', '1rem' ) );
	}

	public function test_does_not_support_invalid_properties() {
		$this->assertFalse( $this->mapper->supports( 'border', '8px' ) );
		$this->assertFalse( $this->mapper->supports( 'border-radius', 'invalid' ) );
		$this->assertFalse( $this->mapper->supports( 'border-radius', 123 ) );
		$this->assertFalse( $this->mapper->supports( 'border-radius', '' ) );
	}

	public function test_uniform_border_radius_uses_size_type() {
		$result = $this->mapper->map_to_v4_atomic( 'border-radius', '8px' );
		$expected = [
			'property' => 'border-radius',
			'value' => [
				'$$type' => 'size',
				'value' => [
					'size' => 8,
					'unit' => 'px',
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_uniform_border_radius_with_em_units() {
		$result = $this->mapper->map_to_v4_atomic( 'border-radius', '1.5em' );
		$expected = [
			'property' => 'border-radius',
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

	public function test_individual_corner_border_radius_uses_border_radius_type() {
		$result = $this->mapper->map_to_v4_atomic( 'border-radius', '0 8px 8px 8px' );
		$expected = [
			'property' => 'border-radius',
			'value' => [
				'$$type' => 'border-radius',
				'value' => [
					'start-start' => [
						'$$type' => 'size',
						'value' => [
							'size' => 0,
							'unit' => 'px',
						],
					],
					'start-end' => [
						'$$type' => 'size',
						'value' => [
							'size' => 8,
							'unit' => 'px',
						],
					],
					'end-start' => [
						'$$type' => 'size',
						'value' => [
							'size' => 8,
							'unit' => 'px',
						],
					],
					'end-end' => [
						'$$type' => 'size',
						'value' => [
							'size' => 8,
							'unit' => 'px',
						],
					],
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_two_value_border_radius_uses_border_radius_type() {
		$result = $this->mapper->map_to_v4_atomic( 'border-radius', '10px 5px' );
		$expected = [
			'property' => 'border-radius',
			'value' => [
				'$$type' => 'border-radius',
				'value' => [
					'start-start' => [
						'$$type' => 'size',
						'value' => [
							'size' => 10,
							'unit' => 'px',
						],
					],
					'start-end' => [
						'$$type' => 'size',
						'value' => [
							'size' => 5,
							'unit' => 'px',
						],
					],
					'end-start' => [
						'$$type' => 'size',
						'value' => [
							'size' => 5,
							'unit' => 'px',
						],
					],
					'end-end' => [
						'$$type' => 'size',
						'value' => [
							'size' => 10,
							'unit' => 'px',
						],
					],
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_three_value_border_radius_uses_border_radius_type() {
		$result = $this->mapper->map_to_v4_atomic( 'border-radius', '10px 5px 15px' );
		$expected = [
			'property' => 'border-radius',
			'value' => [
				'$$type' => 'border-radius',
				'value' => [
					'start-start' => [
						'$$type' => 'size',
						'value' => [
							'size' => 10,
							'unit' => 'px',
						],
					],
					'start-end' => [
						'$$type' => 'size',
						'value' => [
							'size' => 5,
							'unit' => 'px',
						],
					],
					'end-start' => [
						'$$type' => 'size',
						'value' => [
							'size' => 5,
							'unit' => 'px',
						],
					],
					'end-end' => [
						'$$type' => 'size',
						'value' => [
							'size' => 15,
							'unit' => 'px',
						],
					],
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_individual_corner_property_uses_size_type() {
		$result = $this->mapper->map_to_v4_atomic( 'border-top-left-radius', '12px' );
		$expected = [
			'property' => 'border-top-left-radius',
			'value' => [
				'$$type' => 'size',
				'value' => [
					'size' => 12,
					'unit' => 'px',
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_to_schema_correctly() {
		$result = $this->mapper->map_to_schema( 'border-radius', '8px' );
		$expected = [
			'border-radius' => [
				'$$type' => 'string',
				'value' => '8px',
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_get_supported_properties() {
		$properties = $this->mapper->get_supported_properties();
		$this->assertContains( 'border-radius', $properties );
		$this->assertContains( 'border-top-left-radius', $properties );
		$this->assertContains( 'border-top-right-radius', $properties );
		$this->assertContains( 'border-bottom-left-radius', $properties );
		$this->assertContains( 'border-bottom-right-radius', $properties );
		$this->assertCount( 5, $properties );
	}

	public function test_supports_v4_conversion() {
		$this->assertTrue( $this->mapper->supports_v4_conversion( 'border-radius', '8px' ) );
		$this->assertTrue( $this->mapper->supports_v4_conversion( 'border-top-left-radius', '5px' ) );
		$this->assertFalse( $this->mapper->supports_v4_conversion( 'border', '8px' ) );
	}

	public function test_get_v4_property_name() {
		$this->assertEquals( 'border-radius', $this->mapper->get_v4_property_name( 'border-radius' ) );
		$this->assertEquals( 'border-top-left-radius', $this->mapper->get_v4_property_name( 'border-top-left-radius' ) );
	}

	public function test_map_to_v4_atomic_unsupported_property() {
		$result = $this->mapper->map_to_v4_atomic( 'border', '8px' );
		$this->assertNull( $result );
	}

	public function test_map_to_v4_atomic_invalid_value() {
		$result = $this->mapper->map_to_v4_atomic( 'border-radius', 'invalid' );
		$this->assertNull( $result );
	}

	public function test_uniform_detection_with_spaces() {
		$result = $this->mapper->map_to_v4_atomic( 'border-radius', '8px 8px 8px 8px' );
		$expected = [
			'property' => 'border-radius',
			'value' => [
				'$$type' => 'size',
				'value' => [
					'size' => 8,
					'unit' => 'px',
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_zero_values_handled_correctly() {
		$result = $this->mapper->map_to_v4_atomic( 'border-radius', '0' );
		$expected = [
			'property' => 'border-radius',
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
}
