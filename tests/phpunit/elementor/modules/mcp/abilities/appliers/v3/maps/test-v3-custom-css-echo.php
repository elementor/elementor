<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Custom_Css_Echo;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Custom_Css_Echo extends TestCase {

	public function test_extract__lifts_selector_blocks_out_of_the_style() {
		// Arrange.
		$css = 'color: red; selector { margin: 10px 1em; } selector:hover { padding: 1rem; } title { color: blue; }';

		// Act.
		$result = V3_Custom_Css_Echo::extract( $css );

		// Assert.
		$this->assertSame( [ 'selector { margin: 10px 1em; }', 'selector:hover { padding: 1rem; }' ], $result['preserved'] );
		$this->assertSame( 'color: red; title { color: blue; }', $result['css'] );
	}

	public function test_extract__lifts_a_selector_block_inside_a_breakpoint_media_query() {
		// Arrange.
		$css = '@media (max-width: 1024px) { selector .x { margin: 2px 0; } } color: red;';

		// Act.
		$result = V3_Custom_Css_Echo::extract( $css );

		// Assert.
		$this->assertSame( [ '@media (max-width: 1024px) { selector .x { margin: 2px 0; } }' ], $result['preserved'] );
		$this->assertSame( 'color: red;', $result['css'] );
	}

	/**
	 * @dataProvider provide_unsafe_blocks
	 */
	public function test_extract__leaves_blocks_that_could_load_code_or_break_out_in_the_style( string $css ) {
		// Act.
		$result = V3_Custom_Css_Echo::extract( $css );

		// Assert.
		$this->assertSame( [], $result['preserved'] );
		$this->assertSame( trim( $css ), $result['css'] );
	}

	public function provide_unsafe_blocks(): array {
		return [
			'javascript url' => [ 'selector { background: url(javascript:alert(1)); }' ],
			'style breakout' => [ 'selector .x { content: "</style><script>"; }' ],
			'import' => [ 'selector { @import url(//evil.example/x.css); }' ],
			'expression' => [ 'selector { width: expression(alert(1)); }' ],
			'foreign selector in media' => [ '@media (max-width: 1024px) { selector { width: 1px; } .evil { color: red; } }' ],
			'non breakpoint media' => [ '@media print { selector { color: red; } }' ],
			'empty rule' => [ 'selector { }' ],
		];
	}
}
