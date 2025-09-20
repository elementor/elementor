<?php
namespace Elementor\Testing\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\CssConverter\Convertors\Classes\Padding_Property_Mapper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group css-converter-mappers
 */
class Test_Padding_Property_Mapper extends Elementor_Test_Base {
	private $mapper;

	public function setUp(): void {
		parent::setUp();
		$this->mapper = new Padding_Property_Mapper();
	}

	public function test_supports_padding_properties_only() {
		$this->assertTrue( $this->mapper->supports( 'padding', '10px' ) );
		$this->assertTrue( $this->mapper->supports( 'padding-top', '10px' ) );
		$this->assertTrue( $this->mapper->supports( 'padding-right', '10px' ) );
		$this->assertTrue( $this->mapper->supports( 'padding-bottom', '10px' ) );
		$this->assertTrue( $this->mapper->supports( 'padding-left', '10px' ) );
		$this->assertFalse( $this->mapper->supports( 'margin', '10px' ) );
		$this->assertFalse( $this->mapper->supports( 'border', '10px' ) );
	}

	public function test_supports_individual_padding_values() {
		$this->assertTrue( $this->mapper->supports( 'padding-top', '16px' ) );
		$this->assertTrue( $this->mapper->supports( 'padding-right', '1em' ) );
		$this->assertTrue( $this->mapper->supports( 'padding-bottom', '2rem' ) );
		$this->assertTrue( $this->mapper->supports( 'padding-left', '5%' ) );
		$this->assertTrue( $this->mapper->supports( 'padding-top', '0px' ) );
	}

	public function test_supports_padding_shorthand_values() {
		$this->assertTrue( $this->mapper->supports( 'padding', '10px' ) );
		$this->assertTrue( $this->mapper->supports( 'padding', '10px 20px' ) );
		$this->assertTrue( $this->mapper->supports( 'padding', '10px 20px 30px' ) );
		$this->assertTrue( $this->mapper->supports( 'padding', '10px 20px 30px 40px' ) );
		$this->assertTrue( $this->mapper->supports( 'padding', '1em 2rem 5% 10vh' ) );
	}

	public function test_rejects_invalid_values() {
		$this->assertFalse( $this->mapper->supports( 'padding', 'invalid' ) );
		$this->assertFalse( $this->mapper->supports( 'padding-top', 'auto' ) );
		$this->assertFalse( $this->mapper->supports( 'padding', '' ) );
		$this->assertFalse( $this->mapper->supports( 'padding', null ) );
		$this->assertFalse( $this->mapper->supports( 'padding-left', '-10px' ) ); // Negative padding invalid
	}

	public function test_maps_individual_padding_properties() {
		$result = $this->mapper->map_to_schema( 'padding-top', '16px' );
		$expected = [
			'padding-top' => [
				'$$type' => 'size',
				'value' => [
					'size' => 16,
					'unit' => 'px',
				],
			],
		];
		$this->assertEquals( $expected, $result );

		$result = $this->mapper->map_to_schema( 'padding-left', '2.5rem' );
		$expected = [
			'padding-left' => [
				'$$type' => 'size',
				'value' => [
					'size' => 2.5,
					'unit' => 'rem',
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_padding_shorthand_one_value() {
		$result = $this->mapper->map_to_schema( 'padding', '15px' );
		$expected = [
			'padding-top' => [ '$$type' => 'size', 'value' => [ 'size' => 15, 'unit' => 'px' ] ],
			'padding-right' => [ '$$type' => 'size', 'value' => [ 'size' => 15, 'unit' => 'px' ] ],
			'padding-bottom' => [ '$$type' => 'size', 'value' => [ 'size' => 15, 'unit' => 'px' ] ],
			'padding-left' => [ '$$type' => 'size', 'value' => [ 'size' => 15, 'unit' => 'px' ] ],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_padding_shorthand_two_values() {
		$result = $this->mapper->map_to_schema( 'padding', '10px 25px' );
		$expected = [
			'padding-top' => [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'px' ] ],
			'padding-right' => [ '$$type' => 'size', 'value' => [ 'size' => 25, 'unit' => 'px' ] ],
			'padding-bottom' => [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'px' ] ],
			'padding-left' => [ '$$type' => 'size', 'value' => [ 'size' => 25, 'unit' => 'px' ] ],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_padding_shorthand_three_values() {
		$result = $this->mapper->map_to_schema( 'padding', '5px 10px 15px' );
		$expected = [
			'padding-top' => [ '$$type' => 'size', 'value' => [ 'size' => 5, 'unit' => 'px' ] ],
			'padding-right' => [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'px' ] ],
			'padding-bottom' => [ '$$type' => 'size', 'value' => [ 'size' => 15, 'unit' => 'px' ] ],
			'padding-left' => [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'px' ] ],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_padding_shorthand_four_values() {
		$result = $this->mapper->map_to_schema( 'padding', '5px 10px 15px 20px' );
		$expected = [
			'padding-top' => [ '$$type' => 'size', 'value' => [ 'size' => 5, 'unit' => 'px' ] ],
			'padding-right' => [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'px' ] ],
			'padding-bottom' => [ '$$type' => 'size', 'value' => [ 'size' => 15, 'unit' => 'px' ] ],
			'padding-left' => [ '$$type' => 'size', 'value' => [ 'size' => 20, 'unit' => 'px' ] ],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_padding_mixed_units() {
		$result = $this->mapper->map_to_schema( 'padding', '0.5em 1rem 2% 3vh' );
		$expected = [
			'padding-top' => [ '$$type' => 'size', 'value' => [ 'size' => 0.5, 'unit' => 'em' ] ],
			'padding-right' => [ '$$type' => 'size', 'value' => [ 'size' => 1, 'unit' => 'rem' ] ],
			'padding-bottom' => [ '$$type' => 'size', 'value' => [ 'size' => 2, 'unit' => '%' ] ],
			'padding-left' => [ '$$type' => 'size', 'value' => [ 'size' => 3, 'unit' => 'vh' ] ],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_get_supported_properties() {
		$properties = $this->mapper->get_supported_properties();
		$expected = [ 'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left' ];
		$this->assertEquals( $expected, $properties );
	}
}
