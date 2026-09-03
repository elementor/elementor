<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Build_Guidelines_Ability;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Locks in the LLM-facing phrasing that steers widget selection away from V3
 * post-* widgets, keeps `theme-post-content` out of loop items, and surfaces
 * the styling contract that the tool descriptions teaser to.
 *
 * @group Elementor\Modules\Mcp
 */
class Test_Build_Guidelines_Ability extends TestCase {

	public function test_execute__pushes_v4_plus_dynamic_tag_over_v3_post_widgets() {
		$ability = new Build_Guidelines_Ability();

		$content = $ability->execute();

		$this->assertIsString( $content );
		$this->assertStringContainsString( 'theme-post-title', $content );
		$this->assertStringContainsString( 'theme-post-featured-image', $content );
		$this->assertStringContainsString( 'theme-post-excerpt', $content );
		$this->assertStringContainsString( 'e-heading', $content );
		$this->assertStringContainsString( 'e-image', $content );
	}

	public function test_execute__forbids_theme_post_content_inside_loop_items() {
		$ability = new Build_Guidelines_Ability();

		$content = $ability->execute();

		$this->assertStringContainsString( 'single-template body slot', $content );
		$this->assertStringContainsString( 'loop item', $content );
	}

	public function test_execute__contains_styling_contract_elaboration() {
		$ability = new Build_Guidelines_Ability();

		$content = $ability->execute();

		$this->assertStringContainsString( '@media(--mobile)', $content );
		$this->assertStringContainsString( 'custom_css', $content );
		$this->assertStringContainsString( 'box-shadow', $content );
		$this->assertStringContainsString( 'animation', $content );
	}

	public function test_uri__is_build_guidelines() {
		$this->assertSame( 'elementor://build-guidelines', Build_Guidelines_Ability::URI );
	}
}
