<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Modules\EditorOne\Classes\Admin_Flow_Config;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\EditorOne\Components\Admin_Flow_Handler;
use Elementor\Modules\EditorOne\Components\Admin_Menu_Structure;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Admin_Menu_Structure extends Elementor_Test_Base {

	private Admin_Menu_Structure $structure;

	private $original_submenu;

	public function setUp(): void {
		parent::setUp();

		require_once ABSPATH . 'wp-admin/includes/plugin.php';

		$this->original_submenu = $GLOBALS['submenu'] ?? null;
		$this->structure = new Admin_Menu_Structure( new Admin_Flow_Handler() );
	}

	public function tearDown(): void {
		$GLOBALS['submenu'] = $this->original_submenu;

		parent::tearDown();
	}

	public function has_home_page_data_provider(): array {
		return [
			'only under another parent' => [ [ Menu_Config::ELEMENTOR_MENU_SLUG ], false, false ],
			'under home without a page hook' => [ [ Menu_Config::ELEMENTOR_HOME_MENU_SLUG ], false, false ],
			'under home with a page hook' => [ [ Menu_Config::ELEMENTOR_HOME_MENU_SLUG ], true, true ],
		];
	}

	/**
	 * @dataProvider has_home_page_data_provider
	 */
	public function test_has_home_page__requires_a_linkable_page_under_home( array $parents, bool $has_hook, bool $expected ) {
		// Arrange
		$slug = Admin_Flow_Config::PARENT_TEMPLATES;
		$GLOBALS['submenu'] = [];

		foreach ( $parents as $parent_slug ) {
			$GLOBALS['submenu'][ $parent_slug ] = [ [ 'Templates', 'manage_options', $slug ] ];
		}

		$hook = get_plugin_page_hookname( $slug, Menu_Config::ELEMENTOR_HOME_MENU_SLUG );

		if ( $has_hook ) {
			add_action( $hook, '__return_empty_string' );
		}

		// Act
		$result = $this->structure->has_home_page( $slug );
		remove_all_actions( $hook );

		// Assert
		$this->assertSame( $expected, $result );
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
				Admin_Flow_Config::PARENT_TEMPLATES,
				Admin_Flow_Config::PARENT_THEME_BUILDER,
				Admin_Flow_Config::PARENT_POPUPS,
				Admin_Flow_Config::PARENT_SITE_ASSETS,
				Admin_Flow_Config::PARENT_SUBMISSIONS,
				Admin_Flow_Config::PARENT_SETTINGS,
				Admin_Flow_Config::PARENT_TOOLS,
				Admin_Flow_Config::PARENT_ACCOUNT,
				'elementor-one-upgrade',
			],
			$slugs
		);
		$this->assertSame(
			[
				Admin_Flow_Config::PARENT_TEMPLATES,
				Admin_Flow_Config::PARENT_SITE_ASSETS,
				Admin_Flow_Config::PARENT_SETTINGS,
				Admin_Flow_Config::PARENT_ACCOUNT,
			],
			$this->get_slugs_with_divider( $submenu )
		);
		$this->assertSame( 'Home', $submenu[0][0] );
		$this->assertSame( 'MCP', $submenu[2][0] );
		$this->assertSame( 'Settings', $submenu[8][0] );
		$this->assertNotContains( 'angie-app', $slugs );
		$this->assertNotContains( Menu_Config::LEGACY_TEMPLATES_SLUG, $slugs );
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
				'go_elementor_pro',
			],
			array_column( $submenu, 2 )
		);
		$this->assertSame( [ 'go_elementor_pro' ], $this->get_slugs_with_divider( $submenu ) );
	}

	private function get_slugs_with_divider( array $submenu ): array {
		$slugs = [];

		foreach ( $submenu as $item ) {
			if ( in_array( Admin_Menu_Structure::DIVIDER_CLASS, explode( ' ', $item[4] ?? '' ), true ) ) {
				$slugs[] = $item[2];
			}
		}

		return $slugs;
	}

	private function parents_for( array $slugs ): array {
		$parents = Admin_Flow_Config::get_config()['parents'];

		return array_intersect_key( $parents, array_flip( $slugs ) );
	}
}
