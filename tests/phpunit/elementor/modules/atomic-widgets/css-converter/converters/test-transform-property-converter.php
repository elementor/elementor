<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Transform_Property_Converter;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Transform_Property_Converter extends TestCase {
	private Transform_Property_Converter $converter;
	private Conversion_Context $context;

	public function setUp(): void {
		$this->converter = new Transform_Property_Converter();
		$this->context   = new Conversion_Context( [] );
	}

	public function test_convert__translate_single_arg_emits_move_with_zero_y_z() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( 'translate(50%)' ) );

		// Assert.
		$this->assertTrue( $result );
		$fn = $this->first_function();
		$this->assertSame( 'transform-move', $fn['$$type'] );
		$this->assertSame( '%', $fn['value']['x']['value']['unit'] );
		$this->assertSame( 'px', $fn['value']['y']['value']['unit'] );
		$this->assertEquals( 0, $fn['value']['y']['value']['size'] );
	}

	public function test_convert__translateX_emits_move_with_x_set() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( 'translateX(10px)' ) );

		// Assert.
		$this->assertTrue( $result );
		$fn = $this->first_function();
		$this->assertSame( 'transform-move', $fn['$$type'] );
		$this->assertEquals( 10, $fn['value']['x']['value']['size'] );
		$this->assertSame( 'px', $fn['value']['x']['value']['unit'] );
		$this->assertEquals( 0, $fn['value']['y']['value']['size'] );
		$this->assertEquals( 0, $fn['value']['z']['value']['size'] );
	}

	public function test_convert__scale_single_arg_applies_to_x_and_y() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( 'scale(1.5)' ) );

		// Assert.
		$this->assertTrue( $result );
		$fn = $this->first_function();
		$this->assertSame( 'transform-scale', $fn['$$type'] );
		$this->assertSame( 1.5, $fn['value']['x']['value'] );
		$this->assertSame( 1.5, $fn['value']['y']['value'] );
		$this->assertSame( 1.0, $fn['value']['z']['value'] );
	}

	public function test_convert__scaleX_sets_x_only() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( 'scaleX(2)' ) );

		// Assert.
		$this->assertTrue( $result );
		$fn = $this->first_function();
		$this->assertSame( 'transform-scale', $fn['$$type'] );
		$this->assertSame( 2.0, $fn['value']['x']['value'] );
		$this->assertSame( 1.0, $fn['value']['y']['value'] );
		$this->assertSame( 1.0, $fn['value']['z']['value'] );
	}

	public function test_convert__rotate_emits_rotate_on_z_axis() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( 'rotate(45deg)' ) );

		// Assert.
		$this->assertTrue( $result );
		$fn = $this->first_function();
		$this->assertSame( 'transform-rotate', $fn['$$type'] );
		$this->assertEquals( 45, $fn['value']['z']['value']['size'] );
		$this->assertSame( 'deg', $fn['value']['z']['value']['unit'] );
		$this->assertEquals( 0, $fn['value']['x']['value']['size'] );
	}

	public function test_convert__rotateY_with_rad_unit() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( 'rotateY(1.5rad)' ) );

		// Assert.
		$this->assertTrue( $result );
		$fn = $this->first_function();
		$this->assertSame( 'transform-rotate', $fn['$$type'] );
		$this->assertSame( 'rad', $fn['value']['y']['value']['unit'] );
	}

	public function test_convert__multiple_functions_chained() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( 'translateX(10px) rotate(45deg) scale(1.5)' ) );

		// Assert.
		$this->assertTrue( $result );
		$prop = $this->context->get_prop( 'transform' );
		$functions = $prop['value']['transform-functions']['value'];
		$this->assertCount( 3, $functions );
		$this->assertSame( 'transform-move', $functions[0]['$$type'] );
		$this->assertSame( 'transform-rotate', $functions[1]['$$type'] );
		$this->assertSame( 'transform-scale', $functions[2]['$$type'] );
	}

	/** @dataProvider declining_provider */
	public function test_convert__declines_unsupported_functions( string $value ) {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( $value ) );

		// Assert.
		$this->assertFalse( $result );
		$this->assertNull( $this->context->get_prop( 'transform' ) );
	}

	public static function declining_provider(): array {
		return [
			'matrix'         => [ 'matrix(1,0,0,1,0,0)' ],
			'perspective fn' => [ 'perspective(500px)' ],
			'skew'           => [ 'skewX(10deg)' ],
			'rotate3d'       => [ 'rotate3d(1,0,0,45deg)' ],
			'invalid unit'   => [ 'translateX(10s)' ],
			'non-numeric scale' => [ 'scale(foo)' ],
		];
	}

	private function first_function(): array {
		$prop = $this->context->get_prop( 'transform' );
		return $prop['value']['transform-functions']['value'][0];
	}

	private function rule( string $value ): array {
		return [ 'property' => 'transform', 'value' => $value, 'declaration' => "transform: $value" ];
	}
}
