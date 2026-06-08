<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\ValueParsers;

use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Size_Value_Parser;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Size_Value_Parser extends TestCase {

	/**
	 * @dataProvider numeric_values
	 */
	public function test_parse__numeric_value_with_supported_unit( string $input, $expected_size, string $expected_unit ) {
		// Act.
		$parsed = Size_Value_Parser::parse( $input );

		// Assert.
		$this->assertSame( [ 'size' => $expected_size, 'unit' => $expected_unit ], $parsed );
	}

	public function numeric_values(): array {
		return [
			'pixels' => [ '16px', 16, 'px' ],
			'rem' => [ '1.5rem', 1.5, 'rem' ],
			'em' => [ '2em', 2, 'em' ],
			'percent' => [ '50%', 50, '%' ],
			'viewport width' => [ '100vw', 100, 'vw' ],
			'viewport height' => [ '100vh', 100, 'vh' ],
			'fraction' => [ '1fr', 1, 'fr' ],
			'leading dot' => [ '.5em', 0.5, 'em' ],
			'negative' => [ '-10px', -10, 'px' ],
			'uppercase unit is normalized' => [ '10PX', 10, 'px' ],
		];
	}

	public function test_parse__unitless_zero_defaults_to_pixels() {
		// Act & Assert.
		$this->assertSame( [ 'size' => 0, 'unit' => 'px' ], Size_Value_Parser::parse( '0' ) );
	}

	public function test_parse__auto_keyword_maps_to_auto_unit() {
		// Act & Assert.
		$this->assertSame( [ 'size' => null, 'unit' => 'auto' ], Size_Value_Parser::parse( 'auto' ) );
	}

	/**
	 * @dataProvider dynamic_values
	 */
	public function test_parse__dynamic_value_is_kept_verbatim_as_custom( string $input ) {
		// Act.
		$parsed = Size_Value_Parser::parse( $input );

		// Assert.
		$this->assertSame( [ 'size' => $input, 'unit' => 'custom' ], $parsed );
	}

	public function dynamic_values(): array {
		return [
			'calc' => [ 'calc(100% - 20px)' ],
			'clamp' => [ 'clamp(1rem, 2vw, 3rem)' ],
			'min' => [ 'min(10px, 2em)' ],
			'max' => [ 'max(10px, 2em)' ],
			'var' => [ 'var(--w)' ],
			'env' => [ 'env(safe-area-inset-top)' ],
		];
	}

	/**
	 * @dataProvider declined_values
	 */
	public function test_parse__declines_unrepresentable_value( string $input ) {
		// Act & Assert.
		$this->assertNull( Size_Value_Parser::parse( $input ) );
	}

	public function declined_values(): array {
		return [
			'empty' => [ '' ],
			'whitespace' => [ '   ' ],
			'unitless non-zero' => [ '1.5' ],
			'unknown unit' => [ '10xyz' ],
			'non-numeric keyword' => [ 'banana' ],
			'multi value' => [ '10px 20px' ],
			'trailing garbage' => [ '10px!important' ],
		];
	}
}
