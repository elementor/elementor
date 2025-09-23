<?php
namespace Elementor\Testing\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Font_Size_Property_Mapper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group css-converter-mappers
 */
class Test_Font_Size_Property_Mapper extends Elementor_Test_Base {
	private $mapper;

	public function setUp(): void {
		parent::setUp();
		$this->mapper = new Font_Size_Property_Mapper();
	}

	public function test_supports_font_size_property_only() {
		$this->assertTrue( $this->mapper->supports( 'font-size', '16px' ) );
		$this->assertFalse( $this->mapper->supports( 'line-height', '16px' ) );
		$this->assertFalse( $this->mapper->supports( 'font-weight', '16px' ) );
	}

	public function test_supports_pixel_values() {
		$this->assertTrue( $this->mapper->supports( 'font-size', '16px' ) );
		$this->assertTrue( $this->mapper->supports( 'font-size', '12.5px' ) );
		$this->assertFalse( $this->mapper->supports( 'font-size', '16' ) );
		$this->assertFalse( $this->mapper->supports( 'font-size', 'px' ) );
	}

	public function test_supports_em_values() {
		$this->assertTrue( $this->mapper->supports( 'font-size', '1em' ) );
		$this->assertTrue( $this->mapper->supports( 'font-size', '1.5em' ) );
		$this->assertTrue( $this->mapper->supports( 'font-size', '0.8em' ) );
	}

	public function test_supports_rem_values() {
		$this->assertTrue( $this->mapper->supports( 'font-size', '1rem' ) );
		$this->assertTrue( $this->mapper->supports( 'font-size', '1.2rem' ) );
	}

	public function test_supports_percentage_values() {
		$this->assertTrue( $this->mapper->supports( 'font-size', '100%' ) );
		$this->assertTrue( $this->mapper->supports( 'font-size', '120%' ) );
		$this->assertTrue( $this->mapper->supports( 'font-size', '80.5%' ) );
	}

	public function test_supports_point_values() {
		$this->assertTrue( $this->mapper->supports( 'font-size', '12pt' ) );
		$this->assertTrue( $this->mapper->supports( 'font-size', '14.5pt' ) );
	}

	public function test_supports_viewport_values() {
		$this->assertTrue( $this->mapper->supports( 'font-size', '4vh' ) );
		$this->assertTrue( $this->mapper->supports( 'font-size', '2vw' ) );
	}

	public function test_rejects_unsupported_units() {
		$this->assertFalse( $this->mapper->supports( 'font-size', '16cm' ) );
		$this->assertFalse( $this->mapper->supports( 'font-size', '16mm' ) );
		$this->assertFalse( $this->mapper->supports( 'font-size', '16in' ) );
	}

	public function test_normalizes_integer_values() {
		$result = $this->mapper->map_to_schema( 'font-size', '16.0px' );
		$this->assertEquals( [ 'font-size' => '16px' ], $result );

		$result = $this->mapper->map_to_schema( 'font-size', '1.0em' );
		$this->assertEquals( [ 'font-size' => '1em' ], $result );
	}

	public function test_preserves_decimal_values() {
		$result = $this->mapper->map_to_schema( 'font-size', '16.5px' );
		$this->assertEquals( [ 'font-size' => '16.5px' ], $result );

		$result = $this->mapper->map_to_schema( 'font-size', '1.2em' );
		$this->assertEquals( [ 'font-size' => '1.2em' ], $result );
	}

	public function test_get_supported_properties() {
		$properties = $this->mapper->get_supported_properties();
		$this->assertEquals( [ 'font-size' ], $properties );
	}

	public function test_supports_v4_conversion() {
		$this->assertTrue( $this->mapper->supports_v4_conversion( 'font-size', '16px' ) );
		$this->assertFalse( $this->mapper->supports_v4_conversion( 'line-height', '16px' ) );
	}

	public function test_get_v4_property_name() {
		$this->assertEquals( 'font-size', $this->mapper->get_v4_property_name( 'font-size' ) );
	}

	public function test_map_to_v4_atomic_pixel_size() {
		$result = $this->mapper->map_to_v4_atomic( 'font-size', '16px' );
		$expected = [
			'property' => 'font-size',
			'value' => [
				'$$type' => 'size',
				'value' => [
					'size' => 16,
					'unit' => 'px',
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_map_to_v4_atomic_em_size() {
		$result = $this->mapper->map_to_v4_atomic( 'font-size', '1.5em' );
		$expected = [
			'property' => 'font-size',
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

	public function test_map_to_v4_atomic_percentage_size() {
		$result = $this->mapper->map_to_v4_atomic( 'font-size', '120%' );
		$expected = [
			'property' => 'font-size',
			'value' => [
				'$$type' => 'size',
				'value' => [
					'size' => 120,
					'unit' => '%',
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_map_to_v4_atomic_unsupported_property() {
		$result = $this->mapper->map_to_v4_atomic( 'line-height', '16px' );
		$this->assertNull( $result );
	}
}
