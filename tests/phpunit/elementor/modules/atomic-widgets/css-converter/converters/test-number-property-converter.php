<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Number_Property_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Number_Property_Converter extends TestCase {

	public function test_convert__emits_canonical_prop_value_that_validates_against_the_prop_type() {
		// Arrange.
		$converter = new Number_Property_Converter( 'z-index' );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'z-index', 'value' => '5' ] );

		// Assert.
		$prop_value = $context->get_prop( 'z-index' );

		$this->assertTrue( $converted );
		$this->assertSame( [ '$$type' => 'number', 'value' => 5 ], $prop_value );
		$this->assertTrue( Number_Prop_Type::make()->validate( $prop_value ) );
	}

	public function test_convert__accepts_negative_integer() {
		// Arrange.
		$converter = new Number_Property_Converter( 'order' );
		$context = new Conversion_Context();

		// Act.
		$converter->convert( $context, [ 'property' => 'order', 'value' => '-1' ] );

		// Assert.
		$this->assertSame( [ '$$type' => 'number', 'value' => -1 ], $context->get_prop( 'order' ) );
	}

	/**
	 * @dataProvider non_numeric_values
	 */
	public function test_convert__declines_non_numeric_value( string $value ) {
		// Arrange.
		$converter = new Number_Property_Converter( 'z-index' );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'z-index', 'value' => $value ] );

		// Assert.
		$this->assertFalse( $converted );
		$this->assertFalse( $context->has_prop( 'z-index' ) );
	}

	public function non_numeric_values(): array {
		return [
			'with unit' => [ '10px' ],
			'function' => [ 'calc(1 + 1)' ],
			'keyword' => [ 'auto' ],
			'empty' => [ '   ' ],
		];
	}

	public function test_dispatcher__valid_value_lands_in_props() {
		// Arrange.
		$dispatcher = $this->make_dispatcher();

		// Act.
		$result = $dispatcher->convert( 'z-index: 5;' );

		// Assert.
		$this->assertSame( [ 'z-index' => [ '$$type' => 'number', 'value' => 5 ] ], $result['props'] );
		$this->assertSame( '', $result['customCss'] );
	}

	public function test_dispatcher__declined_value_is_delegated_to_custom_css() {
		// Arrange.
		$dispatcher = $this->make_dispatcher();

		// Act.
		$result = $dispatcher->convert( 'z-index: calc(1 + 1);' );

		// Assert.
		$this->assertSame( [], $result['props'] );
		$this->assertSame( 'z-index: calc(1 + 1);', $result['customCss'] );
	}

	private function make_dispatcher(): Css_Converter {
		$registry = ( new Converter_Registry() )
			->register( new Number_Property_Converter( 'z-index' ) );

		return new Css_Converter( $registry, new Null_Failure_Reporter() );
	}
}
