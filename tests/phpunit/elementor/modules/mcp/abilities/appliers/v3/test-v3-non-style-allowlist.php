<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Non_Style_Allowlist;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Widget_Bridge_Registry;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Non_Style_Allowlist extends TestCase {

	private function nav_menu_controls(): array {
		return [
			'menu' => [
				'type' => 'text',
				'tab' => 'content',
			],
			'layout' => [
				'type' => 'text',
				'tab' => 'content',
			],
			'menu_typography_font_size' => [
				'type' => 'slider',
				'tab' => 'style',
			],
			'_padding' => [
				'type' => 'dimensions',
				'tab' => 'advanced',
			],
		];
	}

	public function test_filter__allows_content_tab_keys() {
		// Arrange.
		$settings = [
			'menu' => 'primary',
			'layout' => 'horizontal',
		];
		$controls = $this->nav_menu_controls();

		// Act.
		$result = V3_Non_Style_Allowlist::filter( 'nav-menu', $settings, $controls );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertSame( $settings, $result['allowed'] );
		$this->assertEmpty( $result['rejected'] );
	}

	public function test_filter__allows_style_and_advanced_basic_keys() {
		// Arrange.
		$settings = [
			'menu_typography_font_size' => [ 'unit' => 'px', 'size' => 20 ],
			'_padding' => [
				'top' => '10',
				'right' => '10',
				'bottom' => '10',
				'left' => '10',
				'unit' => 'px',
				'isLinked' => true,
			],
		];
		$controls = $this->nav_menu_controls();

		// Act.
		$result = V3_Non_Style_Allowlist::filter( 'nav-menu', $settings, $controls );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertSame( $settings, $result['allowed'] );
		$this->assertEmpty( $result['rejected'] );
	}

	public function test_filter__rejects_unknown_keys() {
		// Arrange.
		$settings = [
			'menu' => 'primary',
			'made_up_key' => 'value',
		];
		$controls = $this->nav_menu_controls();

		// Act.
		$result = V3_Non_Style_Allowlist::filter( 'nav-menu', $settings, $controls );

		// Assert.
		$this->assertNotNull( $result['error'] );
		$this->assertSame( 'elementor_invalid_settings', $result['error']->get_error_code() );
		$this->assertSame( [ 'menu' => 'primary' ], $result['allowed'] );
		$this->assertContains( 'made_up_key', $result['rejected'] );
	}

	public function test_filter__theme_post_content_allows_style_tab_align() {
		// Arrange.
		$controls = [
			'align' => [
				'type' => 'choose',
				'tab' => 'style',
			],
		];

		// Act.
		$result = V3_Non_Style_Allowlist::filter( 'theme-post-content', [ 'align' => 'center' ], $controls );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertSame( [ 'align' => 'center' ], $result['allowed'] );
	}

	public function test_registry__covers_all_allowlisted_widgets() {
		$types = [
			'nav-menu',
			'theme-post-content',
			'theme-post-title',
			'theme-post-featured-image',
			'theme-post-excerpt',
			'theme-archive-title',
			'slides',
			'price-table',
			'call-to-action',
		];

		foreach ( $types as $type ) {
			$this->assertNotNull( V3_Widget_Bridge_Registry::get( $type ), "Missing registry entry for {$type}" );
		}
	}
}
