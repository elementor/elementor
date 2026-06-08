<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Color_Property_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Color_Property_Converter extends TestCase {

	/**
	 * @dataProvider color_values
	 */
	public function test_convert__emits_canonical_prop_value_that_validates_against_the_prop_type( string $input, string $expected ) {
		// Arrange.
		$converter = new Color_Property_Converter( 'color' );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'color', 'value' => $input ] );

		// Assert.
		$prop_value = $context->get_prop( 'color' );

		$this->assertTrue( $converted );
		$this->assertSame( [ '$$type' => 'color', 'value' => $expected ], $prop_value );
		$this->assertTrue( Color_Prop_Type::make()->validate( $prop_value ) );
	}

	public function color_values(): array {
		return [
			'named' => [ 'whitesmoke', 'whitesmoke' ],
			'hex' => [ '#2d2a26', '#2d2a26' ],
			'rgb' => [ 'rgb(255, 0, 0)', 'rgb(255, 0, 0)' ],
			'hsl' => [ 'hsl(120, 50%, 50%)', 'hsl(120, 50%, 50%)' ],
			'keyword' => [ 'transparent', 'transparent' ],
			'variable' => [ 'var(--c)', 'var(--c)' ],
			'trimmed' => [ '  red  ', 'red' ],
		];
	}

	public function test_convert__declines_empty_value() {
		// Arrange.
		$converter = new Color_Property_Converter( 'color' );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'color', 'value' => '   ' ] );

		// Assert.
		$this->assertFalse( $converted );
		$this->assertFalse( $context->has_prop( 'color' ) );
	}

	public function test_dispatcher__valid_value_lands_in_props() {
		// Arrange.
		$dispatcher = $this->make_dispatcher();

		// Act.
		$result = $dispatcher->convert( 'color: whitesmoke;' );

		// Assert.
		$this->assertSame( [ 'color' => [ '$$type' => 'color', 'value' => 'whitesmoke' ] ], $result['props'] );
		$this->assertSame( '', $result['customCss'] );
	}

	private function make_dispatcher(): Css_Converter {
		$registry = ( new Converter_Registry() )
			->register( new Color_Property_Converter( 'color' ) );

		return new Css_Converter( $registry, new Null_Failure_Reporter() );
	}
}
