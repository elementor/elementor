<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Transform_Origin_Property_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Transform_Property_Converter;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Transform_Origin_Property_Converter extends TestCase {
	private Transform_Origin_Property_Converter $converter;
	private Conversion_Context $context;

	public function setUp(): void {
		$this->converter = new Transform_Origin_Property_Converter();
		$this->context   = new Conversion_Context( [] );
	}

	public function test_convert__single_center_keyword_sets_both_axes_to_50_percent() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( 'center' ) );

		// Assert.
		$this->assertTrue( $result );
		$origin = $this->origin_fields();
		$this->assertSame( 50, $origin['x']['value']['size'] );
		$this->assertSame( '%', $origin['x']['value']['unit'] );
		$this->assertSame( 50, $origin['y']['value']['size'] );
	}

	public function test_convert__single_left_keyword_pins_x_and_centers_y() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( 'left' ) );

		// Assert.
		$this->assertTrue( $result );
		$origin = $this->origin_fields();
		$this->assertSame( 0, $origin['x']['value']['size'] );
		$this->assertSame( 50, $origin['y']['value']['size'] );
	}

	public function test_convert__single_top_keyword_pins_y_and_centers_x() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( 'top' ) );

		// Assert.
		$this->assertTrue( $result );
		$origin = $this->origin_fields();
		$this->assertSame( 50, $origin['x']['value']['size'] );
		$this->assertSame( 0, $origin['y']['value']['size'] );
	}

	public function test_convert__single_length_sets_x_and_defaults_y_to_center() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( '20px' ) );

		// Assert.
		$this->assertTrue( $result );
		$origin = $this->origin_fields();
		$this->assertEquals( 20, $origin['x']['value']['size'] );
		$this->assertSame( 'px', $origin['x']['value']['unit'] );
		$this->assertSame( 50, $origin['y']['value']['size'] );
	}

	public function test_convert__two_values_with_keywords() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( 'right bottom' ) );

		// Assert.
		$this->assertTrue( $result );
		$origin = $this->origin_fields();
		$this->assertSame( 100, $origin['x']['value']['size'] );
		$this->assertSame( 100, $origin['y']['value']['size'] );
	}

	public function test_convert__two_values_with_lengths_and_percents() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( '10px 25%' ) );

		// Assert.
		$this->assertTrue( $result );
		$origin = $this->origin_fields();
		$this->assertEquals( 10, $origin['x']['value']['size'] );
		$this->assertSame( 'px', $origin['x']['value']['unit'] );
		$this->assertEquals( 25, $origin['y']['value']['size'] );
		$this->assertSame( '%', $origin['y']['value']['unit'] );
	}

	public function test_convert__three_values_include_z_length() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( 'left top 5px' ) );

		// Assert.
		$this->assertTrue( $result );
		$origin = $this->origin_fields();
		$this->assertSame( 0, $origin['x']['value']['size'] );
		$this->assertSame( 0, $origin['y']['value']['size'] );
		$this->assertEquals( 5, $origin['z']['value']['size'] );
		$this->assertSame( 'px', $origin['z']['value']['unit'] );
	}

	public function test_convert__merges_with_existing_transform_functions() {
		// Arrange.
		( new Transform_Property_Converter() )->convert( $this->context, $this->rule_for( 'transform', 'rotate(45deg)' ) );

		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( 'center' ) );

		// Assert.
		$this->assertTrue( $result );
		$transform = $this->context->get_prop( 'transform' );
		$this->assertArrayHasKey( 'transform-functions', $transform['value'] );
		$this->assertArrayHasKey( 'transform-origin', $transform['value'] );
	}

	/** @dataProvider declining_provider */
	public function test_convert__declines_invalid_input( string $value ) {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( $value ) );

		// Assert.
		$this->assertFalse( $result );
		$this->assertNull( $this->context->get_prop( 'transform' ) );
	}

	public static function declining_provider(): array {
		return [
			'four tokens'        => [ '10px 10px 10px 10px' ],
			'empty'              => [ '' ],
			'z as percent'       => [ '10px 10px 50%' ],
			'invalid unit'       => [ '10s' ],
			'unknown keyword'    => [ 'middle' ],
		];
	}

	private function origin_fields(): array {
		$transform = $this->context->get_prop( 'transform' );
		return $transform['value']['transform-origin']['value'];
	}

	private function rule( string $value ): array {
		return $this->rule_for( 'transform-origin', $value );
	}

	private function rule_for( string $property, string $value ): array {
		return [ 'property' => $property, 'value' => $value, 'declaration' => "$property: $value" ];
	}
}
