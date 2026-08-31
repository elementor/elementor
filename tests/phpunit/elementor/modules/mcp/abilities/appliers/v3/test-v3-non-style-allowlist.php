<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Non_Style_Allowlist;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Widget_Bridge_Registry;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Non_Style_Allowlist extends TestCase {

	public function test_filter__allows_whitelisted_keys_for_nav_menu() {
		// Arrange.
		$settings = [
			'menu' => 'primary',
			'layout' => 'horizontal',
		];

		// Act.
		$result = V3_Non_Style_Allowlist::filter( 'nav-menu', $settings );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertSame( $settings, $result['allowed'] );
		$this->assertEmpty( $result['rejected'] );
	}

	public function test_filter__rejects_unknown_and_style_keys() {
		// Arrange.
		$settings = [
			'menu' => 'primary',
			'title_color' => '#ff0000',
			'typography_font_size' => [ 'unit' => 'px', 'size' => 16 ],
		];

		// Act.
		$result = V3_Non_Style_Allowlist::filter( 'nav-menu', $settings );

		// Assert.
		$this->assertNotNull( $result['error'] );
		$this->assertSame( 'elementor_invalid_settings', $result['error']->get_error_code() );
		$this->assertSame( [ 'menu' => 'primary' ], $result['allowed'] );
		$this->assertContains( 'title_color', $result['rejected'] );
		$this->assertContains( 'typography_font_size', $result['rejected'] );
	}

	public function test_filter__theme_post_content_has_no_non_style_keys() {
		// Arrange / Act.
		$result = V3_Non_Style_Allowlist::filter( 'theme-post-content', [ 'align' => 'center' ] );

		// Assert.
		$this->assertNotNull( $result['error'] );
		$this->assertEmpty( $result['allowed'] );
		$this->assertSame( [], V3_Widget_Bridge_Registry::get_non_style_keys( 'theme-post-content' ) );
	}

	public function test_registry__covers_all_allowlisted_widgets() {
		$types = [
			'nav-menu',
			'theme-post-content',
			'theme-post-title',
			'theme-post-featured-image',
			'theme-post-excerpt',
			'theme-archive-title',
		];

		foreach ( $types as $type ) {
			$this->assertNotNull( V3_Widget_Bridge_Registry::get( $type ), "Missing registry entry for {$type}" );
			$this->assertIsArray( V3_Widget_Bridge_Registry::get_style_overrides( $type ) );
		}
	}

	public function test_get_description__returns_v4_preference_hint_for_post_widgets() {
		$this->assertStringContainsString( 'e-heading', V3_Widget_Bridge_Registry::get_description( 'theme-post-title' ) );
		$this->assertStringContainsString( 'post-title', V3_Widget_Bridge_Registry::get_description( 'theme-post-title' ) );

		$this->assertStringContainsString( 'e-image', V3_Widget_Bridge_Registry::get_description( 'theme-post-featured-image' ) );
		$this->assertStringContainsString( 'featured-image', V3_Widget_Bridge_Registry::get_description( 'theme-post-featured-image' ) );

		$this->assertStringContainsString( 'post-excerpt', V3_Widget_Bridge_Registry::get_description( 'theme-post-excerpt' ) );
	}

	public function test_get_description__theme_post_content_forbids_loop_placement() {
		$description = V3_Widget_Bridge_Registry::get_description( 'theme-post-content' );

		$this->assertNotNull( $description );
		$this->assertStringContainsStringIgnoringCase( 'single-template', $description );
		$this->assertStringContainsString( 'loop', $description );
	}

	public function test_get_description__nav_menu_and_archive_title_have_no_v4_hint() {
		$this->assertNull( V3_Widget_Bridge_Registry::get_description( 'nav-menu' ) );
		$this->assertNull( V3_Widget_Bridge_Registry::get_description( 'theme-archive-title' ) );
	}

	public function test_get_description__unknown_widget_returns_null() {
		$this->assertNull( V3_Widget_Bridge_Registry::get_description( 'unknown-widget' ) );
	}
}
