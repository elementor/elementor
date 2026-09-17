<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\ValueParsers;

use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Box_Shorthand_Parser;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Box_Shorthand_Parser extends TestCase {

	public function test_parse__single_value_returns_a_single_leaf() {
		// Act & Assert.
		$this->assertSame( [ 'single' => $this->px( 10 ) ], Box_Shorthand_Parser::parse( '10px' ) );
	}

	public function test_parse__two_values_expand_to_four_sides() {
		// Act & Assert.
		$this->assertSame(
			[ 'sides' => [ $this->px( 10 ), $this->px( 20 ), $this->px( 10 ), $this->px( 20 ) ] ],
			Box_Shorthand_Parser::parse( '10px 20px' )
		);
	}

	public function test_parse__three_values_expand_to_four_sides() {
		// Act & Assert: [ a, b, c, b ].
		$this->assertSame(
			[ 'sides' => [ $this->px( 1 ), $this->px( 2 ), $this->px( 3 ), $this->px( 2 ) ] ],
			Box_Shorthand_Parser::parse( '1px 2px 3px' )
		);
	}

	public function test_parse__four_values_map_in_order() {
		// Act & Assert.
		$this->assertSame(
			[ 'sides' => [ $this->px( 1 ), $this->px( 2 ), $this->px( 3 ), $this->px( 4 ) ] ],
			Box_Shorthand_Parser::parse( '1px 2px 3px 4px' )
		);
	}

	public function test_parse__keeps_calc_division_as_one_token() {
		// Act: a "/" inside calc() must not be treated as an elliptical separator.
		$result = Box_Shorthand_Parser::parse( 'calc(100% / 4)' );

		// Assert.
		$this->assertSame(
			[ 'single' => [ 'size' => 'calc(100% / 4)', 'unit' => 'custom' ] ],
			$result
		);
	}

	/**
	 * @dataProvider declined_values
	 */
	public function test_parse__declines_unrepresentable_value( string $value ) {
		// Act & Assert.
		$this->assertNull( Box_Shorthand_Parser::parse( $value ) );
	}

	public function declined_values(): array {
		return [
			'empty' => [ '   ' ],
			'too many values' => [ '1px 2px 3px 4px 5px' ],
			'non-size token' => [ 'banana' ],
			'one bad token among good' => [ '10px banana' ],
			'elliptical spaced slash' => [ '10px / 20px' ],
			'elliptical glued slash' => [ '10px/20px' ],
			'elliptical four plus slash' => [ '10px 20px 30px 40px / 50px' ],
		];
	}

	private function px( int $size ): array {
		return [ 'size' => $size, 'unit' => 'px' ];
	}
}
