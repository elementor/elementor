<?php
namespace Elementor\Testing\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\CssConverter\ClassConvertors\Text_Align_Property_Mapper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group css-converter-mappers
 */
class Test_Text_Align_Property_Mapper extends Elementor_Test_Base {
	private $mapper;

	public function setUp(): void {
		parent::setUp();
		$this->mapper = new Text_Align_Property_Mapper();
	}

	public function test_supports_text_align_property_only() {
		$this->assertTrue( $this->mapper->supports( 'text-align', 'center' ) );
		$this->assertFalse( $this->mapper->supports( 'text-decoration', 'center' ) );
		$this->assertFalse( $this->mapper->supports( 'vertical-align', 'center' ) );
	}

	public function test_supports_standard_alignment_values() {
		$this->assertTrue( $this->mapper->supports( 'text-align', 'left' ) );
		$this->assertTrue( $this->mapper->supports( 'text-align', 'center' ) );
		$this->assertTrue( $this->mapper->supports( 'text-align', 'right' ) );
		$this->assertTrue( $this->mapper->supports( 'text-align', 'justify' ) );
	}

	public function test_supports_logical_alignment_values() {
		$this->assertTrue( $this->mapper->supports( 'text-align', 'start' ) );
		$this->assertTrue( $this->mapper->supports( 'text-align', 'end' ) );
	}

	public function test_case_insensitive_support() {
		$this->assertTrue( $this->mapper->supports( 'text-align', 'CENTER' ) );
		$this->assertTrue( $this->mapper->supports( 'text-align', 'Left' ) );
		$this->assertTrue( $this->mapper->supports( 'text-align', 'RIGHT' ) );
	}

	public function test_rejects_invalid_values() {
		$this->assertFalse( $this->mapper->supports( 'text-align', 'middle' ) );
		$this->assertFalse( $this->mapper->supports( 'text-align', 'top' ) );
		$this->assertFalse( $this->mapper->supports( 'text-align', 'bottom' ) );
		$this->assertFalse( $this->mapper->supports( 'text-align', 'invalid' ) );
		$this->assertFalse( $this->mapper->supports( 'text-align', '' ) );
		$this->assertFalse( $this->mapper->supports( 'text-align', null ) );
	}

	public function test_normalizes_case() {
		$result = $this->mapper->map_to_schema( 'text-align', 'CENTER' );
		$expected = [
			'text-align' => [
				'$$type' => 'string',
				'value' => 'center',
			],
		];
		$this->assertEquals( $expected, $result );

		$result = $this->mapper->map_to_schema( 'text-align', 'Left' );
		$expected = [
			'text-align' => [
				'$$type' => 'string',
				'value' => 'left',
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_all_valid_values() {
		$valid_values = [ 'left', 'center', 'right', 'justify', 'start', 'end' ];

		foreach ( $valid_values as $value ) {
			$result = $this->mapper->map_to_schema( 'text-align', $value );
			$expected = [
				'text-align' => [
					'$$type' => 'string',
					'value' => $value,
				],
			];
			$this->assertEquals( $expected, $result );
		}
	}

	public function test_get_supported_properties() {
		$properties = $this->mapper->get_supported_properties();
		$this->assertEquals( [ 'text-align' ], $properties );
	}

	public function test_supports_v4_conversion() {
		$this->assertTrue( $this->mapper->supports_v4_conversion( 'text-align', 'center' ) );
		$this->assertFalse( $this->mapper->supports_v4_conversion( 'color', 'center' ) );
	}

	public function test_get_v4_property_name() {
		$this->assertEquals( 'text-align', $this->mapper->get_v4_property_name( 'text-align' ) );
	}

	public function test_map_to_v4_atomic_text_align() {
		$result = $this->mapper->map_to_v4_atomic( 'text-align', 'center' );
		$expected = [
			'property' => 'text-align',
			'value' => [
				'$$type' => 'string',
				'value' => 'center',
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_map_to_v4_atomic_normalizes_case() {
		$result = $this->mapper->map_to_v4_atomic( 'text-align', 'CENTER' );
		$expected = [
			'property' => 'text-align',
			'value' => [
				'$$type' => 'string',
				'value' => 'center',
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_map_to_v4_atomic_unsupported_property() {
		$result = $this->mapper->map_to_v4_atomic( 'color', 'center' );
		$this->assertNull( $result );
	}
}
