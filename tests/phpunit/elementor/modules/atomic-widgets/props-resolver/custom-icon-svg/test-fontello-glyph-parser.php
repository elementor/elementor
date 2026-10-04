<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver\Custom_Icon_Svg;

use Elementor\Modules\AtomicWidgets\PropsResolver\Custom_Icon_Svg\Fontello_Glyph_Parser;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Fontello_Glyph_Parser extends TestCase {
	public function test_to_svg__builds_path_from_unicode_glyph_without_svg_path_in_config() {
		// Arrange.
		$fixture = __DIR__ . '/fixtures/fontello';
		$config = file_get_contents( $fixture . '/config.json' );
		$font = file_get_contents( $fixture . '/font/fontello.svg' );

		// Act.
		$svg = Fontello_Glyph_Parser::to_svg( $config, $font, 'emo-surprised', 'icon-' );

		// Assert.
		$this->assertStringContainsString( '<svg', $svg );
		$this->assertStringContainsString( 'M0 0H100V100H0Z', $svg );
		$this->assertStringContainsString( 'scale(1,-1)', $svg );
		$this->assertStringContainsString( 'viewBox="0 0 1000 1000"', $svg );
	}

	public function test_to_svg__strips_icon_prefix_from_saved_class() {
		// Arrange.
		$fixture = __DIR__ . '/fixtures/fontello';
		$config = file_get_contents( $fixture . '/config.json' );
		$font = file_get_contents( $fixture . '/font/fontello.svg' );

		// Act.
		$svg = Fontello_Glyph_Parser::to_svg( $config, $font, 'icon-emo-surprised', 'icon-' );

		// Assert.
		$this->assertStringContainsString( 'M0 0H100V100H0Z', $svg );
	}

	public function test_to_svg__returns_empty_for_unknown_icon() {
		// Arrange.
		$fixture = __DIR__ . '/fixtures/fontello';
		$config = file_get_contents( $fixture . '/config.json' );
		$font = file_get_contents( $fixture . '/font/fontello.svg' );

		// Act.
		$svg = Fontello_Glyph_Parser::to_svg( $config, $font, 'missing', 'icon-' );

		// Assert.
		$this->assertSame( '', $svg );
	}

	public function test_to_svg__uses_current_color_fill() {
		// Arrange.
		$fixture = __DIR__ . '/fixtures/fontello';
		$config = file_get_contents( $fixture . '/config.json' );
		$font = file_get_contents( $fixture . '/font/fontello.svg' );

		// Act.
		$svg = Fontello_Glyph_Parser::to_svg( $config, $font, 'emo-surprised', 'icon-' );

		// Assert.
		$this->assertStringContainsString( 'fill="currentColor"', $svg );
	}

	public function test_to_svg__matches_glyph_name_without_config_json() {
		// Arrange.
		$font = file_get_contents( __DIR__ . '/fixtures/fontello/font/fontello.svg' );

		// Act.
		$svg = Fontello_Glyph_Parser::to_svg( '{}', $font, 'emo-surprised', 'icon-' );

		// Assert.
		$this->assertStringContainsString( 'M0 0H100V100H0Z', $svg );
	}

	public function test_to_svg__does_not_match_glyph_name_as_suffix() {
		$font = '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"><defs><font horiz-adv-x="1000"><font-face units-per-em="1000"/><glyph glyph-name="prised" unicode="&#xe801;" d="M1 1H2V2H1Z" horiz-adv-x="1000"/></font></defs></svg>';

		$svg = Fontello_Glyph_Parser::to_svg( '{}', $font, 'emo-surprised', 'icon-' );

		$this->assertSame( '', $svg );
	}

	public function test_to_svg__uses_svg_path_from_config_when_present() {
		// Arrange.
		$config = wp_json_encode( [
			'glyphs' => [
				[
					'css' => 'home',
					'svg' => [
						'path' => 'M10 10H20V20H10Z',
						'width' => 32,
					],
				],
			],
		] );

		// Act.
		$svg = Fontello_Glyph_Parser::to_svg( $config, '', 'home', 'icon-' );

		// Assert.
		$this->assertStringContainsString( 'M10 10H20V20H10Z', $svg );
		$this->assertStringContainsString( 'fill="currentColor"', $svg );
	}
}
