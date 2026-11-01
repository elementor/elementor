<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Utils\Eicons_Svg_Glyphs;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Eicons_Svg_Glyphs extends TestCase {

	public function test_markup_for_icon_returns_inline_svg_with_glyph_path() {
		// Act
		$markup = Eicons_Svg_Glyphs::markup_for_icon( 'eicon-accordion' );

		// Assert
		$this->assertStringStartsWith( '<svg', $markup );
		$this->assertStringContainsString( 'scale(1,-1)', $markup );
		$this->assertStringContainsString( '<path fill="currentColor"', $markup );
		$this->assertStringContainsString( 'translate(0,-850)', $markup );
		$this->assertStringContainsString( 'M938 600h-875', $markup );
	}

	public function test_markup_for_icon_returns_empty_for_unknown_glyph() {
		// Act
		$markup = Eicons_Svg_Glyphs::markup_for_icon( 'eicon-not-a-real-icon-name-xyz' );

		// Assert
		$this->assertSame( '', $markup );
	}

	public function test_markup_for_icon_returns_empty_for_blank_class() {
		// Assert
		$this->assertSame( '', Eicons_Svg_Glyphs::markup_for_icon( '' ) );
	}

	public function test_path_d_for_icon_returns_glyph_path() {
		// Act
		$path = Eicons_Svg_Glyphs::path_d_for_icon( 'eicon-accordion' );

		// Assert
		$this->assertStringContainsString( 'M938 600', $path );
	}

	public function test_path_d_for_icon_returns_empty_for_unknown_glyph() {
		// Assert
		$this->assertSame( '', Eicons_Svg_Glyphs::path_d_for_icon( 'eicon-not-a-real-icon-name-xyz' ) );
	}
}
