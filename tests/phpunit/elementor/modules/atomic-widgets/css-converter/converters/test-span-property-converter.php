<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Span_Property_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\AtomicWidgets\PropTypes\Span_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Span_Property_Converter extends TestCase {
	const GRID_PATTERN = '/^(?!.*https?:\/\/)(?!.*;).*$/';

	/**
	 * @dataProvider valid_values
	 */
	public function test_convert__emits_canonical_prop_value_that_validates_against_the_prop_type( string $value ) {
		// Arrange.
		$converter = new Span_Property_Converter( 'grid-column', self::GRID_PATTERN );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'grid-column', 'value' => $value ] );

		// Assert.
		$prop_value = $context->get_prop( 'grid-column' );

		$this->assertTrue( $converted );
		$this->assertSame( [ '$$type' => 'span', 'value' => $value ], $prop_value );
		$this->assertTrue( Span_Prop_Type::make()->regex( self::GRID_PATTERN )->validate( $prop_value ) );
	}

	public function valid_values(): array {
		return [
			'span keyword' => [ 'span 2' ],
			'line range' => [ '1 / 3' ],
			'auto' => [ 'auto' ],
			'named line' => [ 'col-start / col-end' ],
		];
	}

	public function test_convert__trims_surrounding_whitespace() {
		// Arrange.
		$converter = new Span_Property_Converter( 'grid-row', self::GRID_PATTERN );
		$context = new Conversion_Context();

		// Act.
		$converter->convert( $context, [ 'property' => 'grid-row', 'value' => '  span 3  ' ] );

		// Assert.
		$this->assertSame( [ '$$type' => 'span', 'value' => 'span 3' ], $context->get_prop( 'grid-row' ) );
	}

	public function test_convert__declines_value_that_violates_the_pattern() {
		// Arrange.
		$converter = new Span_Property_Converter( 'grid-column', self::GRID_PATTERN );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'grid-column', 'value' => 'url(https://evil.example)' ] );

		// Assert.
		$this->assertFalse( $converted );
		$this->assertFalse( $context->has_prop( 'grid-column' ) );
	}

	public function test_convert__declines_empty_value() {
		// Arrange.
		$converter = new Span_Property_Converter( 'grid-column', self::GRID_PATTERN );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'grid-column', 'value' => '   ' ] );

		// Assert.
		$this->assertFalse( $converted );
		$this->assertFalse( $context->has_prop( 'grid-column' ) );
	}

	public function test_convert__without_pattern_accepts_any_non_empty_value() {
		// Arrange.
		$converter = new Span_Property_Converter( 'grid-column' );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'grid-column', 'value' => 'span 5' ] );

		// Assert.
		$this->assertTrue( $converted );
		$this->assertSame( [ '$$type' => 'span', 'value' => 'span 5' ], $context->get_prop( 'grid-column' ) );
	}

	public function test_dispatcher__valid_value_lands_in_props() {
		// Arrange.
		$dispatcher = $this->make_dispatcher();

		// Act.
		$result = $dispatcher->convert( 'grid-column: span 2;' );

		// Assert.
		$this->assertSame( [ 'grid-column' => [ '$$type' => 'span', 'value' => 'span 2' ] ], $result['props'] );
		$this->assertSame( '', $result['customCss'] );
	}

	public function test_dispatcher__declined_value_is_delegated_to_custom_css() {
		// Arrange.
		$dispatcher = $this->make_dispatcher();

		// Act.
		$result = $dispatcher->convert( 'grid-column: url(https://evil.example);' );

		// Assert.
		$this->assertSame( [], $result['props'] );
		$this->assertSame( 'grid-column: url(https://evil.example);', $result['customCss'] );
	}

	private function make_dispatcher(): Css_Converter {
		$registry = ( new Converter_Registry() )
			->register( new Span_Property_Converter( 'grid-column', self::GRID_PATTERN ) );

		return new Css_Converter( $registry, new Null_Failure_Reporter() );
	}
}
