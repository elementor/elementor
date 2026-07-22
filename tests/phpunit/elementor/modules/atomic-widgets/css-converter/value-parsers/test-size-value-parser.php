<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\ValueParsers;

use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Size_Plain_Resolver;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Size_Plain_Resolver extends TestCase {

	/**
	 * @dataProvider numeric_values
	 */
	public function test_parse__numeric_value_with_supported_unit( string $input, $expected_size, string $expected_unit ) {
		// Act.
		$parsed = Size_Plain_Resolver::parse( $input );

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
		$this->assertSame( [ 'size' => 0, 'unit' => 'px' ], Size_Plain_Resolver::parse( '0' ) );
	}

	public function test_parse__auto_keyword_maps_to_auto_unit() {
		// Act & Assert.
		$this->assertSame( [ 'size' => null, 'unit' => 'auto' ], Size_Plain_Resolver::parse( 'auto' ) );
	}

	public function test_parse__unitless_non_zero_declines_by_default() {
		// Act & Assert.
		$this->assertNull( Size_Plain_Resolver::parse( '1.1' ) );
	}

	public function test_parse__unitless_non_zero_is_kept_as_custom_when_allowed() {
		// Act & Assert: the raw token is preserved verbatim so it renders without a unit.
		$this->assertSame( [ 'size' => '1.1', 'unit' => 'custom' ], Size_Plain_Resolver::parse( '1.1', true ) );
	}

	public function test_parse__unitless_zero_stays_pixels_even_when_unitless_allowed() {
		// Act & Assert.
		$this->assertSame( [ 'size' => 0, 'unit' => 'px' ], Size_Plain_Resolver::parse( '0', true ) );
	}

	public function test_parse__value_with_unit_ignores_unitless_flag() {
		// Act & Assert.
		$this->assertSame( [ 'size' => 24, 'unit' => 'px' ], Size_Plain_Resolver::parse( '24px', true ) );
	}

	/**
	 * @dataProvider dynamic_values
	 */
	public function test_parse__dynamic_value_is_kept_verbatim_as_custom( string $input ) {
		// Act.
		$parsed = Size_Plain_Resolver::parse( $input );

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
		$this->assertNull( Size_Plain_Resolver::parse( $input ) );
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
