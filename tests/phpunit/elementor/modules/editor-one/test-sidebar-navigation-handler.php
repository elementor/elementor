<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Modules\EditorOne\Classes\Menu\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Menu\Menu_Item_Third_Level_Interface;
use Elementor\Modules\EditorOne\Components\Sidebar_Navigation_Handler;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Sidebar_Navigation_Handler extends Elementor_Test_Base {

	private Sidebar_Navigation_Handler $handler;
	private Menu_Data_Provider $menu_data_provider;
	private array $original_menu;
	private array $original_submenu;

	public function setUp(): void {
		parent::setUp();

		$this->activate_editor_one_experiment();
		$this->reset_menu_data_provider();

		global $menu, $submenu;
		$this->original_menu = $menu ?? [];
		$this->original_submenu = $submenu ?? [];

		$menu = [];
		$submenu = [];

		$this->menu_data_provider = Menu_Data_Provider::instance();
		$this->handler = new Sidebar_Navigation_Handler();
	}

	public function tearDown(): void {
		parent::tearDown();

		global $menu, $submenu;
		$menu = $this->original_menu;
		$submenu = $this->original_submenu;

		$this->reset_menu_data_provider();
		$this->deactivate_editor_one_experiment();
	}

	public function test_filter_menu_items_for_limited_users__returns_all_items_for_admin() {
		$admin_user = $this->create_user_with_role( 'administrator' );
		wp_set_current_user( $admin_user );

		$menu_items = [
			[
				'slug' => 'elementor-templates',
				'group_id' => Menu_Config::TEMPLATES_GROUP_ID,
			],
			[
				'slug' => 'elementor-settings',
				'group_id' => Menu_Config::SETTINGS_GROUP_ID,
			],
		];

		$result = $this->invoke_private_method( $this->handler, 'filter_menu_items_for_limited_users', [ $menu_items ] );

		$this->assertCount( 2, $result );
		$this->assertEquals( $menu_items, $result );

		wp_delete_user( $admin_user );
	}

	public function test_filter_menu_items_for_limited_users__returns_all_items_for_user_without_edit_posts() {
		$subscriber_user = $this->create_user_with_role( 'subscriber' );
		wp_set_current_user( $subscriber_user );

		$menu_items = [
			[
				'slug' => 'elementor-templates',
				'group_id' => Menu_Config::TEMPLATES_GROUP_ID,
			],
		];

		$result = $this->invoke_private_method( $this->handler, 'filter_menu_items_for_limited_users', [ $menu_items ] );

		$this->assertCount( 1, $result );
		$this->assertEquals( $menu_items, $result );

		wp_delete_user( $subscriber_user );
	}

	public function test_filter_menu_items_for_limited_users__filters_templates_group_for_editor_user() {
		$editor_user = $this->create_user_with_role( 'editor' );
		wp_set_current_user( $editor_user );

		$accessible_item = $this->create_mock_level3_item( 'elementor-templates', Menu_Config::TEMPLATES_GROUP_ID, 'edit_posts' );
		$inaccessible_item = $this->create_mock_level3_item( 'elementor-templates-pro', Menu_Config::TEMPLATES_GROUP_ID, 'manage_options' );

		$this->menu_data_provider->register_level3_item( $accessible_item );
		$this->menu_data_provider->register_level3_item( $inaccessible_item );

		$menu_items = [
			[
				'slug' => 'elementor-templates',
				'group_id' => Menu_Config::TEMPLATES_GROUP_ID,
			],
			[
				'slug' => 'elementor-templates-pro',
				'group_id' => Menu_Config::TEMPLATES_GROUP_ID,
			],
			[
				'slug' => 'elementor-settings',
				'group_id' => Menu_Config::SETTINGS_GROUP_ID,
			],
		];

		$result = $this->invoke_private_method( $this->handler, 'filter_menu_items_for_limited_users', [ $menu_items ] );

		$this->assertCount( 1, $result );
		$this->assertEquals( 'elementor-templates', $result[0]['slug'] );

		wp_delete_user( $editor_user );
	}

	public function test_filter_menu_items_for_limited_users__includes_item_if_accessible() {
		$editor_user = $this->create_user_with_role( 'editor' );
		wp_set_current_user( $editor_user );

		$accessible_item = $this->create_mock_level3_item( 'elementor-templates', Menu_Config::TEMPLATES_GROUP_ID, 'edit_posts', false );

		$this->menu_data_provider->register_level3_item( $accessible_item );

		$menu_items = [
			[
				'slug' => 'elementor-templates',
				'group_id' => Menu_Config::TEMPLATES_GROUP_ID,
			],
		];

		$result = $this->invoke_private_method( $this->handler, 'filter_menu_items_for_limited_users', [ $menu_items ] );

		$this->assertCount( 1, $result );
		$this->assertEquals( 'elementor-templates', $result[0]['slug'] );

		wp_delete_user( $editor_user );
	}

	public function test_filter_menu_items_for_limited_users__includes_item_if_has_accessible_child() {
		$editor_user = $this->create_user_with_role( 'editor' );
		wp_set_current_user( $editor_user );

		$parent_item = $this->create_mock_level3_item( 'elementor-templates', Menu_Config::TEMPLATES_GROUP_ID, 'manage_options', true );
		$accessible_child = $this->create_mock_level4_item( 'saved-templates', Menu_Config::TEMPLATES_GROUP_ID, 'edit_posts' );
		$inaccessible_child = $this->create_mock_level4_item( 'website-templates', Menu_Config::TEMPLATES_GROUP_ID, 'manage_options' );

		$this->menu_data_provider->register_level3_item( $parent_item );
		$this->menu_data_provider->register_level4_item( $accessible_child );
		$this->menu_data_provider->register_level4_item( $inaccessible_child );

		$menu_items = [
			[
				'slug' => 'elementor-templates',
				'group_id' => Menu_Config::TEMPLATES_GROUP_ID,
			],
		];

		$result = $this->invoke_private_method( $this->handler, 'filter_menu_items_for_limited_users', [ $menu_items ] );

		$this->assertCount( 1, $result );
		$this->assertEquals( 'elementor-templates', $result[0]['slug'] );

		wp_delete_user( $editor_user );
	}

	public function test_filter_menu_items_for_limited_users__excludes_item_if_not_accessible_and_no_children() {
		$editor_user = $this->create_user_with_role( 'editor' );
		wp_set_current_user( $editor_user );

		$inaccessible_item = $this->create_mock_level3_item( 'elementor-templates', Menu_Config::TEMPLATES_GROUP_ID, 'manage_options', false );

		$this->menu_data_provider->register_level3_item( $inaccessible_item );

		$menu_items = [
			[
				'slug' => 'elementor-templates',
				'group_id' => Menu_Config::TEMPLATES_GROUP_ID,
			],
		];

		$result = $this->invoke_private_method( $this->handler, 'filter_menu_items_for_limited_users', [ $menu_items ] );

		$this->assertCount( 0, $result );

		wp_delete_user( $editor_user );
	}

	public function test_filter_level4_groups_for_limited_users__returns_all_groups_for_admin() {
		$admin_user = $this->create_user_with_role( 'administrator' );
		wp_set_current_user( $admin_user );

		$level4_groups = [
			Menu_Config::TEMPLATES_GROUP_ID => [
				'items' => [
					[ 'slug' => 'saved-templates' ],
					[ 'slug' => 'website-templates' ],
				],
			],
		];

		$result = $this->invoke_private_method( $this->handler, 'filter_level4_groups_for_limited_users', [ $level4_groups ] );

		$this->assertEquals( $level4_groups, $result );

		wp_delete_user( $admin_user );
	}

	public function test_filter_level4_groups_for_limited_users__returns_all_groups_for_user_without_edit_posts() {
		$subscriber_user = $this->create_user_with_role( 'subscriber' );
		wp_set_current_user( $subscriber_user );

		$level4_groups = [
			Menu_Config::TEMPLATES_GROUP_ID => [
				'items' => [
					[ 'slug' => 'saved-templates' ],
				],
			],
		];

		$result = $this->invoke_private_method( $this->handler, 'filter_level4_groups_for_limited_users', [ $level4_groups ] );

		$this->assertEquals( $level4_groups, $result );

		wp_delete_user( $subscriber_user );
	}

	public function test_filter_level4_groups_for_limited_users__filters_templates_group_items_for_editor_user() {
		$editor_user = $this->create_user_with_role( 'editor' );
		wp_set_current_user( $editor_user );

		$accessible_item = $this->create_mock_level4_item( 'saved-templates', Menu_Config::TEMPLATES_GROUP_ID, 'edit_posts' );
		$inaccessible_item = $this->create_mock_level4_item( 'website-templates', Menu_Config::TEMPLATES_GROUP_ID, 'manage_options' );

		$this->menu_data_provider->register_level4_item( $accessible_item );
		$this->menu_data_provider->register_level4_item( $inaccessible_item );

		$level4_groups = [
			Menu_Config::TEMPLATES_GROUP_ID => [
				'items' => [
					[ 'slug' => 'saved-templates' ],
					[ 'slug' => 'website-templates' ],
				],
			],
		];

		$result = $this->invoke_private_method( $this->handler, 'filter_level4_groups_for_limited_users', [ $level4_groups ] );

		$this->assertArrayHasKey( Menu_Config::TEMPLATES_GROUP_ID, $result );
		$this->assertCount( 1, $result[ Menu_Config::TEMPLATES_GROUP_ID ]['items'] );
		$this->assertEquals( 'saved-templates', $result[ Menu_Config::TEMPLATES_GROUP_ID ]['items'][0]['slug'] );

		wp_delete_user( $editor_user );
	}

	public function test_filter_level4_groups_for_limited_users__includes_accessible_items_only() {
		$editor_user = $this->create_user_with_role( 'editor' );
		wp_set_current_user( $editor_user );

		$accessible_item1 = $this->create_mock_level4_item( 'saved-templates', Menu_Config::TEMPLATES_GROUP_ID, 'edit_posts' );
		$accessible_item2 = $this->create_mock_level4_item( 'my-templates', Menu_Config::TEMPLATES_GROUP_ID, 'edit_posts' );
		$inaccessible_item = $this->create_mock_level4_item( 'website-templates', Menu_Config::TEMPLATES_GROUP_ID, 'manage_options' );

		$this->menu_data_provider->register_level4_item( $accessible_item1 );
		$this->menu_data_provider->register_level4_item( $accessible_item2 );
		$this->menu_data_provider->register_level4_item( $inaccessible_item );

		$level4_groups = [
			Menu_Config::TEMPLATES_GROUP_ID => [
				'items' => [
					[ 'slug' => 'saved-templates' ],
					[ 'slug' => 'my-templates' ],
					[ 'slug' => 'website-templates' ],
				],
			],
		];

		$result = $this->invoke_private_method( $this->handler, 'filter_level4_groups_for_limited_users', [ $level4_groups ] );

		$this->assertCount( 2, $result[ Menu_Config::TEMPLATES_GROUP_ID ]['items'] );
		$slugs = array_column( $result[ Menu_Config::TEMPLATES_GROUP_ID ]['items'], 'slug' );
		$this->assertContains( 'saved-templates', $slugs );
		$this->assertContains( 'my-templates', $slugs );
		$this->assertNotContains( 'website-templates', $slugs );

		wp_delete_user( $editor_user );
	}

	public function test_filter_level4_groups_for_limited_users__returns_empty_if_no_accessible_items() {
		$editor_user = $this->create_user_with_role( 'editor' );
		wp_set_current_user( $editor_user );

		$inaccessible_item = $this->create_mock_level4_item( 'website-templates', Menu_Config::TEMPLATES_GROUP_ID, 'manage_options' );

		$this->menu_data_provider->register_level4_item( $inaccessible_item );

		$level4_groups = [
			Menu_Config::TEMPLATES_GROUP_ID => [
				'items' => [
					[ 'slug' => 'website-templates' ],
				],
			],
		];

		$result = $this->invoke_private_method( $this->handler, 'filter_level4_groups_for_limited_users', [ $level4_groups ] );

		$this->assertEmpty( $result );

		wp_delete_user( $editor_user );
	}

	private function create_user_with_role( string $role ): int {
		$user_id = wp_insert_user( [
			'user_login' => 'test_user_' . uniqid(),
			'user_pass' => 'password',
			'user_email' => 'test_' . uniqid() . '@example.com',
			'role' => $role,
		] );

		if ( is_wp_error( $user_id ) ) {
			$this->fail( 'Failed to create test user: ' . $user_id->get_error_message() );
		}

		return $user_id;
	}

	private function create_mock_level3_item( string $slug, string $group_id, string $capability, bool $has_children = false ): Menu_Item_Third_Level_Interface {
		$item = $this->createMock( Menu_Item_Third_Level_Interface::class );
		$item->method( 'get_slug' )->willReturn( $slug );
		$item->method( 'get_group_id' )->willReturn( $group_id );
		$item->method( 'get_capability' )->willReturn( $capability );
		$item->method( 'is_visible' )->willReturn( true );
		$item->method( 'has_children' )->willReturn( $has_children );
		$item->method( 'get_label' )->willReturn( ucfirst( $slug ) );
		$item->method( 'get_position' )->willReturn( 100 );
		$item->method( 'get_icon' )->willReturn( 'folder' );
		$item->method( 'get_parent_slug' )->willReturn( null );

		return $item;
	}

	private function create_mock_level4_item( string $slug, string $group_id, string $capability ): Menu_Item_Interface {
		$item = $this->createMock( Menu_Item_Interface::class );
		$item->method( 'get_slug' )->willReturn( $slug );
		$item->method( 'get_group_id' )->willReturn( $group_id );
		$item->method( 'get_capability' )->willReturn( $capability );
		$item->method( 'is_visible' )->willReturn( true );
		$item->method( 'get_label' )->willReturn( ucfirst( $slug ) );
		$item->method( 'get_position' )->willReturn( 100 );
		$item->method( 'get_parent_slug' )->willReturn( null );

		return $item;
	}

	private function invoke_private_method( $object, string $method_name, array $parameters = [] ) {
		$reflection = new \ReflectionClass( get_class( $object ) );
		$method = $reflection->getMethod( $method_name );
		$method->setAccessible( true );

		return $method->invokeArgs( $object, $parameters );
	}

	private function activate_editor_one_experiment(): void {
		$experiments_manager = Plugin::instance()->experiments;
		$experiments_manager->set_feature_default_state( 'e_editor_one', $experiments_manager::STATE_ACTIVE );
	}

	private function deactivate_editor_one_experiment(): void {
		$experiments_manager = Plugin::instance()->experiments;
		$experiments_manager->set_feature_default_state( 'e_editor_one', $experiments_manager::STATE_INACTIVE );
	}

	private function reset_menu_data_provider(): void {
		$reflection = new \ReflectionClass( Menu_Data_Provider::class );
		$instance_property = $reflection->getProperty( 'instance' );
		$instance_property->setAccessible( true );
		$instance_property->setValue( null, null );
	}
}

