<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\App\AdminMenuItems\Editor_One_Theme_Builder_Menu;
use Elementor\App\Modules\KitLibrary\AdminMenuItems\Editor_One_Website_Templates_Menu;
use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;
use Elementor\Includes\TemplateLibrary\Sources\AdminMenuItems\Editor_One_Saved_Templates_Menu;
use Elementor\Modules\EditorOne\Classes\Admin_Flow_Config;
use Elementor\Modules\EditorOne\Classes\Admin_Flow_Map;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Admin_Flow_Map extends Elementor_Test_Base {

	const FREE_ITEMS = [
		'elementor-settings',
		'elementor-tools',
		'elementor-role-manager',
		'elementor-element-manager',
		Menu_Config::LEGACY_TEMPLATES_SLUG,
		'elementor-app',
		'popup_templates',
		'elementor_custom_code',
		'elementor_custom_fonts',
		'elementor_custom_icons',
		'elementor-connect-account',
		'elementor-system-info',
	];

	const PRO_ITEMS = [
		'elementor-settings',
		Menu_Config::LEGACY_TEMPLATES_SLUG,
		'edit.php?post_type=elementor_library&tabs_group=popup&elementor_library_type=popup',
		'edit.php?post_type=elementor_snippet',
		'edit.php?post_type=elementor_font',
		'edit.php?post_type=elementor_icons',
		'elementor-license',
		'elementor-system-info',
	];

	private Menu_Data_Provider $provider;

	public function setUp(): void {
		parent::setUp();
		$this->reset_menu_data_provider();
		$this->provider = Menu_Data_Provider::instance();
		$this->act_as_admin();
	}

	public function tearDown(): void {
		remove_all_filters( 'elementor/editor-one/admin-flow/config' );
		$this->reset_menu_data_provider();
		parent::tearDown();
	}

	public function resolve_data_provider(): array {
		return [
			'settings' => [ [ 'page' => 'elementor-settings' ], Admin_Flow_Config::PARENT_SETTINGS, 'settings' ],
			'tools' => [ [ 'page' => 'elementor-tools' ], Admin_Flow_Config::PARENT_TOOLS, 'tools' ],
			'role manager' => [ [ 'page' => 'elementor-role-manager' ], Admin_Flow_Config::PARENT_SETTINGS, 'role-manager' ],
			'element manager' => [ [ 'page' => 'elementor-element-manager' ], Admin_Flow_Config::PARENT_SETTINGS, 'element-manager' ],
			'saved templates' => [
				[ 'post_type' => 'elementor_library', 'tabs_group' => 'library' ],
				Admin_Flow_Config::PARENT_TEMPLATES,
				'saved-templates',
			],
			'saved templates without tabs group' => [
				[ 'post_type' => 'elementor_library', 'elementor_library_type' => 'page' ],
				Admin_Flow_Config::PARENT_TEMPLATES,
				'saved-templates',
			],
			'popups without tabs group' => [
				[ 'post_type' => 'elementor_library', 'elementor_library_type' => 'popup' ],
				Admin_Flow_Config::PARENT_POPUPS,
				'popups',
			],
			'theme builder admin page' => [
				[ 'post_type' => 'elementor_library', 'tabs_group' => 'theme' ],
				Admin_Flow_Config::PARENT_THEME_BUILDER,
				'theme-builder',
			],
			'popups promotion' => [ [ 'page' => 'popup_templates' ], Admin_Flow_Config::PARENT_POPUPS, 'popups' ],
			'code' => [ [ 'page' => 'elementor_custom_code' ], Admin_Flow_Config::PARENT_SITE_ASSETS, 'code' ],
			'fonts' => [ [ 'page' => 'elementor_custom_fonts' ], Admin_Flow_Config::PARENT_SITE_ASSETS, 'fonts' ],
			'icons' => [ [ 'page' => 'elementor_custom_icons' ], Admin_Flow_Config::PARENT_SITE_ASSETS, 'icons' ],
			'connect account' => [ [ 'page' => 'elementor-connect-account' ], Admin_Flow_Config::PARENT_ACCOUNT, 'account' ],
			'system info' => [ [ 'page' => 'elementor-system-info' ], Admin_Flow_Config::PARENT_ACCOUNT, 'system-info' ],
		];
	}

	/**
	 * @dataProvider resolve_data_provider
	 */
	public function test_resolve__returns_parent_and_tab_for_page( array $query_args, string $expected_parent, string $expected_tab ) {
		// Arrange
		$this->register_items( self::FREE_ITEMS );

		// Act
		$state = $this->create_map()->resolve( $query_args );

		// Assert
		$this->assertSame( $expected_parent, $state['parent'] );
		$this->assertSame( $expected_tab, $state['tab'] );
	}

	public function test_resolve__pro_popups_page_highlights_popups_not_templates() {
		// Arrange
		$this->register_items( self::PRO_ITEMS );

		// Act
		$state = $this->create_map()->resolve( [
			'post_type' => 'elementor_library',
			'tabs_group' => 'popup',
			'elementor_library_type' => 'popup',
		] );

		// Assert
		$this->assertSame( Admin_Flow_Config::PARENT_POPUPS, $state['parent'] );
		$this->assertSame( Admin_Flow_Config::GROUP_TEMPLATES, $state['group'] );
	}

	public function test_resolve__pro_site_assets_pages_highlight_site_assets() {
		// Arrange
		$this->register_items( self::PRO_ITEMS );
		$map = $this->create_map();

		// Act
		$states = array_map( function ( string $post_type ) use ( $map ) {
			return $map->resolve( [ 'post_type' => $post_type ] );
		}, [ 'elementor_snippet', 'elementor_font', 'elementor_icons' ] );

		// Assert
		$this->assertSame(
			[ Admin_Flow_Config::PARENT_SITE_ASSETS ],
			array_values( array_unique( array_column( $states, 'parent' ) ) )
		);
		$this->assertSame( [ 'code', 'fonts', 'icons' ], array_column( $states, 'tab' ) );
	}

	public function test_resolve__hidden_connect_page_highlights_account_without_bar() {
		// Arrange
		$this->register_items( self::FREE_ITEMS );

		// Act
		$state = $this->create_map()->resolve( [ 'page' => 'elementor-connect' ] );

		// Assert
		$this->assertSame( Admin_Flow_Config::PARENT_ACCOUNT, $state['parent'] );
		$this->assertSame( '', $state['group'] );
		$this->assertSame( '', $state['tab'] );
	}

	public function test_resolve__unmapped_page_returns_empty_state() {
		// Arrange
		$this->register_items( self::FREE_ITEMS );

		// Act
		$state = $this->create_map()->resolve( [ 'page' => 'e-site-planner-password-generator' ] );

		// Assert
		$this->assertSame( [ 'parent' => '', 'group' => '', 'tab' => '' ], $state );
	}

	public function test_get_tabs__keeps_spec_order() {
		// Arrange
		$this->register_items( array_reverse( self::FREE_ITEMS ) );

		// Act
		$tabs = $this->create_map()->get_tabs( Admin_Flow_Config::GROUP_SETTINGS );

		// Assert
		$this->assertSame( [ 'settings', 'tools', 'role-manager', 'element-manager' ], array_keys( $tabs ) );
	}

	public function reserved_slots_data_provider(): array {
		return [
			'code snippets' => [
				Admin_Flow_Config::GROUP_SITE_ASSETS,
				Admin_Flow_Config::CODE_SNIPPETS_SLUG,
				[ 'code', 'fonts', 'icons' ],
				'code-snippets',
			],
			'ai' => [
				Admin_Flow_Config::GROUP_SETTINGS,
				Admin_Flow_Config::AI_SETTINGS_SLUG,
				[ 'settings', 'tools', 'role-manager', 'element-manager' ],
				'ai',
			],
		];
	}

	/**
	 * @dataProvider reserved_slots_data_provider
	 */
	public function test_get_tabs__reserved_slot_hidden_until_registered( string $group, string $slug, array $expected_before, string $reserved_tab ) {
		// Arrange
		$this->register_items( self::FREE_ITEMS );

		// Act
		$tabs_before = $this->create_map()->get_tabs( $group );
		$this->register_items( [ $slug ] );
		$tabs_after = $this->create_map()->get_tabs( $group );

		// Assert
		$this->assertSame( $expected_before, array_keys( $tabs_before ) );
		$this->assertSame( array_merge( $expected_before, [ $reserved_tab ] ), array_keys( $tabs_after ) );
	}

	public function real_templates_items_data_provider(): array {
		return [
			'saved templates list' => [ [ 'post_type' => 'elementor_library', 'tabs_group' => 'library' ], Admin_Flow_Config::PARENT_TEMPLATES, 'saved-templates' ],
			'saved templates without tabs group' => [ [ 'post_type' => 'elementor_library' ], Admin_Flow_Config::PARENT_TEMPLATES, 'saved-templates' ],
			'saved templates by type' => [ [ 'post_type' => 'elementor_library', 'elementor_library_type' => 'page' ], Admin_Flow_Config::PARENT_TEMPLATES, 'saved-templates' ],
			'theme builder admin page' => [ [ 'post_type' => 'elementor_library', 'tabs_group' => 'theme' ], Admin_Flow_Config::PARENT_THEME_BUILDER, 'theme-builder' ],
		];
	}

	/**
	 * @dataProvider real_templates_items_data_provider
	 */
	public function test_resolve__real_templates_items( array $query_args, string $expected_parent, string $expected_tab ) {
		// Arrange
		$this->provider->register_level4_item( new Editor_One_Saved_Templates_Menu() );
		$this->provider->register_level4_item( new Editor_One_Theme_Builder_Menu() );

		// Act
		$state = $this->create_map()->resolve( $query_args );

		// Assert
		$this->assertSame( $expected_parent, $state['parent'] );
		$this->assertSame( $expected_tab, $state['tab'] );
	}

	public function test_get_tabs__hides_items_without_capability() {
		// Arrange
		$this->register_items( self::FREE_ITEMS );
		$this->register_items( [ Menu_Config::LEGACY_TEMPLATES_SLUG ], 'edit_posts' );
		$this->act_as_editor();
		$map = $this->create_map();

		// Act
		$settings_tabs = $map->get_tabs( Admin_Flow_Config::GROUP_SETTINGS );
		$templates_tabs = $map->get_tabs( Admin_Flow_Config::GROUP_TEMPLATES );

		// Assert
		$this->assertEmpty( $settings_tabs );
		$this->assertSame( [ 'saved-templates' ], array_keys( $templates_tabs ) );
		$this->assertSame( '', $map->get_default_url( Admin_Flow_Config::PARENT_SETTINGS ) );
	}

	public function account_default_data_provider(): array {
		return [
			'free' => [ self::FREE_ITEMS, 'page=elementor-connect-account' ],
			'pro' => [ self::PRO_ITEMS, 'page=elementor-license' ],
		];
	}

	/**
	 * @dataProvider account_default_data_provider
	 */
	public function test_get_default_url__account_depends_on_pro_state( array $items, string $expected_query ) {
		// Arrange
		$this->register_items( $items );

		// Act
		$url = $this->create_map()->get_default_url( Admin_Flow_Config::PARENT_ACCOUNT );

		// Assert
		$this->assertStringContainsString( $expected_query, $url );
	}

	public function test_get_default_url__site_assets_opens_code() {
		// Arrange
		$this->register_items( self::PRO_ITEMS );

		// Act
		$url = $this->create_map()->get_default_url( Admin_Flow_Config::PARENT_SITE_ASSETS );

		// Assert
		$this->assertSame( admin_url( 'edit.php?post_type=elementor_snippet' ), $url );
	}

	public function test_get_default_url__conditional_parent_without_items_is_empty() {
		// Arrange
		$this->register_items( self::FREE_ITEMS );

		// Act
		$mcp_url = $this->create_map()->get_default_url( Admin_Flow_Config::PARENT_MCP );
		$agent_ready_url = $this->create_map()->get_default_url( Admin_Flow_Config::PARENT_AGENT_READY );

		// Assert
		$this->assertSame( '', $mcp_url );
		$this->assertSame( '', $agent_ready_url );
	}

	public function test_get_tabs__website_templates_opens_full_screen_library() {
		// Arrange
		$this->provider->register_level4_item( new Editor_One_Website_Templates_Menu() );

		// Act
		$tabs = $this->create_map()->get_tabs( Admin_Flow_Config::GROUP_TEMPLATES );

		// Assert
		$this->assertStringContainsString( '#/kit-library', $tabs['website-templates']['url'] );
		$this->assertEmpty( $tabs['website-templates']['routes'] );
	}

	public function test_get_parent_redirect_url__redirects_alias_to_default_destination() {
		// Arrange
		$this->register_items( self::FREE_ITEMS );
		$map = $this->create_map();

		// Act
		$site_assets_redirect = $map->get_parent_redirect_url( Admin_Flow_Config::PARENT_SITE_ASSETS );
		$settings_redirect = $map->get_parent_redirect_url( Admin_Flow_Config::PARENT_SETTINGS );
		$unknown_redirect = $map->get_parent_redirect_url( 'elementor-unknown' );

		// Assert
		$this->assertSame( admin_url( 'admin.php?page=elementor_custom_code' ), $site_assets_redirect );
		$this->assertSame( '', $settings_redirect );
		$this->assertSame( '', $unknown_redirect );
	}

	public function test_config_filter__allows_external_registration() {
		// Arrange
		$this->register_items( [ 'elementor-settings', 'third-party-page' ] );
		add_filter( 'elementor/editor-one/admin-flow/config', function ( array $config ): array {
			$config['groups'][ Admin_Flow_Config::GROUP_SETTINGS ]['third-party'] = [
				'parent' => Admin_Flow_Config::PARENT_SETTINGS,
				'items' => [ 'third-party-page' ],
			];

			return $config;
		} );

		// Act
		$state = $this->create_map()->resolve( [ 'page' => 'third-party-page' ] );

		// Assert
		$this->assertSame( Admin_Flow_Config::PARENT_SETTINGS, $state['parent'] );
		$this->assertSame( 'third-party', $state['tab'] );
	}

	private function create_map(): Admin_Flow_Map {
		return new Admin_Flow_Map( $this->provider, Admin_Flow_Config::get_config() );
	}

	private function register_items( array $slugs, string $capability = 'manage_options' ): void {
		foreach ( $slugs as $slug ) {
			$item = $this->createMock( Menu_Item_Interface::class );
			$item->method( 'get_slug' )->willReturn( $slug );
			$item->method( 'get_label' )->willReturn( $slug );
			$item->method( 'get_group_id' )->willReturn( 'test-group' );
			$item->method( 'get_parent_slug' )->willReturn( Menu_Config::ELEMENTOR_MENU_SLUG );
			$item->method( 'get_capability' )->willReturn( $capability );
			$item->method( 'is_visible' )->willReturn( true );

			$this->provider->register_level4_item( $item );
		}
	}

	private function reset_menu_data_provider(): void {
		$reflection = new \ReflectionClass( Menu_Data_Provider::class );
		$instance_property = $reflection->getProperty( 'instance' );
		$instance_property->setAccessible( true );
		$instance_property->setValue( null, null );
	}
}
