<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Admin_Flow_Config;
use Elementor\Modules\EditorOne\Classes\Admin_Flow_Map;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Modules\EditorOne\Components\Admin_Flow_Handler;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Admin_Flow_Handler extends Elementor_Test_Base {

	private array $original_globals = [];

	public function setUp(): void {
		parent::setUp();

		require_once ABSPATH . 'wp-admin/includes/plugin.php';

		foreach ( $this->get_menu_global_names() as $name ) {
			$this->original_globals[ $name ] = $GLOBALS[ $name ] ?? null;
		}
	}

	public function tearDown(): void {
		foreach ( $this->original_globals as $name => $value ) {
			$GLOBALS[ $name ] = $value;
		}

		$reflection = new \ReflectionProperty( Menu_Data_Provider::class, 'instance' );
		$reflection->setAccessible( true );
		$reflection->setValue( null, null );

		parent::tearDown();
	}

	public function hidden_legacy_parent_data_provider(): array {
		return [
			'legacy templates list' => [
				'edit.php',
				'elementor_library',
				null,
				Admin_Flow_Config::PARENT_TEMPLATES,
			],
			'legacy home page' => [
				'admin.php',
				'',
				Menu_Config::ELEMENTOR_MENU_SLUG,
				Admin_Flow_Config::PARENT_HOME,
			],
		];
	}

	/**
	 * @dataProvider hidden_legacy_parent_data_provider
	 */
	public function test_filter_parent_file__survives_wordpress_parent_detection( string $pagenow, string $typenow, ?string $plugin_page, string $active_parent ) {
		// Arrange
		$this->set_menu_globals( $pagenow, $typenow, $plugin_page );
		$handler = $this->create_handler_with_active_parent( $active_parent );

		// Act
		$GLOBALS['parent_file'] = $handler->filter_parent_file( $GLOBALS['parent_file'] );
		$detected_parent = get_admin_page_parent();

		// Assert
		$this->assertSame( Menu_Config::ELEMENTOR_HOME_MENU_SLUG, $detected_parent );
		$this->assertSame( Menu_Config::ELEMENTOR_HOME_MENU_SLUG, $GLOBALS['parent_file'] );
	}

	public function test_filter_parent_file__keeps_unmapped_pages_untouched() {
		// Arrange
		$this->set_menu_globals( 'edit.php', 'elementor_library', null );
		$handler = $this->create_handler_with_active_parent( '' );

		// Act
		$parent_file = $handler->filter_parent_file( 'edit.php?post_type=elementor_library' );

		// Assert
		$this->assertSame( 'edit.php?post_type=elementor_library', $parent_file );
		$this->assertEmpty( $GLOBALS['_wp_real_parent_file'] );
	}

	public function test_get_active_state__falls_back_to_screen_post_type_on_edit_screens() {
		// Arrange
		$GLOBALS['typenow'] = 'elementor_snippet';
		$map = $this->createMock( Admin_Flow_Map::class );
		$map->expects( $this->once() )
			->method( 'resolve' )
			->with( [ 'post_type' => 'elementor_snippet' ] )
			->willReturn( [
				'parent' => Admin_Flow_Config::PARENT_SITE_ASSETS,
				'group' => Admin_Flow_Config::GROUP_SITE_ASSETS,
				'tab' => 'code',
			] );
		$handler = $this->create_handler_with_map( $map );

		// Act
		$state = $handler->get_active_state();

		// Assert
		$this->assertSame( Admin_Flow_Config::PARENT_SITE_ASSETS, $state['parent'] );
	}

	public function redirect_return_to_data_provider(): array {
		return [
			'with referer' => [ 'wp-admin/admin.php?page=elementor-settings', 'wp-admin/admin.php?page=elementor-settings' ],
			'without referer' => [ '', 'wp-admin/admin.php?page=' . Menu_Config::ELEMENTOR_MENU_SLUG ],
		];
	}

	/**
	 * @dataProvider redirect_return_to_data_provider
	 */
	public function test_get_redirect_url__does_not_return_to_the_alias( string $referer_path, string $expected_return_path ) {
		// Arrange
		$alias_uri = '/wp-admin/admin.php?page=' . Admin_Flow_Config::PARENT_THEME_BUILDER;
		$original_server = $_SERVER;
		$_SERVER['REQUEST_URI'] = $alias_uri;
		$_SERVER['HTTP_REFERER'] = $referer_path ? home_url( $referer_path ) : '';
		$map = $this->createMock( Admin_Flow_Map::class );
		$map->method( 'get_parent_redirect_url' )->willReturn(
			admin_url( 'admin.php?page=elementor-app&return_to=' . $alias_uri . '#/site-editor' )
		);
		$handler = $this->create_handler_with_map( $map );

		// Act
		$redirect_url = $handler->get_redirect_url( Admin_Flow_Config::PARENT_THEME_BUILDER );
		$_SERVER = $original_server;

		// Assert
		$this->assertStringNotContainsString( Admin_Flow_Config::PARENT_THEME_BUILDER, $redirect_url );
		$this->assertStringEndsWith( '#/site-editor', $redirect_url );
		$this->assertStringContainsString( 'return_to=' . rawurlencode( home_url( $expected_return_path ) ), $redirect_url );
	}

	public function alias_redirect_data_provider(): array {
		return [
			'alias redirects to its default tab' => [ Admin_Flow_Config::PARENT_SITE_ASSETS, 'manage_options', admin_url( 'admin.php?page=elementor_custom_code' ) ],
			'alias that is its own default' => [ Admin_Flow_Config::PARENT_SETTINGS, 'manage_options', '' ],
			'user without an accessible tab' => [ Admin_Flow_Config::PARENT_SITE_ASSETS, 'do_not_allow', '' ],
		];
	}

	/**
	 * @dataProvider alias_redirect_data_provider
	 */
	public function test_get_redirect_url__redirects_alias_to_default_tab( string $page, string $capability, string $expected_url ) {
		// Arrange
		$this->act_as_admin();
		$this->register_items( [ 'elementor-settings', 'elementor_custom_code' ], $capability );
		$handler = new Admin_Flow_Handler();

		// Act
		$redirect_url = $handler->get_redirect_url( $page );

		// Assert
		$this->assertSame( $expected_url, $redirect_url );
	}

	public function submenu_file_data_provider(): array {
		return [
			'mapped page with registered entry' => [ Admin_Flow_Config::PARENT_SETTINGS, Admin_Flow_Config::PARENT_SETTINGS ],
			'mapped page without registered entry' => [ Admin_Flow_Config::PARENT_ACCOUNT, 'original-submenu' ],
			'unmapped page' => [ '', 'original-submenu' ],
		];
	}

	/**
	 * @dataProvider submenu_file_data_provider
	 */
	public function test_filter_submenu_file__highlights_only_registered_parent( string $active_parent, string $expected ) {
		// Arrange
		$this->set_menu_globals( 'admin.php', '', $active_parent );
		$GLOBALS['submenu'][ Menu_Config::ELEMENTOR_HOME_MENU_SLUG ][] = [ 'Settings', 'manage_options', Admin_Flow_Config::PARENT_SETTINGS ];
		$handler = $this->create_handler_with_active_parent( $active_parent );

		// Act
		$submenu_file = $handler->filter_submenu_file( 'original-submenu' );

		// Assert
		$this->assertSame( $expected, $submenu_file );
	}

	private function register_items( array $slugs, string $capability ): void {
		$reflection = new \ReflectionProperty( Menu_Data_Provider::class, 'instance' );
		$reflection->setAccessible( true );
		$reflection->setValue( null, null );

		foreach ( $slugs as $slug ) {
			$item = $this->createMock( Menu_Item_Interface::class );
			$item->method( 'get_slug' )->willReturn( $slug );
			$item->method( 'get_label' )->willReturn( $slug );
			$item->method( 'get_group_id' )->willReturn( 'test-group' );
			$item->method( 'get_parent_slug' )->willReturn( Menu_Config::ELEMENTOR_MENU_SLUG );
			$item->method( 'get_capability' )->willReturn( $capability );
			$item->method( 'is_visible' )->willReturn( true );

			Menu_Data_Provider::instance()->register_level4_item( $item );
		}
	}

	private function create_handler_with_map( Admin_Flow_Map $map ): Admin_Flow_Handler {
		$handler = new Admin_Flow_Handler();
		$property = new \ReflectionProperty( Admin_Flow_Handler::class, 'map' );
		$property->setAccessible( true );
		$property->setValue( $handler, $map );

		return $handler;
	}

	private function set_menu_globals( string $pagenow, string $typenow, ?string $plugin_page ): void {
		$GLOBALS['menu'] = [
			[ 'Elementor', 'manage_options', Menu_Config::ELEMENTOR_HOME_MENU_SLUG ],
			[ 'Elementor', 'manage_options', Menu_Config::ELEMENTOR_MENU_SLUG ],
			[ 'Templates', 'edit_posts', Menu_Config::LEGACY_TEMPLATES_SLUG ],
		];
		$GLOBALS['submenu'] = [
			Menu_Config::ELEMENTOR_HOME_MENU_SLUG => [
				[ 'Editor', 'edit_posts', Menu_Config::ELEMENTOR_MENU_SLUG ],
			],
			Menu_Config::LEGACY_TEMPLATES_SLUG => [
				[ 'Saved Templates', 'edit_posts', Menu_Config::LEGACY_TEMPLATES_SLUG ],
			],
		];
		$GLOBALS['pagenow'] = $pagenow;
		$GLOBALS['typenow'] = $typenow;
		$GLOBALS['plugin_page'] = $plugin_page;
		$GLOBALS['parent_file'] = null;
		$GLOBALS['_wp_real_parent_file'] = [];
		$GLOBALS['_wp_menu_nopriv'] = [];
		$GLOBALS['_wp_submenu_nopriv'] = [];
	}

	private function create_handler_with_active_parent( string $active_parent ): Admin_Flow_Handler {
		$handler = new Admin_Flow_Handler();
		$property = new \ReflectionProperty( Admin_Flow_Handler::class, 'active_state' );
		$property->setAccessible( true );
		$property->setValue( $handler, [
			'parent' => $active_parent,
			'group' => '',
			'tab' => '',
		] );

		return $handler;
	}

	private function get_menu_global_names(): array {
		return [ 'menu', 'submenu', 'pagenow', 'typenow', 'plugin_page', 'parent_file', '_wp_real_parent_file', '_wp_menu_nopriv', '_wp_submenu_nopriv' ];
	}
}
