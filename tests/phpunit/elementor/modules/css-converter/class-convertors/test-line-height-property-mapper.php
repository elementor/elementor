<?php
namespace Elementor\Testing\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\CssConverter\ClassConvertors\Line_Height_Property_Mapper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group css-converter-mappers
 */
class Test_Line_Height_Property_Mapper extends Elementor_Test_Base {
	private $mapper;

	public function setUp(): void {
		parent::setUp();
		$this->mapper = new Line_Height_Property_Mapper();
	}

	public function test_supports_line_height_property_only() {
		$this->assertTrue( $this->mapper->supports( 'line-height', '1.5' ) );
		$this->assertFalse( $this->mapper->supports( 'font-size', '1.5' ) );
		$this->assertFalse( $this->mapper->supports( 'height', '1.5' ) );
	}

	public function test_supports_unitless_values() {
		$this->assertTrue( $this->mapper->supports( 'line-height', '1' ) );
		$this->assertTrue( $this->mapper->supports( 'line-height', '1.5' ) );
		$this->assertTrue( $this->mapper->supports( 'line-height', '2.0' ) );
		$this->assertTrue( $this->mapper->supports( 'line-height', 1.2 ) );
	}

	public function test_supports_pixel_values() {
		$this->assertTrue( $this->mapper->supports( 'line-height', '20px' ) );
		$this->assertTrue( $this->mapper->supports( 'line-height', '24.5px' ) );
	}

	public function test_supports_em_values() {
		$this->assertTrue( $this->mapper->supports( 'line-height', '1em' ) );
		$this->assertTrue( $this->mapper->supports( 'line-height', '1.2em' ) );
	}

	public function test_supports_rem_values() {
		$this->assertTrue( $this->mapper->supports( 'line-height', '1rem' ) );
		$this->assertTrue( $this->mapper->supports( 'line-height', '1.5rem' ) );
	}

	public function test_supports_percentage_values() {
		$this->assertTrue( $this->mapper->supports( 'line-height', '120%' ) );
		$this->assertTrue( $this->mapper->supports( 'line-height', '150%' ) );
	}

	public function test_supports_normal_keyword() {
		$this->assertTrue( $this->mapper->supports( 'line-height', 'normal' ) );
		$this->assertTrue( $this->mapper->supports( 'line-height', 'NORMAL' ) );
	}

	public function test_rejects_invalid_values() {
		$this->assertFalse( $this->mapper->supports( 'line-height', 'invalid' ) );
		$this->assertFalse( $this->mapper->supports( 'line-height', '' ) );
		$this->assertFalse( $this->mapper->supports( 'line-height', null ) );
		$this->assertFalse( $this->mapper->supports( 'line-height', 'auto' ) );
	}

	public function test_normalizes_normal_keyword() {
		$result = $this->mapper->map_to_schema( 'line-height', 'normal' );
		$expected = [
			'line-height' => [
				'$$type' => 'size',
				'value' => [
					'size' => 1.2,
					'unit' => '',
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_unitless_values() {
		$result = $this->mapper->map_to_schema( 'line-height', '1.5' );
		$expected = [
			'line-height' => [
				'$$type' => 'size',
				'value' => [
					'size' => 1.5,
					'unit' => '',
				],
			],
		];
		$this->assertEquals( $expected, $result );

		$result = $this->mapper->map_to_schema( 'line-height', '2' );
		$expected = [
			'line-height' => [
				'$$type' => 'size',
				'value' => [
					'size' => 2,
					'unit' => '',
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_pixel_values() {
		$result = $this->mapper->map_to_schema( 'line-height', '24px' );
		$expected = [
			'line-height' => [
				'$$type' => 'size',
				'value' => [
					'size' => 24,
					'unit' => 'px',
				],
			],
		];
		$this->assertEquals( $expected, $result );

		$result = $this->mapper->map_to_schema( 'line-height', '18.5px' );
		$expected = [
			'line-height' => [
				'$$type' => 'size',
				'value' => [
					'size' => 18.5,
					'unit' => 'px',
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_em_values() {
		$result = $this->mapper->map_to_schema( 'line-height', '1.2em' );
		$expected = [
			'line-height' => [
				'$$type' => 'size',
				'value' => [
					'size' => 1.2,
					'unit' => 'em',
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_get_supported_properties() {
		$properties = $this->mapper->get_supported_properties();
		$this->assertEquals( [ 'line-height' ], $properties );
	}
}
