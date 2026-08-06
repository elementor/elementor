<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Media_Splitter;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Css_Media_Splitter extends TestCase {

	const KNOWN_BREAKPOINTS = [ 'mobile', 'tablet', 'widescreen' ];

	private function make( array $known_breakpoints = self::KNOWN_BREAKPOINTS ): Css_Media_Splitter {
		return new Css_Media_Splitter( $known_breakpoints );
	}

	public function test_split__root_level_declarations_go_to_desktop_breakpoint() {
		// Arrange.
		$splitter = $this->make();

		// Act.
		$result = $splitter->split( 'color: red; font-size: 16px;' );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertSame( 'color: red; font-size: 16px;', $result['breakpoints']['desktop'] );
	}

	public function test_split__desktop_alias_goes_to_desktop_breakpoint() {
		// Arrange.
		$splitter = $this->make();

		// Act.
		$result = $splitter->split( '@media(--desktop) { color: red; }' );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertSame( 'color: red;', $result['breakpoints']['desktop'] );
	}

	public function test_split__default_alias_goes_to_desktop_breakpoint() {
		// Arrange.
		$splitter = $this->make();

		// Act.
		$result = $splitter->split( '@media(--default) { color: blue; }' );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertSame( 'color: blue;', $result['breakpoints']['desktop'] );
	}

	public function test_split__known_breakpoint_goes_to_its_entry() {
		// Arrange.
		$splitter = $this->make();

		// Act.
		$result = $splitter->split( '@media(--mobile) { font-size: 14px; }' );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertSame( 'font-size: 14px;', $result['breakpoints']['mobile'] );
	}

	public function test_split__unknown_alias_returns_error() {
		// Arrange.
		$splitter = $this->make();

		// Act.
		$result = $splitter->split( '@media(--unknown-bp) { color: red; }' );

		// Assert.
		$this->assertNotNull( $result['error'] );
		$this->assertStringContainsString( '--unknown-bp', $result['error'] );
		$this->assertEmpty( $result['breakpoints'] );
	}

	public function test_split__raw_media_query_goes_to_custom_css() {
		// Arrange.
		$splitter = $this->make();

		// Act.
		$result = $splitter->split( '@media (max-width: 768px) { color: green; }' );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertEmpty( $result['breakpoints'] );
		$this->assertStringContainsString( 'max-width: 768px', $result['custom_css'] );
		$this->assertStringContainsString( 'color: green', $result['custom_css'] );
	}

	public function test_split__duplicate_breakpoint_blocks_are_merged() {
		// Arrange.
		$splitter = $this->make();

		// Act.
		$result = $splitter->split( '@media(--mobile) { color: red; } @media(--mobile) { font-size: 14px; }' );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertStringContainsString( 'color: red;', $result['breakpoints']['mobile'] );
		$this->assertStringContainsString( 'font-size: 14px;', $result['breakpoints']['mobile'] );
	}

	public function test_split__root_and_media_blocks_are_split_correctly() {
		// Arrange.
		$splitter = $this->make();
		$css      = 'color: #000; font-size: 24px; @media(--mobile) { font-size: 18px; }';

		// Act.
		$result = $splitter->split( $css );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertStringContainsString( 'color: #000;', $result['breakpoints']['desktop'] );
		$this->assertStringContainsString( 'font-size: 24px;', $result['breakpoints']['desktop'] );
		$this->assertSame( 'font-size: 18px;', $result['breakpoints']['mobile'] );
	}

	public function test_split__pseudo_blocks_at_root_level_land_in_desktop_breakpoint() {
		// Arrange.
		$splitter = $this->make();

		// Act.
		$result = $splitter->split( 'color: red; &:hover { color: blue; }' );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertStringContainsString( 'color: red;', $result['breakpoints']['desktop'] );
		$this->assertStringContainsString( '&:hover { color: blue; }', $result['breakpoints']['desktop'] );
	}

	public function test_split__pseudo_blocks_inside_media_block_stay_in_that_breakpoint() {
		// Arrange.
		$splitter = $this->make();

		// Act.
		$result = $splitter->split( '@media(--mobile) { font-size: 18px; &:hover { color: blue; } }' );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertStringContainsString( 'font-size: 18px;', $result['breakpoints']['mobile'] );
		$this->assertStringContainsString( '&:hover { color: blue; }', $result['breakpoints']['mobile'] );
	}

	public function test_split__multiple_breakpoints_produce_separate_entries() {
		// Arrange.
		$splitter = $this->make();
		$css      = '@media(--mobile) { color: red; } @media(--tablet) { color: green; } @media(--widescreen) { color: blue; }';

		// Act.
		$result = $splitter->split( $css );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertSame( 'color: red;', $result['breakpoints']['mobile'] );
		$this->assertSame( 'color: green;', $result['breakpoints']['tablet'] );
		$this->assertSame( 'color: blue;', $result['breakpoints']['widescreen'] );
	}

	public function test_split__empty_input_returns_empty_breakpoints() {
		// Arrange.
		$splitter = $this->make();

		// Act.
		$result = $splitter->split( '' );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertEmpty( $result['breakpoints'] );
		$this->assertSame( '', $result['custom_css'] );
	}

	public function test_split__alias_with_spaces_in_parens_is_accepted() {
		// Arrange.
		$splitter = $this->make();

		// Act.
		$result = $splitter->split( '@media( --mobile ) { color: red; }' );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertSame( 'color: red;', $result['breakpoints']['mobile'] );
	}

	public function test_split__unclosed_media_block_returns_error() {
		// Arrange.
		$splitter = $this->make();

		// Act.
		$result = $splitter->split( '@media(--mobile) { color: red;' );

		// Assert.
		$this->assertNotNull( $result['error'] );
		$this->assertEmpty( $result['breakpoints'] );
	}

	public function test_split__unmatched_closing_bracket_returns_error() {
		// Arrange.
		$splitter = $this->make();

		// Act.
		$result = $splitter->split( 'color: red; }' );

		// Assert.
		$this->assertNotNull( $result['error'] );
		$this->assertEmpty( $result['breakpoints'] );
	}

	public function test_split__unmatched_bracket_inside_valid_css_returns_error() {
		// Arrange.
		$splitter = $this->make();

		// Act.
		$result = $splitter->split( '@media(--mobile) { color: red; } }' );

		// Assert.
		$this->assertNotNull( $result['error'] );
		$this->assertEmpty( $result['breakpoints'] );
	}

	public function test_split__nested_known_breakpoint_returns_error() {
		// Arrange.
		$splitter = $this->make();

		// Act.
		$result = $splitter->split( '@media(--mobile) { @media(--tablet) { color: red; } }' );

		// Assert.
		$this->assertNotNull( $result['error'] );
		$this->assertEmpty( $result['breakpoints'] );
	}

	public function test_split__nested_desktop_alias_returns_error() {
		// Arrange.
		$splitter = $this->make();

		// Act.
		$result = $splitter->split( '@media(--mobile) { @media(--desktop) { color: red; } }' );

		// Assert.
		$this->assertNotNull( $result['error'] );
		$this->assertEmpty( $result['breakpoints'] );
	}

	public function test_split__raw_media_nested_inside_breakpoint_is_allowed() {
		// Arrange.
		$splitter = $this->make();

		// Act.
		$result = $splitter->split( '@media(--mobile) { @media (max-width: 500px) { color: red; } }' );

		// Assert — raw @media inside a breakpoint block is not a splitter error.
		$this->assertNull( $result['error'] );
		$this->assertArrayHasKey( 'mobile', $result['breakpoints'] );
	}

	public function test_split__string_containing_braces_is_not_misparse() {
		// Arrange.
		$splitter = $this->make();

		// Act.
		$result = $splitter->split( 'content: "}"; @media(--mobile) { font-size: 14px; }' );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertStringContainsString( 'content: "}"', $result['breakpoints']['desktop'] );
		$this->assertSame( 'font-size: 14px;', $result['breakpoints']['mobile'] );
	}

	public function test_split__non_alias_media_preserves_space_before_keyword() {
		// Arrange.
		$splitter = $this->make();

		// Act — @media print is a valid raw media query; the word "print" must not be concatenated directly.
		$result = $splitter->split( '@media print { color: red; }' );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertStringContainsString( '@media print', $result['custom_css'] );
		$this->assertStringNotContainsString( '@mediaprint', $result['custom_css'] );
	}

	public function test_split__escaped_backslash_before_quote_does_not_terminate_string_early() {
		// Arrange.
		$splitter = $this->make();

		// Act — `"\\"` is an escaped backslash; the string ends at the second quote, not at the escaped one.
		$result = $splitter->split( 'content: "a\\\\"; @media(--mobile) { font-size: 14px; }' );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertArrayHasKey( 'mobile', $result['breakpoints'] );
	}
}
