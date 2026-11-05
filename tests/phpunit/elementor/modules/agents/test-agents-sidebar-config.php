<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Classes\Agents_Sidebar_Config;
use Elementor\Modules\Agents\Module;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Agents_Sidebar_Config extends Elementor_Test_Base {

	public function test_exclude_from_editor_sidebar__adds_both_agent_pages() {
		// Arrange
		$sidebar_config = new Agents_Sidebar_Config();

		// Act
		$slugs = $sidebar_config->exclude_from_editor_sidebar( [ 'existing-slug' ] );

		// Assert
		$this->assertSame( [ 'existing-slug', Module::PAGE_ID, Module::AGENT_ACCESS_PAGE_ID ], $slugs );
	}

	public function test_filter_sidebar_config__leaves_config_unchanged_outside_agent_pages() {
		// Arrange
		$sidebar_config = new Agents_Sidebar_Config();
		$config         = [
			'menuItems' => [ [ 'slug' => 'elementor-mcp' ] ],
			'isMinimal' => false,
		];

		// Act
		$result = $sidebar_config->filter_sidebar_config( $config );

		// Assert
		$this->assertSame( $config, $result );
	}
}
