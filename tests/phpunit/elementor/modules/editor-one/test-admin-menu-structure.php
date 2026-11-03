<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Admin_Flow_Config;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Modules\EditorOne\Classes\Subscription_Action;
use Elementor\Modules\EditorOne\Components\Admin_Flow_Handler;
use Elementor\Modules\EditorOne\Components\Admin_Menu_Structure;
use Elementor\Modules\Promotions\AdminMenuItems\Go_Pro_Promotion_Item;
use Elementor\Utils;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Admin_Menu_Structure extends Elementor_Test_Base {

	private Admin_Menu_Structure $structure;

	private $original_submenu;

	private ?string $page_hook = null;

	public function setUp(): void {
		parent::setUp();

		require_once ABSPATH . 'wp-admin/includes/plugin.php';

		$this->act_as_admin();
		$this->original_submenu = $GLOBALS['submenu'] ?? null;
		$this->structure = new Admin_Menu_Structure( new Admin_Flow_Handler() );
	}

	public function tearDown(): void {
		$GLOBALS['submenu'] = $this->original_submenu;

		if ( $this->page_hook ) {
			remove_all_actions( $this->page_hook );
		}

		$this->reset_menu_data_provider();

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

		$this->page_hook = get_plugin_page_hookname( $slug, Menu_Config::ELEMENTOR_HOME_MENU_SLUG );

		if ( $has_hook ) {
			add_action( $this->page_hook, '__return_empty_string' );
		}

		// Act
		$result = $this->structure->has_home_page( $slug );

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

	public function test_build_submenu__lists_extra_items_in_their_own_section_before_account() {
		// Arrange
		$parents = $this->parents_for( [
			Admin_Flow_Config::PARENT_HOME,
			Admin_Flow_Config::PARENT_TOOLS,
			Admin_Flow_Config::PARENT_ACCOUNT,
		] );
		$upgrade = [ 'Upgrade', 'manage_options', 'elementor-one-upgrade' ];
		$extra_items = [ [ 'Addon', 'manage_options', 'my-addon' ] ];

		// Act
		$submenu = $this->structure->build_submenu( $parents, [], $upgrade, $extra_items );

		// Assert
		$this->assertSame(
			[
				Admin_Flow_Config::PARENT_HOME,
				Admin_Flow_Config::PARENT_TOOLS,
				'my-addon',
				Admin_Flow_Config::PARENT_ACCOUNT,
				'elementor-one-upgrade',
			],
			array_column( $submenu, 2 )
		);
		$this->assertSame( [ 'my-addon', Admin_Flow_Config::PARENT_ACCOUNT ], $this->get_slugs_with_divider( $submenu ) );
	}

	public function test_get_extra_items__keeps_only_items_outside_the_admin_flow() {
		// Arrange
		$existing = [
			[ 'Home', 'manage_options', Admin_Menu_Structure::HOME_ALIAS_SLUG ],
			[ 'Editor', 'edit_posts', Menu_Config::ELEMENTOR_MENU_SLUG ],
			[ 'Settings', 'manage_options', Admin_Flow_Config::PARENT_SETTINGS ],
			[ 'Upgrade', 'manage_options', 'go_elementor_pro' ],
			[ 'Addon', 'manage_options', 'my-addon' ],
		];

		// Act
		$extra_items = $this->structure->get_extra_items( $existing );

		// Assert
		$this->assertSame( [ 'my-addon' ], array_column( $extra_items, 2 ) );
	}

	public function test_resolve_subscription_action__uses_upgrade_slug_for_renew_now() {
		// Arrange
		$this->register_subscription_action( 'Renew Now', 'https://go.elementor.com/wp-menu-renew/', 61 );

		// Act
		$action = $this->resolve_subscription_action( [] );

		// Assert
		$this->assertSame( 'Renew Now', $action[0] );
		$this->assertSame( 'elementor-one-upgrade', $action[2] );
		$this->assertSame( 'https://go.elementor.com/wp-menu-renew/', Subscription_Action::get_external_upgrade_url() );
	}

	public function test_resolve_subscription_action__uses_upgrade_slug_for_unlock_more_features() {
		// Arrange
		$this->register_subscription_action( 'Unlock More Features', 'https://go.elementor.com/go-pro-advanced-elementor-menu/', 62 );

		// Act
		$action = $this->resolve_subscription_action( [] );

		// Assert
		$this->assertSame( 'Unlock More Features', $action[0] );
		$this->assertSame( 'elementor-one-upgrade', $action[2] );
	}

	public function test_resolve_subscription_action__prefers_the_registered_action_over_upgrade() {
		// Arrange
		$this->register_subscription_action( 'Renew Now', 'https://go.elementor.com/wp-menu-renew/', 61 );
		$this->register_subscription_action( 'Unlock More Features', 'https://go.elementor.com/go-pro-advanced-elementor-menu/', 62 );
		$existing = [
			[ 'Sale Now!', 'manage_options', 'elementor-one-upgrade' ],
		];

		// Act
		$action = $this->resolve_subscription_action( $existing );

		// Assert
		$this->assertSame( 'Renew Now', $action[0] );
		$this->assertSame( 'elementor-one-upgrade', $action[2] );
	}

	public function test_resolve_subscription_action__keeps_the_sale_label_on_the_free_upgrade() {
		// Arrange
		$existing = [
			[ 'Sale Now!', 'manage_options', 'elementor-one-upgrade' ],
		];

		// Act
		$action = $this->resolve_subscription_action( $existing );

		// Assert
		$this->assertSame( 'Sale Now!', $action[0] );
		$this->assertSame( 'elementor-one-upgrade', $action[2] );
	}

	public function test_resolve_subscription_action__adds_the_sidebar_upgrade_when_it_is_missing() {
		// Arrange
		$existing = [];

		// Act
		$action = $this->resolve_subscription_action( $existing );

		// Assert
		if ( Utils::has_pro() ) {
			$this->assertNull( $action );
			return;
		}

		$this->assertSame( ( new Go_Pro_Promotion_Item() )->get_label(), $action[0] );
		$this->assertSame( 'elementor-one-upgrade', $action[2] );
	}

	public function test_resolve_subscription_action__ignores_empty_upgrade_page_placeholder() {
		// Arrange — register_upgrade_submenu_page() adds an unlabeled row for the page hook.
		$existing = [
			[ '', 'manage_options', 'elementor-one-upgrade', '' ],
		];

		// Act
		$action = $this->resolve_subscription_action( $existing );

		// Assert
		if ( Utils::has_pro() ) {
			$this->assertNull( $action );
			return;
		}

		$this->assertSame( ( new Go_Pro_Promotion_Item() )->get_label(), $action[0] );
	}

	public function test_resolve_subscription_action__ignores_a_hidden_registered_action() {
		// Arrange
		$this->register_subscription_action( 'Renew Now', 'https://go.elementor.com/wp-menu-renew/', 61, false );
		$existing = [
			[ 'Upgrade', 'manage_options', 'elementor-one-upgrade' ],
		];

		// Act
		$action = $this->resolve_subscription_action( $existing );

		// Assert
		$this->assertSame( 'elementor-one-upgrade', $action[2] );
	}

	public function test_get_extra_items__drops_locked_items_that_belong_to_the_map() {
		// Arrange
		$this->register_subscription_action( 'Popups', 'popup_templates', 50, true, Menu_Config::TEMPLATES_GROUP_ID );
		$existing = [
			[ 'Popups', 'manage_options', 'popup_templates' ],
			[ 'Fonts', 'manage_options', 'elementor_custom_fonts' ],
			[ 'Addon', 'manage_options', 'my-addon' ],
		];
		Menu_Data_Provider::instance()->register_level4_item( $this->create_menu_item( 'Fonts', 'elementor_custom_fonts', 10, true, Menu_Config::CUSTOM_ELEMENTS_GROUP_ID ) );

		// Act
		$extra_items = $this->structure->get_extra_items( $existing );

		// Assert
		$this->assertSame( [ 'my-addon' ], array_column( $extra_items, 2 ) );
	}

	public function test_rebuild_submenu__styles_unlock_more_features_like_upgrade() {
		// Arrange
		$this->register_subscription_action( 'Unlock More Features', 'https://go.elementor.com/go-pro-advanced-elementor-menu/', 62 );
		$GLOBALS['submenu'] = [
			Menu_Config::ELEMENTOR_HOME_MENU_SLUG => [
				[ 'Home', 'manage_options', Admin_Flow_Config::PARENT_HOME ],
			],
		];

		// Act
		$this->structure->rebuild_submenu();

		// Assert
		$slugs = array_column( $GLOBALS['submenu'][ Menu_Config::ELEMENTOR_HOME_MENU_SLUG ], 2 );
		$this->assertSame( 'elementor-one-upgrade', $slugs[ count( $slugs ) - 1 ] );
	}

	public function test_rebuild_submenu__places_the_subscription_action_after_account() {
		// Arrange
		$this->register_subscription_action( 'Renew Now', 'https://go.elementor.com/wp-menu-renew/', 61 );
		$GLOBALS['submenu'] = [
			Menu_Config::ELEMENTOR_HOME_MENU_SLUG => [
				[ 'Upgrade', 'manage_options', 'elementor-one-upgrade' ],
				[ 'Home', 'manage_options', Admin_Flow_Config::PARENT_HOME ],
			],
		];

		// Act
		$this->structure->rebuild_submenu();

		// Assert
		$slugs = array_column( $GLOBALS['submenu'][ Menu_Config::ELEMENTOR_HOME_MENU_SLUG ], 2 );
		$this->assertSame( 'elementor-one-upgrade', $slugs[ count( $slugs ) - 1 ] );
	}

	public function test_rebuild_submenu__keeps_the_submenu_for_users_without_manage_options() {
		// Arrange
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'editor' ] ) );
		$items = [
			[ 'Editor', 'edit_posts', Menu_Config::ELEMENTOR_MENU_SLUG ],
			[ 'Addon', 'edit_posts', 'my-addon' ],
		];
		$GLOBALS['submenu'] = [ Menu_Config::ELEMENTOR_HOME_MENU_SLUG => $items ];

		// Act
		$this->structure->rebuild_submenu();

		// Assert
		$this->assertSame( $items, $GLOBALS['submenu'][ Menu_Config::ELEMENTOR_HOME_MENU_SLUG ] );
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

	private function register_subscription_action( string $label, string $slug, int $position, bool $visible = true, string $group_id = Menu_Config::SYSTEM_GROUP_ID ): void {
		Menu_Data_Provider::instance()->register_level4_item( $this->create_menu_item( $label, $slug, $position, $visible, $group_id ) );
	}

	private function create_menu_item( string $label, string $slug, int $position, bool $visible, string $group_id ): Menu_Item_Interface {
		$item = $this->createMock( Menu_Item_Interface::class );
		$item->method( 'get_slug' )->willReturn( $slug );
		$item->method( 'get_label' )->willReturn( $label );
		$item->method( 'get_group_id' )->willReturn( $group_id );
		$item->method( 'get_parent_slug' )->willReturn( Menu_Config::ELEMENTOR_HOME_MENU_SLUG );
		$item->method( 'get_capability' )->willReturn( 'manage_options' );
		$item->method( 'get_position' )->willReturn( $position );
		$item->method( 'is_visible' )->willReturn( $visible );

		return $item;
	}

	private function reset_menu_data_provider(): void {
		$reflection = new \ReflectionClass( Menu_Data_Provider::class );
		$instance_property = $reflection->getProperty( 'instance' );
		$instance_property->setAccessible( true );
		$instance_property->setValue( null, null );
	}

	private function parents_for( array $slugs ): array {
		$parents = Admin_Flow_Config::get_config()['parents'];

		return array_intersect_key( $parents, array_flip( $slugs ) );
	}

	private function resolve_subscription_action( array $existing_items ): ?array {
		$method = new \ReflectionMethod( Admin_Menu_Structure::class, 'resolve_subscription_action' );
		$method->setAccessible( true );

		return $method->invoke( $this->structure, $existing_items );
	}
}
