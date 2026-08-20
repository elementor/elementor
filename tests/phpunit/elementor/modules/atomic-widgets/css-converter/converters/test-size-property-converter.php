<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Size_Property_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Size_Property_Converter extends TestCase {

	public function test_convert__emits_canonical_prop_value_that_validates_against_the_prop_type() {
		// Arrange.
		$converter = new Size_Property_Converter( 'width' );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'width', 'value' => '10px' ] );

		// Assert.
		$prop_value = $context->get_prop( 'width' );

		$this->assertTrue( $converted );
		$this->assertSame( [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'px' ] ], $prop_value );
		$this->assertTrue( Size_Prop_Type::make()->validate( $prop_value ) );
	}

	public function test_convert__emits_custom_unit_for_dynamic_value() {
		// Arrange.
		$converter = new Size_Property_Converter( 'width' );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'width', 'value' => 'calc(100% - 20px)' ] );

		// Assert.
		$prop_value = $context->get_prop( 'width' );

		$this->assertTrue( $converted );
		$this->assertSame( [ '$$type' => 'size', 'value' => [ 'size' => 'calc(100% - 20px)', 'unit' => 'custom' ] ], $prop_value );
		$this->assertTrue( Size_Prop_Type::make()->validate( $prop_value ) );
	}

	public function test_convert__emits_auto_unit_that_validates() {
		// Arrange.
		$converter = new Size_Property_Converter( 'height' );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'height', 'value' => 'auto' ] );

		// Assert.
		$prop_value = $context->get_prop( 'height' );

		$this->assertTrue( $converted );
		$this->assertSame( [ '$$type' => 'size', 'value' => [ 'size' => null, 'unit' => 'auto' ] ], $prop_value );
		$this->assertTrue( Size_Prop_Type::make()->validate( $prop_value ) );
	}

	public function test_convert__keeps_unitless_line_height_as_custom_when_allowed() {
		// Arrange.
		$converter = new Size_Property_Converter( 'line-height', true );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'line-height', 'value' => '1.1' ] );

		// Assert.
		$prop_value = $context->get_prop( 'line-height' );

		$this->assertTrue( $converted );
		$this->assertSame( [ '$$type' => 'size', 'value' => [ 'size' => '1.1', 'unit' => 'custom' ] ], $prop_value );
		$this->assertTrue( Size_Prop_Type::make()->validate( $prop_value ) );
	}

	public function test_convert__declines_unitless_value_without_the_flag() {
		// Arrange.
		$converter = new Size_Property_Converter( 'width' );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'width', 'value' => '1.1' ] );

		// Assert.
		$this->assertFalse( $converted );
		$this->assertFalse( $context->has_prop( 'width' ) );
	}

	public function test_convert__declines_unrepresentable_value() {
		// Arrange.
		$converter = new Size_Property_Converter( 'width' );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'width', 'value' => 'banana' ] );

		// Assert.
		$this->assertFalse( $converted );
		$this->assertFalse( $context->has_prop( 'width' ) );
	}

	public function test_dispatcher__valid_value_lands_in_props() {
		// Arrange.
		$dispatcher = $this->make_dispatcher();

		// Act.
		$result = $dispatcher->convert( 'width: 10px;' );

		// Assert.
		$this->assertSame(
			[ 'width' => [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'px' ] ] ],
			$result['props']
		);
		$this->assertSame( '', $result['customCss'] );
	}

	public function test_dispatcher__declined_value_is_delegated_to_custom_css() {
		// Arrange.
		$dispatcher = $this->make_dispatcher();

		// Act.
		$result = $dispatcher->convert( 'width: banana;' );

		// Assert.
		$this->assertSame( [], $result['props'] );
		$this->assertSame( 'width: banana;', $result['customCss'] );
	}

	/**
	 * @dataProvider opacity_decimal_provider
	 */
	public function test_convert__opacity_decimal_normalizes_to_percent( string $value, $expected_size ): void {
		// Arrange.
		$converter = new Size_Property_Converter( 'opacity' );
		$context   = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'opacity', 'value' => $value ] );

		// Assert.
		$prop_value = $context->get_prop( 'opacity' );

		$this->assertTrue( $converted );
		$this->assertTrue( Size_Prop_Type::make()->validate( $prop_value ) );
		$this->assertSame( Size_Constants::UNIT_PERCENT, $prop_value['value']['unit'] );
		$this->assertSame( $expected_size, $prop_value['value']['size'] );
	}

	public static function opacity_decimal_provider(): array {
		return [
			'mid-range decimal' => [ '0.85',   85.0  ],
			'zero'              => [ '0',       0     ],
			'one'               => [ '1',       100.0 ],
			'precision'         => [ '0.3333',  33.33 ],
			'over-range'        => [ '1.5',     100.0 ],
			'negative'          => [ '-0.5',    0     ],
		];
	}

	public function test_convert__opacity_percent_passthrough_validates(): void {
		// Arrange.
		$converter = new Size_Property_Converter( 'opacity' );
		$context   = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'opacity', 'value' => '85%' ] );

		// Assert.
		$prop_value = $context->get_prop( 'opacity' );

		$this->assertTrue( $converted );
		$this->assertTrue( Size_Prop_Type::make()->validate( $prop_value ) );
		$this->assertSame( Size_Constants::UNIT_PERCENT, $prop_value['value']['unit'] );
	}

	public function test_convert__opacity_dynamic_value_uses_custom_unit(): void {
		// Arrange.
		$converter = new Size_Property_Converter( 'opacity' );
		$context   = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'opacity', 'value' => 'calc(100% - 10%)' ] );

		// Assert.
		$prop_value = $context->get_prop( 'opacity' );

		$this->assertTrue( $converted );
		$this->assertTrue( Size_Prop_Type::make()->validate( $prop_value ) );
		$this->assertSame( Size_Constants::UNIT_CUSTOM, $prop_value['value']['unit'] );
	}

	public function test_convert__opacity_invalid_value_declines(): void {
		// Arrange.
		$converter = new Size_Property_Converter( 'opacity' );
		$context   = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'opacity', 'value' => 'banana' ] );

		// Assert.
		$this->assertFalse( $converted );
		$this->assertFalse( $context->has_prop( 'opacity' ) );
	}

	private function make_dispatcher(): Css_Converter {
		$registry = ( new Converter_Registry() )
			->register( new Size_Property_Converter( 'width' ) );

		return new Css_Converter( $registry, new Null_Failure_Reporter() );
	}
}
