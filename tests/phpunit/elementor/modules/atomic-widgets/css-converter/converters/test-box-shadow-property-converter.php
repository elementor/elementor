<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Box_Shadow_Property_Converter;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Box_Shadow_Property_Converter extends TestCase {
	private Box_Shadow_Property_Converter $converter;
	private Conversion_Context $context;

	public function setUp(): void {
		$this->converter = new Box_Shadow_Property_Converter();
		$this->context   = new Conversion_Context( [] );
	}

	public function test_convert__none_clears_shadow_array() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( 'none' ) );

		// Assert.
		$this->assertTrue( $result );
		$prop = $this->context->get_prop( 'box-shadow' );
		$this->assertSame( 'box-shadow', $prop['$$type'] );
		$this->assertSame( [], $prop['value'] );
	}

	public function test_convert__two_lengths_with_color() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( '2px 4px black' ) );

		// Assert.
		$this->assertTrue( $result );
		$shadow = $this->first_shadow();
		$this->assertEquals( 2, $shadow['hOffset']['value']['size'] );
		$this->assertEquals( 4, $shadow['vOffset']['value']['size'] );
		$this->assertEquals( 0, $shadow['blur']['value']['size'] );
		$this->assertEquals( 0, $shadow['spread']['value']['size'] );
		$this->assertSame( 'black', $shadow['color']['value'] );
		$this->assertArrayNotHasKey( 'position', $shadow );
	}

	public function test_convert__three_lengths_with_rgba_color() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( '0 2px 4px rgba(0,0,0,0.1)' ) );

		// Assert.
		$this->assertTrue( $result );
		$shadow = $this->first_shadow();
		$this->assertEquals( 0, $shadow['hOffset']['value']['size'] );
		$this->assertEquals( 2, $shadow['vOffset']['value']['size'] );
		$this->assertEquals( 4, $shadow['blur']['value']['size'] );
		$this->assertEquals( 0, $shadow['spread']['value']['size'] );
		$this->assertSame( 'rgba(0,0,0,0.1)', $shadow['color']['value'] );
	}

	public function test_convert__four_lengths_with_spread() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( '0 4px 6px -1px #000' ) );

		// Assert.
		$this->assertTrue( $result );
		$shadow = $this->first_shadow();
		$this->assertEquals( 0, $shadow['hOffset']['value']['size'] );
		$this->assertEquals( 4, $shadow['vOffset']['value']['size'] );
		$this->assertEquals( 6, $shadow['blur']['value']['size'] );
		$this->assertEquals( -1, $shadow['spread']['value']['size'] );
		$this->assertSame( '#000', $shadow['color']['value'] );
	}

	public function test_convert__inset_prefix_sets_position() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( 'inset 0 1px 2px #000' ) );

		// Assert.
		$this->assertTrue( $result );
		$shadow = $this->first_shadow();
		$this->assertSame( 'inset', $shadow['position']['value'] );
	}

	public function test_convert__inset_suffix_also_works() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( '0 1px 2px #000 inset' ) );

		// Assert.
		$this->assertTrue( $result );
		$shadow = $this->first_shadow();
		$this->assertSame( 'inset', $shadow['position']['value'] );
	}

	public function test_convert__missing_color_defaults_to_current_color() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( '1px 1px' ) );

		// Assert.
		$this->assertTrue( $result );
		$shadow = $this->first_shadow();
		$this->assertSame( 'currentColor', $shadow['color']['value'] );
	}

	public function test_convert__multiple_layers_emits_array() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( '0 1px 2px #000, 0 2px 4px rgba(0,0,0,0.15)' ) );

		// Assert.
		$this->assertTrue( $result );
		$prop = $this->context->get_prop( 'box-shadow' );
		$this->assertCount( 2, $prop['value'] );
		$this->assertSame( '#000', $prop['value'][0]['value']['color']['value'] );
		$this->assertSame( 'rgba(0,0,0,0.15)', $prop['value'][1]['value']['color']['value'] );
	}

	/** @dataProvider declining_provider */
	public function test_convert__declines_invalid_input( string $value ) {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( $value ) );

		// Assert.
		$this->assertFalse( $result );
		$this->assertNull( $this->context->get_prop( 'box-shadow' ) );
	}

	public static function declining_provider(): array {
		return [
			'empty value'      => [ '' ],
			'one length only'  => [ '5px red' ],
			'five lengths'     => [ '1px 2px 3px 4px 5px black' ],
			'two colors'       => [ '0 1px 2px red blue' ],
			'two insets'       => [ 'inset inset 0 1px 2px #000' ],
			'no lengths'       => [ 'red' ],
			'second layer bad' => [ '0 1px 2px #000, broken garbage' ],
		];
	}

	private function first_shadow(): array {
		$prop = $this->context->get_prop( 'box-shadow' );
		return $prop['value'][0]['value'];
	}

	private function rule( string $value ): array {
		return [
			'property' => 'box-shadow',
			'value' => $value,
			'declaration' => 'box-shadow: ' . $value,
		];
	}
}
