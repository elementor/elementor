<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Object_Position_Property_Converter;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Object_Position_Property_Converter extends TestCase {
	private Object_Position_Property_Converter $converter;
	private Conversion_Context $context;

	public function setUp(): void {
		$this->converter = new Object_Position_Property_Converter();
		$this->context   = new Conversion_Context( [] );
	}

	/** @dataProvider named_position_provider */
	public function test_convert__named_position_emits_string_prop_value( string $value ) {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( $value ) );

		// Assert.
		$this->assertTrue( $result );
		$this->assertSame( [ '$$type' => 'string', 'value' => $value ], $this->context->get_prop( 'object-position' ) );
	}

	public static function named_position_provider(): array {
		return [
			'center center' => [ 'center center' ],
			'top left'      => [ 'top left' ],
			'bottom right'  => [ 'bottom right' ],
			'top center'    => [ 'top center' ],
		];
	}

	public function test_convert__percentage_pair_emits_position_prop_value() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( '50% 30%' ) );

		// Assert.
		$this->assertTrue( $result );
		$prop = $this->context->get_prop( 'object-position' );
		$this->assertSame( 'object-position', $prop['$$type'] );
		$this->assertEquals( 50, $prop['value']['x']['value']['size'] );
		$this->assertSame( '%', $prop['value']['x']['value']['unit'] );
		$this->assertEquals( 30, $prop['value']['y']['value']['size'] );
		$this->assertSame( '%', $prop['value']['y']['value']['unit'] );
	}

	public function test_convert__pixel_pair_emits_position_prop_value() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( '10px 20px' ) );

		// Assert.
		$this->assertTrue( $result );
		$prop = $this->context->get_prop( 'object-position' );
		$this->assertSame( 'object-position', $prop['$$type'] );
		$this->assertEquals( 10, $prop['value']['x']['value']['size'] );
		$this->assertSame( 'px', $prop['value']['x']['value']['unit'] );
		$this->assertEquals( 20, $prop['value']['y']['value']['size'] );
		$this->assertSame( 'px', $prop['value']['y']['value']['unit'] );
	}

	/** @dataProvider declining_provider */
	public function test_convert__declines_unsupported_values( string $value ) {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( $value ) );

		// Assert.
		$this->assertFalse( $result );
		$this->assertNull( $this->context->get_prop( 'object-position' ) );
	}

	public static function declining_provider(): array {
		return [
			'single keyword'       => [ 'center' ],
			'three tokens'         => [ '10px 20px 30px' ],
			'non-size second token' => [ '10px banana' ],
			'unknown keyword pair' => [ 'left middle' ],
		];
	}

	private function rule( string $value ): array {
		return [ 'property' => 'object-position', 'value' => $value ];
	}
}
