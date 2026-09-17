<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\Mcp\Abilities\Utils\Bulk_Operations_Result;
use Elementor\Modules\Mcp\Abilities\Utils\Style_Variants_Merger;
use PHPUnit\Framework\TestCase;

class Test_Style_Variants_Merger extends TestCase {

	private function make_results(): Bulk_Operations_Result {
		return new Bulk_Operations_Result();
	}

	private function make_converter( array $parse_nested_map = [] ): Css_Converter {
		$converter = $this->createMock( Css_Converter::class );

		if ( ! empty( $parse_nested_map ) ) {
			$converter->method( 'parse_nested' )->willReturnMap( $parse_nested_map );
		} else {
			$converter->method( 'parse_nested' )
				->willReturn( [ 'blocks' => [ [ 'selector' => null, 'css' => '' ] ] ] );
		}

		$converter->method( 'convert' )
			->willReturn( [ 'props' => [], 'customCss' => '', 'rejected' => [] ] );

		return $converter;
	}

	public function test_parse_css_string__flat_css_returns_desktop_breakpoint_block() {
		// Arrange.
		$converter = $this->make_converter( [
			[ 'color: red;', [ 'blocks' => [ [ 'selector' => null, 'css' => 'color: red;' ] ] ] ],
		] );
		$results = $this->make_results();

		// Act.
		$parsed = Style_Variants_Merger::parse_css_string(
			'color: red;',
			[ 'desktop', 'mobile', 'tablet' ],
			0,
			'create',
			$results,
			fn() => $converter
		);

		// Assert.
		$this->assertNotNull( $parsed );
		$this->assertCount( 1, $parsed['breakpoint_blocks'] );
		$this->assertSame( 'desktop', $parsed['breakpoint_blocks'][0]['breakpoint'] );
		$this->assertCount( 1, $parsed['breakpoint_blocks'][0]['blocks'] );
		$this->assertEmpty( $parsed['removal_breakpoints'] );
	}

	public function test_parse_css_string__pseudo_state_nesting_returns_blocks_with_selector() {
		// Arrange.
		$css = 'color: red; &:hover { color: blue; }';
		$converter = $this->make_converter( [
			[
				$css,
				[
					'blocks' => [
						[ 'selector' => null, 'css' => 'color: red;' ],
						[ 'selector' => ':hover', 'css' => 'color: blue;' ],
					],
				],
			],
		] );
		$results = $this->make_results();

		// Act.
		$parsed = Style_Variants_Merger::parse_css_string(
			$css,
			[ 'desktop', 'mobile', 'tablet' ],
			0,
			'create',
			$results,
			fn() => $converter
		);

		// Assert.
		$this->assertNotNull( $parsed );
		$this->assertCount( 1, $parsed['breakpoint_blocks'] );
		$this->assertSame( 'desktop', $parsed['breakpoint_blocks'][0]['breakpoint'] );
		$this->assertCount( 2, $parsed['breakpoint_blocks'][0]['blocks'] );
		$this->assertNull( $parsed['breakpoint_blocks'][0]['blocks'][0]['selector'] );
		$this->assertSame( ':hover', $parsed['breakpoint_blocks'][0]['blocks'][1]['selector'] );
	}

	public function test_parse_css_string__breakpoint_block_returns_separate_breakpoint_entry() {
		// Arrange.
		$root_css   = 'font-size: 2rem;';
		$mobile_css = 'font-size: 1.2rem;';
		$css        = $root_css . ' @media(--mobile) { ' . $mobile_css . ' }';

		$converter = $this->make_converter( [
			[ $root_css, [ 'blocks' => [ [ 'selector' => null, 'css' => $root_css ] ] ] ],
			[ $mobile_css, [ 'blocks' => [ [ 'selector' => null, 'css' => $mobile_css ] ] ] ],
		] );
		$results = $this->make_results();

		// Act.
		$parsed = Style_Variants_Merger::parse_css_string(
			$css,
			[ 'desktop', 'mobile', 'tablet' ],
			0,
			'create',
			$results,
			fn() => $converter
		);

		// Assert.
		$this->assertNotNull( $parsed );
		$this->assertCount( 2, $parsed['breakpoint_blocks'] );

		$by_bp = array_column( $parsed['breakpoint_blocks'], null, 'breakpoint' );
		$this->assertArrayHasKey( 'desktop', $by_bp );
		$this->assertArrayHasKey( 'mobile', $by_bp );
	}

	public function test_parse_css_string__unknown_breakpoint_returns_null_with_error() {
		// Arrange.
		$results = $this->make_results();
		$converter_called = false;

		// Act.
		$parsed = Style_Variants_Merger::parse_css_string(
			'@media(--nonexistent) { color: red; }',
			[ 'desktop', 'mobile', 'tablet' ],
			0,
			'create',
			$results,
			function () use ( &$converter_called ) {
				$converter_called = true;
				throw new \RuntimeException( 'converter should not be called when split fails' );
			}
		);

		// Assert.
		$this->assertNull( $parsed );
		$this->assertFalse( $converter_called, 'Converter factory must not be called when the media split fails.' );
		$result_data = $results->to_array();
		$this->assertSame( 'error', $result_data['status'] );
		$this->assertStringContainsString( 'nonexistent', $result_data['results'][0]['message'] );
	}

	public function test_parse_css_string__empty_string_returns_empty_breakpoint_blocks() {
		// Arrange.
		$results   = $this->make_results();
		$converter = $this->make_converter();

		// Act.
		$parsed = Style_Variants_Merger::parse_css_string(
			'',
			[ 'desktop', 'mobile', 'tablet' ],
			0,
			'create',
			$results,
			fn() => $converter
		);

		// Assert.
		$this->assertNotNull( $parsed );
		$this->assertEmpty( $parsed['breakpoint_blocks'] );
		$this->assertEmpty( $parsed['removal_breakpoints'] );
	}

	public function test_parse_css_string__parse_nested_error_returns_null_with_error() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )
			->willReturn( [ 'blocks' => [], 'error' => 'Unclosed brace at line 1' ] );

		$results = $this->make_results();

		// Act.
		$parsed = Style_Variants_Merger::parse_css_string(
			'color: red; &:hover { unclosed',
			[ 'desktop', 'mobile', 'tablet' ],
			0,
			'create',
			$results,
			fn() => $converter
		);

		// Assert.
		$this->assertNull( $parsed );
		$result_data = $results->to_array();
		$this->assertSame( 'error', $result_data['status'] );
		$this->assertStringContainsString( 'Unclosed brace', $result_data['results'][0]['message'] );
	}
}
