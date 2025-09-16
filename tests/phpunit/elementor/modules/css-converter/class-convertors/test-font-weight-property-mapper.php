<?php
namespace Elementor\Testing\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\CssConverter\ClassConvertors\Font_Weight_Property_Mapper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group css-converter-mappers
 */
class Test_Font_Weight_Property_Mapper extends Elementor_Test_Base {
	private $mapper;

	public function setUp(): void {
		parent::setUp();
		$this->mapper = new Font_Weight_Property_Mapper();
	}

	public function test_supports_font_weight_property_only() {
		$this->assertTrue( $this->mapper->supports( 'font-weight', 'bold' ) );
		$this->assertFalse( $this->mapper->supports( 'font-size', 'bold' ) );
		$this->assertFalse( $this->mapper->supports( 'font-style', 'bold' ) );
	}

	public function test_supports_keyword_values() {
		$this->assertTrue( $this->mapper->supports( 'font-weight', 'normal' ) );
		$this->assertTrue( $this->mapper->supports( 'font-weight', 'bold' ) );
		$this->assertTrue( $this->mapper->supports( 'font-weight', 'lighter' ) );
		$this->assertTrue( $this->mapper->supports( 'font-weight', 'bolder' ) );
	}

	public function test_supports_numeric_values() {
		$this->assertTrue( $this->mapper->supports( 'font-weight', '100' ) );
		$this->assertTrue( $this->mapper->supports( 'font-weight', '400' ) );
		$this->assertTrue( $this->mapper->supports( 'font-weight', '700' ) );
		$this->assertTrue( $this->mapper->supports( 'font-weight', '900' ) );
		$this->assertTrue( $this->mapper->supports( 'font-weight', 700 ) );
	}

	public function test_rejects_invalid_numeric_values() {
		$this->assertFalse( $this->mapper->supports( 'font-weight', '150' ) );
		$this->assertFalse( $this->mapper->supports( 'font-weight', '50' ) );
		$this->assertFalse( $this->mapper->supports( 'font-weight', '1000' ) );
		$this->assertFalse( $this->mapper->supports( 'font-weight', '450' ) );
	}

	public function test_rejects_invalid_values() {
		$this->assertFalse( $this->mapper->supports( 'font-weight', 'invalid' ) );
		$this->assertFalse( $this->mapper->supports( 'font-weight', 'medium' ) );
		$this->assertFalse( $this->mapper->supports( 'font-weight', '' ) );
		$this->assertFalse( $this->mapper->supports( 'font-weight', null ) );
	}

	public function test_normalizes_keyword_values() {
		$result = $this->mapper->map_to_schema( 'font-weight', 'normal' );
		$expected = [
			'font-weight' => [
				'$$type' => 'string',
				'value' => '400',
			],
		];
		$this->assertEquals( $expected, $result );

		$result = $this->mapper->map_to_schema( 'font-weight', 'bold' );
		$expected = [
			'font-weight' => [
				'$$type' => 'string',
				'value' => '700',
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_preserves_valid_numeric_values() {
		$result = $this->mapper->map_to_schema( 'font-weight', '600' );
		$expected = [
			'font-weight' => [
				'$$type' => 'string',
				'value' => '600',
			],
		];
		$this->assertEquals( $expected, $result );

		$result = $this->mapper->map_to_schema( 'font-weight', 300 );
		$expected = [
			'font-weight' => [
				'$$type' => 'string',
				'value' => '300',
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_get_supported_properties() {
		$properties = $this->mapper->get_supported_properties();
		$this->assertEquals( [ 'font-weight' ], $properties );
	}
}
