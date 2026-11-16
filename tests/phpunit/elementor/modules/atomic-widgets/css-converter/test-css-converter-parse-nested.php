<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\AtomicWidgets\CssConverter
 */
class Test_Css_Converter_Parse_Nested extends TestCase {

	private function make(): Css_Converter {
		return new Css_Converter( new Converter_Registry(), new Null_Failure_Reporter() );
	}

	public function test_parse_nested__flat_css_returns_single_base_block() {
		// Arrange.
		$converter = $this->make();

		// Act.
		$result = $converter->parse_nested( 'color: red; font-size: 14px;' );

		// Assert.
		$this->assertArrayNotHasKey( 'error', $result );
		$this->assertCount( 1, $result['blocks'] );
		$this->assertNull( $result['blocks'][0]['selector'] );
		$this->assertSame( 'color: red; font-size: 14px;', $result['blocks'][0]['css'] );
	}

	public function test_parse_nested__hover_block_extracted_correctly() {
		// Arrange.
		$converter = $this->make();

		// Act.
		$result = $converter->parse_nested( 'color: red; &:hover { color: blue; }' );

		// Assert.
		$this->assertArrayNotHasKey( 'error', $result );
		$this->assertCount( 2, $result['blocks'] );
		$this->assertNull( $result['blocks'][0]['selector'] );
		$this->assertSame( ':hover', $result['blocks'][1]['selector'] );
		$this->assertSame( ' color: blue; ', $result['blocks'][1]['css'] );
	}

	public function test_parse_nested__class_selector_block_extracted_correctly() {
		// Arrange.
		$converter = $this->make();

		// Act.
		$result = $converter->parse_nested( '&.my-class { color: green; }' );

		// Assert.
		$this->assertArrayNotHasKey( 'error', $result );
		$this->assertCount( 2, $result['blocks'] );
		$this->assertSame( '.my-class', $result['blocks'][1]['selector'] );
		$this->assertSame( ' color: green; ', $result['blocks'][1]['css'] );
	}

	public function test_parse_nested__multiple_blocks_all_extracted() {
		// Arrange.
		$converter = $this->make();
		$css = 'color: red; &:hover { color: blue; } &:focus { outline: none; } &:active { color: green; }';

		// Act.
		$result = $converter->parse_nested( $css );

		// Assert.
		$this->assertArrayNotHasKey( 'error', $result );
		$this->assertCount( 4, $result['blocks'] );
		$this->assertSame( ':hover', $result['blocks'][1]['selector'] );
		$this->assertSame( ':focus', $result['blocks'][2]['selector'] );
		$this->assertSame( ':active', $result['blocks'][3]['selector'] );
	}

	public function test_parse_nested__bare_ampersand_block_returns_error() {
		// Arrange.
		$converter = $this->make();

		// Act.
		$result = $converter->parse_nested( 'color: red; & { color: blue; }' );

		// Assert.
		$this->assertSame( [], $result['blocks'] );
		$this->assertArrayHasKey( 'error', $result );
		$this->assertNotEmpty( $result['error'] );
	}

	public function test_parse_nested__unclosed_brace_returns_error() {
		// Arrange.
		$converter = $this->make();

		// Act.
		$result = $converter->parse_nested( 'color: red; &:hover { color: blue;' );

		// Assert.
		$this->assertSame( [], $result['blocks'] );
		$this->assertArrayHasKey( 'error', $result );
		$this->assertNotEmpty( $result['error'] );
	}

	public function test_parse_nested__empty_block_content_returned_as_is() {
		// Arrange.
		$converter = $this->make();

		// Act.
		$result = $converter->parse_nested( '&:hover {}' );

		// Assert.
		$this->assertArrayNotHasKey( 'error', $result );
		$this->assertCount( 2, $result['blocks'] );
		$this->assertSame( ':hover', $result['blocks'][1]['selector'] );
		$this->assertSame( '', $result['blocks'][1]['css'] );
	}

	public function test_parse_nested__brace_in_string_value_not_treated_as_block_boundary() {
		// Arrange.
		$converter = $this->make();

		// Act.
		$result = $converter->parse_nested( '&:hover { content: "}"; color: blue; }' );

		// Assert.
		$this->assertArrayNotHasKey( 'error', $result );
		$this->assertCount( 2, $result['blocks'] );
		$this->assertSame( ':hover', $result['blocks'][1]['selector'] );
		$this->assertStringContainsString( 'content: "}";', $result['blocks'][1]['css'] );
		$this->assertStringContainsString( 'color: blue;', $result['blocks'][1]['css'] );
	}

	public function test_parse_nested__nested_braces_in_block_content_handled_correctly() {
		// Arrange.
		$converter = $this->make();

		// Act — nested &:focus inside &:hover is treated as literal content (not extracted).
		$result = $converter->parse_nested( '&:hover { &:focus { outline: none; } color: blue; }' );

		// Assert.
		$this->assertArrayNotHasKey( 'error', $result );
		$this->assertCount( 2, $result['blocks'] );
		$this->assertSame( ':hover', $result['blocks'][1]['selector'] );
		$block_css = $result['blocks'][1]['css'];
		$this->assertStringContainsString( '&:focus', $block_css );
		$this->assertStringContainsString( 'outline: none;', $block_css );
		$this->assertStringContainsString( 'color: blue;', $block_css );
	}

	public function test_parse_nested__ampersand_in_property_value_does_not_corrupt_parse() {
		// Arrange.
		$converter = $this->make();

		// Act — & inside url() is not a selector; the following &:hover block should parse correctly.
		$result = $converter->parse_nested( 'background: url(a&b.png); &:hover { color: red; }' );

		// Assert.
		$this->assertArrayNotHasKey( 'error', $result );
		$this->assertCount( 2, $result['blocks'] );
		$this->assertSame( ':hover', $result['blocks'][1]['selector'] );
	}

	public function test_parse_nested__descendant_space_selector_is_not_treated_as_pseudo_state() {
		// Arrange.
		$converter = $this->make();

		// Act — "& :hover" (space) is a descendant combinator, not a pseudo-class.
		$result = $converter->parse_nested( '& :hover { color: blue; }' );

		// Assert — extracted as a block with selector ' :hover' (leading space preserved).
		$this->assertArrayNotHasKey( 'error', $result );
		$this->assertCount( 2, $result['blocks'] );
		$this->assertSame( ' :hover', $result['blocks'][1]['selector'] );
	}

	public function test_parse_nested__unsupported_nested_selector_returns_descriptive_error() {
		// Arrange.
		$converter = $this->make();

		// Act — "span { }" is an unsupported nested selector.
		$result = $converter->parse_nested( 'color: blue; span { color: green; }' );

		// Assert — error message mentions supported selectors, not "unclosed brace".
		$this->assertArrayHasKey( 'error', $result );
		$this->assertStringContainsString( 'Unsupported nested selector', $result['error'] );
	}

	public function test_parse_nested__base_declarations_preserved_after_stripping_blocks() {
		// Arrange.
		$converter = $this->make();

		// Act.
		$result = $converter->parse_nested( 'color: red; &:hover { color: blue; scroll-behavior: smooth; } font-size: 14px;' );

		// Assert.
		$this->assertArrayNotHasKey( 'error', $result );
		$base_css  = $result['blocks'][0]['css'];
		$hover_css = $result['blocks'][1]['css'];
		$this->assertStringContainsString( 'color: red;', $base_css );
		$this->assertStringContainsString( 'font-size: 14px;', $base_css );
		$this->assertStringNotContainsString( '&:hover', $base_css );
		$this->assertStringContainsString( 'scroll-behavior: smooth;', $hover_css );
		$this->assertStringContainsString( 'color: blue;', $hover_css );
	}
}
