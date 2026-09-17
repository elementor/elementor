<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Filter_Property_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\AtomicWidgets\PropTypes\Filters\Backdrop_Filter_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Filters\Filter_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Filter_Property_Converter extends TestCase {

	public function test_convert__emits_a_filter_prop_value_that_validates_against_the_prop_type() {
		// Arrange.
		$converter = new Filter_Property_Converter( 'filter', Filter_Prop_Type::get_key() );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'filter', 'value' => 'blur(5px) brightness(150%)' ] );

		// Assert.
		$prop_value = $context->get_prop( 'filter' );

		$this->assertTrue( $converted );
		$this->assertSame( 'filter', $prop_value['$$type'] );
		$this->assertCount( 2, $prop_value['value'] );
		$this->assertTrue( Filter_Prop_Type::make()->validate( $prop_value ) );
	}

	public function test_convert__drop_shadow_validates_against_the_prop_type() {
		// Arrange.
		$converter = new Filter_Property_Converter( 'filter', Filter_Prop_Type::get_key() );
		$context = new Conversion_Context();

		// Act.
		$converter->convert( $context, [ 'property' => 'filter', 'value' => 'drop-shadow(2px 4px 6px black)' ] );

		// Assert.
		$this->assertTrue( Filter_Prop_Type::make()->validate( $context->get_prop( 'filter' ) ) );
	}

	public function test_convert__backdrop_filter_wraps_with_its_own_type_key() {
		// Arrange.
		$converter = new Filter_Property_Converter( 'backdrop-filter', Backdrop_Filter_Prop_Type::get_key() );
		$context = new Conversion_Context();

		// Act.
		$converter->convert( $context, [ 'property' => 'backdrop-filter', 'value' => 'blur(10px)' ] );

		// Assert.
		$prop_value = $context->get_prop( 'backdrop-filter' );

		$this->assertSame( 'backdrop-filter', $prop_value['$$type'] );
		$this->assertTrue( Backdrop_Filter_Prop_Type::make()->validate( $prop_value ) );
	}

	public function test_convert__declines_unsupported_function() {
		// Arrange.
		$converter = new Filter_Property_Converter( 'filter', Filter_Prop_Type::get_key() );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'filter', 'value' => 'opacity(50%)' ] );

		// Assert.
		$this->assertFalse( $converted );
		$this->assertFalse( $context->has_prop( 'filter' ) );
	}

	public function test_dispatcher__valid_value_lands_in_props() {
		// Arrange.
		$dispatcher = $this->make_dispatcher();

		// Act.
		$result = $dispatcher->convert( 'filter: blur(5px);' );

		// Assert.
		$this->assertArrayHasKey( 'filter', $result['props'] );
		$this->assertSame( 'filter', $result['props']['filter']['$$type'] );
		$this->assertSame( '', $result['customCss'] );
	}

	public function test_dispatcher__declined_value_is_delegated_to_custom_css() {
		// Arrange.
		$dispatcher = $this->make_dispatcher();

		// Act.
		$result = $dispatcher->convert( 'filter: opacity(50%);' );

		// Assert.
		$this->assertSame( [], $result['props'] );
		$this->assertSame( 'filter: opacity(50%);', $result['customCss'] );
	}

	private function make_dispatcher(): Css_Converter {
		$registry = ( new Converter_Registry() )
			->register( new Filter_Property_Converter( 'filter', Filter_Prop_Type::get_key() ) );

		return new Css_Converter( $registry, new Null_Failure_Reporter() );
	}
}
