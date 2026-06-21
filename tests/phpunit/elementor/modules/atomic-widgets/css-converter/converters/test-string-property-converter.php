<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\String_Property_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_String_Property_Converter extends TestCase {
	const FONT_WEIGHT_ENUM = [ '100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold', 'bolder', 'lighter' ];

	public function test_convert__emits_canonical_prop_value_that_validates_against_the_prop_type() {
		// Arrange.
		$converter = new String_Property_Converter( 'font-weight', self::FONT_WEIGHT_ENUM );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'font-weight', 'value' => '700' ] );

		// Assert.
		$prop_value = $context->get_prop( 'font-weight' );

		$this->assertTrue( $converted );
		$this->assertSame( [ '$$type' => 'string', 'value' => '700' ], $prop_value );
		$this->assertTrue( String_Prop_Type::make()->enum( self::FONT_WEIGHT_ENUM )->validate( $prop_value ) );
	}

	public function test_convert__trims_surrounding_whitespace() {
		// Arrange.
		$converter = new String_Property_Converter( 'font-weight', self::FONT_WEIGHT_ENUM );
		$context = new Conversion_Context();

		// Act.
		$converter->convert( $context, [ 'property' => 'font-weight', 'value' => '  bold  ' ] );

		// Assert.
		$this->assertSame( [ '$$type' => 'string', 'value' => 'bold' ], $context->get_prop( 'font-weight' ) );
	}

	public function test_convert__declines_value_outside_the_enum() {
		// Arrange.
		$converter = new String_Property_Converter( 'font-weight', self::FONT_WEIGHT_ENUM );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'font-weight', 'value' => '950' ] );

		// Assert.
		$this->assertFalse( $converted );
		$this->assertFalse( $context->has_prop( 'font-weight' ) );
	}

	public function test_convert__declines_empty_value() {
		// Arrange.
		$converter = new String_Property_Converter( 'font-weight', self::FONT_WEIGHT_ENUM );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'font-weight', 'value' => '   ' ] );

		// Assert.
		$this->assertFalse( $converted );
		$this->assertFalse( $context->has_prop( 'font-weight' ) );
	}

	public function test_convert__without_allowlist_accepts_any_non_empty_value() {
		// Arrange.
		$converter = new String_Property_Converter( 'font-family' );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'font-family', 'value' => 'Inter, sans-serif' ] );

		// Assert.
		$this->assertTrue( $converted );
		$this->assertSame( [ '$$type' => 'string', 'value' => 'Inter, sans-serif' ], $context->get_prop( 'font-family' ) );
	}

	public function test_dispatcher__valid_value_lands_in_props() {
		// Arrange.
		$dispatcher = $this->make_dispatcher();

		// Act.
		$result = $dispatcher->convert( 'font-weight: 700;' );

		// Assert.
		$this->assertSame( [ 'font-weight' => [ '$$type' => 'string', 'value' => '700' ] ], $result['props'] );
		$this->assertSame( '', $result['customCss'] );
	}

	public function test_dispatcher__declined_value_is_delegated_to_custom_css() {
		// Arrange.
		$dispatcher = $this->make_dispatcher();

		// Act.
		$result = $dispatcher->convert( 'font-weight: 950;' );

		// Assert.
		$this->assertSame( [], $result['props'] );
		$this->assertSame( 'font-weight: 950;', $result['customCss'] );
	}

	private function make_dispatcher(): Css_Converter {
		$registry = ( new Converter_Registry() )
			->register( new String_Property_Converter( 'font-weight', self::FONT_WEIGHT_ENUM ) );

		return new Css_Converter( $registry, new Null_Failure_Reporter() );
	}
}
