<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Non_Style_Allowlist;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Widget_Map_Loader;
use Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Fixtures\V3_Widget_Fixtures;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/fixtures/v3-widget-fixtures.php';

class Test_V3_Non_Style_Allowlist extends TestCase {

	private function controls( string $widget_type ): array {
		return V3_Widget_Fixtures::widget_config( $widget_type )['controls'];
	}

	public function test_filter__allows_derived_behavior_keys_for_nav_menu() {
		// Arrange.
		$settings = [
			'menu' => 'primary',
			'layout' => 'horizontal',
		];

		// Act.
		$result = V3_Non_Style_Allowlist::filter( 'nav-menu', $settings, $this->controls( 'nav-menu' ) );

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
		$result = V3_Non_Style_Allowlist::filter( 'nav-menu', $settings, $this->controls( 'nav-menu' ) );

		// Assert.
		$this->assertNotNull( $result['error'] );
		$this->assertSame( 'elementor_invalid_settings', $result['error']->get_error_code() );
		$this->assertSame( [ 'menu' => 'primary' ], $result['allowed'] );
		$this->assertContains( 'title_color', $result['rejected'] );
		$this->assertContains( 'typography_font_size', $result['rejected'] );
	}

	public function test_filter__css_classes_is_not_a_write_allowlisted_key() {
		// Locks in that _css_classes has a dedicated write path (Class_Applier); the
		// element_config allowlist must not accept it, and Get_Structure_Ability is
		// responsible for echoing it back on read via its own read-only key list.
		$result = V3_Non_Style_Allowlist::filter(
			'nav-menu',
			[ '_css_classes' => [ 'value' => [ 'menu-container' ], '$$type' => 'classes' ] ],
			$this->controls( 'nav-menu' )
		);

		$this->assertContains( '_css_classes', $result['rejected'] );
		$this->assertArrayNotHasKey( '_css_classes', $result['allowed'] );
	}

	public function test_filter__theme_post_content_has_no_non_style_keys() {
		// Arrange.
		$controls = $this->controls( 'theme-post-content' );

		// Act.
		$result = V3_Non_Style_Allowlist::filter( 'theme-post-content', [ 'align' => 'center' ], $controls );

		// Assert.
		$this->assertNotNull( $result['error'] );
		$this->assertEmpty( $result['allowed'] );
		$this->assertSame( [], V3_Widget_Map_Loader::get_non_style_keys( 'theme-post-content', $controls ) );
	}

	public function test_get_description__returns_v4_preference_hint_for_post_widgets() {
		$this->assertStringContainsString( 'e-heading', V3_Widget_Map_Loader::get_description( 'theme-post-title' ) );
		$this->assertStringContainsString( 'post-title', V3_Widget_Map_Loader::get_description( 'theme-post-title' ) );

		$this->assertStringContainsString( 'e-image', V3_Widget_Map_Loader::get_description( 'theme-post-featured-image' ) );
		$this->assertStringContainsString( 'featured-image', V3_Widget_Map_Loader::get_description( 'theme-post-featured-image' ) );

		$this->assertStringContainsString( 'post-excerpt', V3_Widget_Map_Loader::get_description( 'theme-post-excerpt' ) );

		$this->assertStringContainsString( 'e-heading', V3_Widget_Map_Loader::get_description( 'theme-archive-title' ) );
		$this->assertStringContainsString( 'archive-title', V3_Widget_Map_Loader::get_description( 'theme-archive-title' ) );
	}

	public function test_get_description__theme_post_content_forbids_loop_placement() {
		$description = V3_Widget_Map_Loader::get_description( 'theme-post-content' );

		$this->assertNotNull( $description );
		$this->assertStringContainsStringIgnoringCase( 'single-template', $description );
		$this->assertStringContainsString( 'loop', $description );
	}

	public function test_get_description__widgets_without_a_v4_equivalent_have_no_hint() {
		$this->assertNull( V3_Widget_Map_Loader::get_description( 'nav-menu' ) );
	}

	public function test_get_description__unknown_widget_returns_null() {
		$this->assertNull( V3_Widget_Map_Loader::get_description( 'unknown-widget' ) );
	}
}
