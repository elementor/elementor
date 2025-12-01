<?php
namespace Elementor\Testing\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Margin_Property_Mapper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group css-converter-mappers
 */
class Test_Margin_Property_Mapper extends Elementor_Test_Base {
	private $mapper;

	public function setUp(): void {
		parent::setUp();
		$this->mapper = new Margin_Property_Mapper();
	}

	public function test_supports_margin_properties_only() {
		$this->assertTrue( $this->mapper->supports( 'margin', '10px' ) );
		$this->assertTrue( $this->mapper->supports( 'margin-top', '10px' ) );
		$this->assertTrue( $this->mapper->supports( 'margin-right', '10px' ) );
		$this->assertTrue( $this->mapper->supports( 'margin-bottom', '10px' ) );
		$this->assertTrue( $this->mapper->supports( 'margin-left', '10px' ) );
		$this->assertFalse( $this->mapper->supports( 'padding', '10px' ) );
		$this->assertFalse( $this->mapper->supports( 'border', '10px' ) );
	}

	public function test_supports_individual_margin_values() {
		$this->assertTrue( $this->mapper->supports( 'margin-top', '16px' ) );
		$this->assertTrue( $this->mapper->supports( 'margin-right', '1em' ) );
		$this->assertTrue( $this->mapper->supports( 'margin-bottom', '2rem' ) );
		$this->assertTrue( $this->mapper->supports( 'margin-left', '5%' ) );
		$this->assertTrue( $this->mapper->supports( 'margin-top', '-10px' ) );
	}

	public function test_supports_margin_shorthand_values() {
		$this->assertTrue( $this->mapper->supports( 'margin', '10px' ) );
		$this->assertTrue( $this->mapper->supports( 'margin', '10px 20px' ) );
		$this->assertTrue( $this->mapper->supports( 'margin', '10px 20px 30px' ) );
		$this->assertTrue( $this->mapper->supports( 'margin', '10px 20px 30px 40px' ) );
		$this->assertTrue( $this->mapper->supports( 'margin', '1em 2rem 5% 10vh' ) );
	}

	public function test_rejects_invalid_values() {
		$this->assertFalse( $this->mapper->supports( 'margin', 'invalid' ) );
		$this->assertFalse( $this->mapper->supports( 'margin-top', 'auto' ) );
		$this->assertFalse( $this->mapper->supports( 'margin', '' ) );
		$this->assertFalse( $this->mapper->supports( 'margin', null ) );
	}

	public function test_maps_individual_margin_properties() {
		$result = $this->mapper->map_to_schema( 'margin-top', '16px' );
		$expected = [
			'margin-top' => [
				'$$type' => 'size',
				'value' => [
					'size' => 16,
					'unit' => 'px',
				],
			],
		];
		$this->assertEquals( $expected, $result );

		$result = $this->mapper->map_to_schema( 'margin-left', '-10px' );
		$expected = [
			'margin-left' => [
				'$$type' => 'size',
				'value' => [
					'size' => -10,
					'unit' => 'px',
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_margin_shorthand_one_value() {
		$result = $this->mapper->map_to_schema( 'margin', '10px' );
		$expected = [
			'margin-top' => [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'px' ] ],
			'margin-right' => [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'px' ] ],
			'margin-bottom' => [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'px' ] ],
			'margin-left' => [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'px' ] ],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_margin_shorthand_two_values() {
		$result = $this->mapper->map_to_schema( 'margin', '10px 20px' );
		$expected = [
			'margin-top' => [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'px' ] ],
			'margin-right' => [ '$$type' => 'size', 'value' => [ 'size' => 20, 'unit' => 'px' ] ],
			'margin-bottom' => [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'px' ] ],
			'margin-left' => [ '$$type' => 'size', 'value' => [ 'size' => 20, 'unit' => 'px' ] ],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_margin_shorthand_three_values() {
		$result = $this->mapper->map_to_schema( 'margin', '10px 20px 30px' );
		$expected = [
			'margin-top' => [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'px' ] ],
			'margin-right' => [ '$$type' => 'size', 'value' => [ 'size' => 20, 'unit' => 'px' ] ],
			'margin-bottom' => [ '$$type' => 'size', 'value' => [ 'size' => 30, 'unit' => 'px' ] ],
			'margin-left' => [ '$$type' => 'size', 'value' => [ 'size' => 20, 'unit' => 'px' ] ],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_margin_shorthand_four_values() {
		$result = $this->mapper->map_to_schema( 'margin', '10px 20px 30px 40px' );
		$expected = [
			'margin-top' => [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'px' ] ],
			'margin-right' => [ '$$type' => 'size', 'value' => [ 'size' => 20, 'unit' => 'px' ] ],
			'margin-bottom' => [ '$$type' => 'size', 'value' => [ 'size' => 30, 'unit' => 'px' ] ],
			'margin-left' => [ '$$type' => 'size', 'value' => [ 'size' => 40, 'unit' => 'px' ] ],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_margin_mixed_units() {
		$result = $this->mapper->map_to_schema( 'margin', '1em 2rem 5% 10vh' );
		$expected = [
			'margin-top' => [ '$$type' => 'size', 'value' => [ 'size' => 1, 'unit' => 'em' ] ],
			'margin-right' => [ '$$type' => 'size', 'value' => [ 'size' => 2, 'unit' => 'rem' ] ],
			'margin-bottom' => [ '$$type' => 'size', 'value' => [ 'size' => 5, 'unit' => '%' ] ],
			'margin-left' => [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'vh' ] ],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_get_supported_properties() {
		$properties = $this->mapper->get_supported_properties();
		$expected = [ 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left' ];
		$this->assertEquals( $expected, $properties );
	}

	public function test_supports_v4_conversion() {
		$this->assertTrue( $this->mapper->supports_v4_conversion( 'margin', '10px' ) );
		$this->assertTrue( $this->mapper->supports_v4_conversion( 'margin-top', '10px' ) );
		$this->assertFalse( $this->mapper->supports_v4_conversion( 'padding', '10px' ) );
	}

	public function test_get_v4_property_name() {
		$this->assertEquals( 'margin', $this->mapper->get_v4_property_name( 'margin' ) );
		$this->assertEquals( 'margin-top', $this->mapper->get_v4_property_name( 'margin-top' ) );
	}

	public function test_map_to_v4_atomic_margin_bottom_individual() {
		$result = $this->mapper->map_to_v4_atomic( 'margin-bottom', '16px' );
		$expected = [
			'property' => 'margin',
			'value' => [
				'$$type' => 'dimensions',
				'value' => [
					'block-end' => [
						'$$type' => 'size',
						'value' => [
							'size' => 16,
							'unit' => 'px',
						],
					],
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_map_to_v4_atomic_margin_top_individual() {
		$result = $this->mapper->map_to_v4_atomic( 'margin-top', '20px' );
		$expected = [
			'property' => 'margin',
			'value' => [
				'$$type' => 'dimensions',
				'value' => [
					'block-start' => [
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

	public function test_map_to_v4_atomic_margin_left_individual() {
		$result = $this->mapper->map_to_v4_atomic( 'margin-left', '1em' );
		$expected = [
			'property' => 'margin',
			'value' => [
				'$$type' => 'dimensions',
				'value' => [
					'inline-start' => [
						'$$type' => 'size',
						'value' => [
							'size' => 1,
							'unit' => 'em',
						],
					],
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_map_to_v4_atomic_margin_right_individual() {
		$result = $this->mapper->map_to_v4_atomic( 'margin-right', '2rem' );
		$expected = [
			'property' => 'margin',
			'value' => [
				'$$type' => 'dimensions',
				'value' => [
					'inline-end' => [
						'$$type' => 'size',
						'value' => [
							'size' => 2,
							'unit' => 'rem',
						],
					],
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_map_to_v4_atomic_margin_shorthand() {
		$result = $this->mapper->map_to_v4_atomic( 'margin', '10px 20px' );
		$expected = [
			'property' => 'margin',
			'value' => [
				'$$type' => 'dimensions',
				'value' => [
					'block-start' => [
						'$$type' => 'size',
						'value' => [
							'size' => 10,
							'unit' => 'px',
						],
					],
					'inline-end' => [
						'$$type' => 'size',
						'value' => [
							'size' => 20,
							'unit' => 'px',
						],
					],
					'block-end' => [
						'$$type' => 'size',
						'value' => [
							'size' => 10,
							'unit' => 'px',
						],
					],
					'inline-start' => [
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

	public function test_map_to_v4_atomic_unsupported_property() {
		$result = $this->mapper->map_to_v4_atomic( 'padding', '10px' );
		$this->assertNull( $result );
	}
}
