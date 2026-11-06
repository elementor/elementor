<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Classes\Agents_Sidebar_Config;
use Elementor\Modules\Agents\Module;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Agents_Sidebar_Config extends Elementor_Test_Base {

	public function tear_down() {
		unset( $_GET['page'] );

		parent::tear_down();
	}

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

	/**
	 * @dataProvider agent_page_slugs_provider
	 */
	public function test_filter_sidebar_config__builds_minimal_sidebar_on_agent_pages( string $page_slug ) {
		// Arrange
		$this->act_as_administrator();
		$_GET['page']   = $page_slug;
		$sidebar_config = new Agents_Sidebar_Config();

		// Act
		$result = $sidebar_config->filter_sidebar_config( [ 'level4Groups' => [ 'stale' ], 'activeChildSlug' => 'stale' ] );

		// Assert
		$this->assertTrue( $result['isMinimal'] );
		$this->assertSame( $page_slug, $result['activeMenuSlug'] );
		$this->assertSame( '', $result['activeChildSlug'] );
		$this->assertSame( [], $result['level4Groups'] );
		$this->assertSame( 'Agent Ready', $result['siteTitle'] );
	}

	public function test_filter_sidebar_config__lists_both_agent_items_for_administrator() {
		// Arrange
		$this->act_as_administrator();
		$_GET['page']   = Module::PAGE_ID;
		$sidebar_config = new Agents_Sidebar_Config();

		// Act
		$items = $sidebar_config->filter_sidebar_config( [] )['menuItems'];

		// Assert
		$this->assertSame( [ Module::PAGE_ID, Module::AGENT_ACCESS_PAGE_ID ], array_column( $items, 'slug' ) );
		$this->assertSame(
			[
				admin_url( 'admin.php?page=' . Module::PAGE_ID ),
				admin_url( 'admin.php?page=' . Module::AGENT_ACCESS_PAGE_ID ),
			],
			array_column( $items, 'url' )
		);
		$this->assertSame( [ 'agents_ready', 'agent_access' ], array_column( $items, 'event_id' ) );
	}

	public function test_filter_sidebar_config__omits_items_user_cannot_access() {
		// Arrange
		$this->act_as_subscriber();
		$_GET['page']   = Module::PAGE_ID;
		$sidebar_config = new Agents_Sidebar_Config();

		// Act
		$items = $sidebar_config->filter_sidebar_config( [] )['menuItems'];

		// Assert
		$this->assertSame( [], $items );
	}

	public function agent_page_slugs_provider(): array {
		return [
			'agents ready' => [ Module::PAGE_ID ],
			'agent access' => [ Module::AGENT_ACCESS_PAGE_ID ],
		];
	}

	private function act_as_administrator() {
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'administrator' ] ) );
	}

	private function act_as_subscriber() {
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'subscriber' ] ) );
	}
}
