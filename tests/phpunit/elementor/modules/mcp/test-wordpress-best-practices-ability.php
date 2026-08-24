<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Wordpress_Best_Practices_Ability;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Locks in the LLM-facing phrasing that steers widget selection away from V3
 * post-* widgets and keeps `theme-post-content` out of loop items.
 *
 * @group Elementor\Modules\Mcp
 */
class Test_Wordpress_Best_Practices_Ability extends TestCase {

	public function test_execute__pushes_v4_plus_dynamic_tag_over_v3_post_widgets() {
		$ability = new Wordpress_Best_Practices_Ability();

		$content = $ability->execute();

		$this->assertIsString( $content );
		$this->assertStringContainsString( 'theme-post-title', $content );
		$this->assertStringContainsString( 'theme-post-featured-image', $content );
		$this->assertStringContainsString( 'theme-post-excerpt', $content );
		$this->assertStringContainsString( 'e-heading', $content );
		$this->assertStringContainsString( 'e-image', $content );
	}

	public function test_execute__forbids_theme_post_content_inside_loop_items() {
		$ability = new Wordpress_Best_Practices_Ability();

		$content = $ability->execute();

		$this->assertStringContainsString( 'single-template body slot', $content );
		$this->assertStringContainsString( 'loop item', $content );
	}
}
