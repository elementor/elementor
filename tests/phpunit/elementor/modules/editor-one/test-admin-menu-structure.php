<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Modules\EditorOne\Classes\Admin_Flow_Config;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\EditorOne\Components\Admin_Menu_Structure;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Admin_Menu_Structure extends Elementor_Test_Base {

	private Admin_Menu_Structure $structure;

	public function setUp(): void {
		parent::setUp();
		$this->structure = new Admin_Menu_Structure();
	}

	public function test_move_below_pages__places_elementor_directly_after_pages() {
		// Arrange
		$menu = [
			2 => [ 'Elementor', 'manage_options', Menu_Config::ELEMENTOR_HOME_MENU_SLUG ],
			5 => [ 'Posts', 'edit_posts', 'edit.php' ],
			20 => [ 'Pages', 'edit_pages', Admin_Menu_Structure::PAGES_MENU_SLUG ],
			25 => [ 'Comments', 'moderate_comments', 'edit-comments.php' ],
		];

		// Act
		$menu = $this->structure->move_below_pages(
			$menu,
			Menu_Config::ELEMENTOR_HOME_MENU_SLUG,
			Admin_Menu_Structure::PAGES_MENU_SLUG
		);

		// Assert
		$this->assertArrayNotHasKey( 2, $menu );
		$this->assertSame( Menu_Config::ELEMENTOR_HOME_MENU_SLUG, $menu[21][2] );
		$this->assertSame( Admin_Menu_Structure::PAGES_MENU_SLUG, $menu[20][2] );
	}

	public function test_move_below_pages__skips_a_taken_position() {
		// Arrange
		$menu = [
			2 => [ 'Elementor', 'manage_options', Menu_Config::ELEMENTOR_HOME_MENU_SLUG ],
			20 => [ 'Pages', 'edit_pages', Admin_Menu_Structure::PAGES_MENU_SLUG ],
			21 => [ 'Other', 'read', 'other' ],
		];

		// Act
		$menu = $this->structure->move_below_pages(
			$menu,
			Menu_Config::ELEMENTOR_HOME_MENU_SLUG,
			Admin_Menu_Structure::PAGES_MENU_SLUG
		);

		// Assert
		$this->assertSame( 'other', $menu[21][2] );
		$this->assertSame( Menu_Config::ELEMENTOR_HOME_MENU_SLUG, $menu[22][2] );
	}

	public function test_move_below_pages__leaves_the_menu_when_pages_is_missing() {
		// Arrange
		$menu = [
			2 => [ 'Elementor', 'manage_options', Menu_Config::ELEMENTOR_HOME_MENU_SLUG ],
		];

		// Act
		$updated = $this->structure->move_below_pages(
			$menu,
			Menu_Config::ELEMENTOR_HOME_MENU_SLUG,
			Admin_Menu_Structure::PAGES_MENU_SLUG
		);

		// Assert
		$this->assertSame( $menu, $updated );
	}

	public function test_build_submenu__orders_groups_and_keeps_upgrade_against_account() {
		// Arrange
		$parents = $this->parents_for( [
			Admin_Flow_Config::PARENT_HOME,
			Admin_Flow_Config::PARENT_AGENT_READY,
			Admin_Flow_Config::PARENT_MCP,
			Admin_Flow_Config::PARENT_TEMPLATES,
			Admin_Flow_Config::PARENT_THEME_BUILDER,
			Admin_Flow_Config::PARENT_POPUPS,
			Admin_Flow_Config::PARENT_SITE_ASSETS,
			Admin_Flow_Config::PARENT_SUBMISSIONS,
			Admin_Flow_Config::PARENT_SETTINGS,
			Admin_Flow_Config::PARENT_TOOLS,
			Admin_Flow_Config::PARENT_ACCOUNT,
		] );
		$existing = [
			[ 'Quick start', 'manage_options', 'admin.php?page=' . Admin_Flow_Config::PARENT_HOME ],
			[ 'Saved', 'edit_posts', Menu_Config::LEGACY_TEMPLATES_SLUG ],
			[ 'Angie', 'manage_options', 'angie-app' ],
			[ 'Sale Now!', 'manage_options', 'elementor-one-upgrade' ],
			[ 'Elementor MCP', 'manage_options', Admin_Flow_Config::PARENT_MCP ],
			[ 'Settings', 'manage_options', Admin_Flow_Config::PARENT_SETTINGS ],
		];

		// Act
		$submenu = $this->structure->build_submenu( $parents, $existing, $existing[3] );

		// Assert
		$slugs = array_column( $submenu, 2 );
		$this->assertSame(
			[
				Admin_Flow_Config::PARENT_HOME,
				Admin_Flow_Config::PARENT_AGENT_READY,
				Admin_Flow_Config::PARENT_MCP,
				'elementor-submenu-divider-' . Admin_Flow_Config::PARENT_TEMPLATES,
				Admin_Flow_Config::PARENT_TEMPLATES,
				Admin_Flow_Config::PARENT_THEME_BUILDER,
				Admin_Flow_Config::PARENT_POPUPS,
				'elementor-submenu-divider-' . Admin_Flow_Config::PARENT_SITE_ASSETS,
				Admin_Flow_Config::PARENT_SITE_ASSETS,
				Admin_Flow_Config::PARENT_SUBMISSIONS,
				'elementor-submenu-divider-' . Admin_Flow_Config::PARENT_SETTINGS,
				Admin_Flow_Config::PARENT_SETTINGS,
				Admin_Flow_Config::PARENT_TOOLS,
				'elementor-submenu-divider-' . Admin_Flow_Config::PARENT_ACCOUNT,
				Admin_Flow_Config::PARENT_ACCOUNT,
				'elementor-one-upgrade',
			],
			$slugs
		);
		$this->assertSame( 'Home', $submenu[0][0] );
		$this->assertSame( 'MCP', $submenu[2][0] );
		$this->assertSame( 'Settings', $submenu[11][0] );
		$this->assertNotContains( 'angie-app', $slugs );
		$this->assertNotContains( Menu_Config::LEGACY_TEMPLATES_SLUG, $slugs );
		$this->assertNotSame( Admin_Menu_Structure::DIVIDER_CLASS, $submenu[1][4] ?? '' );
		$this->assertSame( Admin_Menu_Structure::DIVIDER_CLASS, $submenu[3][4] );
		$this->assertNotSame( Admin_Menu_Structure::DIVIDER_CLASS, $submenu[9][4] ?? '' );
		$this->assertSame( Admin_Flow_Config::PARENT_ACCOUNT, $submenu[14][2] );
		$this->assertSame( 'elementor-one-upgrade', $submenu[15][2] );
	}

	public function test_build_submenu__adds_a_divider_before_upgrade_when_account_is_hidden() {
		// Arrange
		$parents = $this->parents_for( [
			Admin_Flow_Config::PARENT_HOME,
			Admin_Flow_Config::PARENT_SETTINGS,
		] );
		$upgrade = [ 'Upgrade', 'manage_options', 'go_elementor_pro' ];

		// Act
		$submenu = $this->structure->build_submenu( $parents, [ $upgrade ], $upgrade );

		// Assert
		$this->assertSame(
			[
				Admin_Flow_Config::PARENT_HOME,
				Admin_Flow_Config::PARENT_SETTINGS,
				'elementor-submenu-divider-upgrade',
				'go_elementor_pro',
			],
			array_column( $submenu, 2 )
		);
	}

	private function parents_for( array $slugs ): array {
		$parents = Admin_Flow_Config::get_config()['parents'];

		return array_intersect_key( $parents, array_flip( $slugs ) );
	}
}
