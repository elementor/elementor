<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Setting_Keys;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Style_Setting_Keys extends TestCase {

	public function test_from_controls__includes_content_style_and_advanced_basics() {
		// Arrange.
		$controls = [
			'menu' => [
				'type' => 'text',
				'tab' => 'content',
			],
			'color_menu_item' => [
				'type' => 'color',
				'tab' => 'style',
			],
			'menu_typography_font_size' => [
				'type' => 'slider',
				'tab' => 'style',
			],
			'_padding' => [
				'type' => 'dimensions',
				'tab' => 'advanced',
			],
			'_padding_tablet' => [
				'type' => 'dimensions',
				'tab' => 'advanced',
			],
			'_element_width' => [
				'type' => 'select',
				'tab' => 'advanced',
			],
			'section_style' => [
				'type' => 'section',
				'tab' => 'style',
			],
			'style_heading' => [
				'type' => 'heading',
				'tab' => 'style',
			],
		];

		// Act.
		$keys = V3_Style_Setting_Keys::from_controls( $controls );

		// Assert.
		$this->assertContains( 'menu', $keys );
		$this->assertContains( 'color_menu_item', $keys );
		$this->assertContains( 'menu_typography_font_size', $keys );
		$this->assertContains( '_padding', $keys );
		$this->assertContains( '_padding_tablet', $keys );
		$this->assertNotContains( '_element_width', $keys );
		$this->assertNotContains( 'section_style', $keys );
		$this->assertNotContains( 'style_heading', $keys );
	}

	public function test_from_controls__defaults_missing_tab_to_content() {
		// Arrange.
		$controls = [
			'layout' => [
				'type' => 'select',
			],
		];

		// Act.
		$keys = V3_Style_Setting_Keys::from_controls( $controls );

		// Assert.
		$this->assertSame( [ 'layout' ], $keys );
	}
}
