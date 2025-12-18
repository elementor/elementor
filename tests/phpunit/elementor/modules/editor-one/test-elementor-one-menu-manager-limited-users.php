<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Modules\EditorOne\Components\Elementor_One_Menu_Manager;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Elementor_One_Menu_Manager_Limited_Users extends Elementor_Test_Base {

	private Elementor_One_Menu_Manager $menu_manager;
	private array $original_menu;
	private array $original_submenu;

	public function setUp(): void {
		parent::setUp();

		$this->activate_editor_one_experiment();

		global $menu, $submenu;
		$this->original_menu = $menu ?? [];
		$this->original_submenu = $submenu ?? [];

		$menu = [];
		$submenu = [];

		$this->menu_manager = new Elementor_One_Menu_Manager();
	}

	public function tearDown(): void {
		parent::tearDown();

		global $menu, $submenu, $current_user;
		$menu = $this->original_menu;
		$submenu = $this->original_submenu;
		$current_user = null;

		remove_filter( 'user_has_cap', [ $this->menu_manager, 'grant_elementor_menu_capability' ], 10 );
		remove_filter( 'user_has_cap', [ $this->menu_manager, 'grant_pro_menu_items_capability' ], 10 );

		$this->deactivate_editor_one_experiment();
	}

	public function test_adjust_elementor_menu_capability_before_filter__changes_to_edit_posts_for_editor_user() {
		global $menu;

		$editor_user = $this->create_user_with_role( 'editor' );
		wp_set_current_user( $editor_user );

		$menu = [
			10 => [ 'Elementor', 'manage_options', Menu_Config::ELEMENTOR_MENU_SLUG, 'Elementor' ],
			20 => [ 'Other Menu', 'manage_options', 'other-menu', 'Other Menu' ],
		];

		$this->menu_manager->adjust_elementor_menu_capability_before_filter();

		$this->assertEquals( 'edit_posts', $menu[10][1] );
		$this->assertEquals( 'manage_options', $menu[20][1] );

		wp_delete_user( $editor_user );
	}

	public function test_adjust_elementor_menu_capability_before_filter__does_not_change_for_admin() {
		global $menu;

		$admin_user = $this->create_user_with_role( 'administrator' );
		wp_set_current_user( $admin_user );

		$menu = [
			10 => [ 'Elementor', 'manage_options', Menu_Config::ELEMENTOR_MENU_SLUG, 'Elementor' ],
		];

		$this->menu_manager->adjust_elementor_menu_capability_before_filter();

		$this->assertEquals( 'manage_options', $menu[10][1] );

		wp_delete_user( $admin_user );
	}

	public function test_adjust_elementor_menu_capability_before_filter__does_not_change_if_experiment_off() {
		global $menu;

		$this->deactivate_editor_one_experiment();

		$editor_user = $this->create_user_with_role( 'editor' );
		wp_set_current_user( $editor_user );

		$menu = [
			10 => [ 'Elementor', 'manage_options', Menu_Config::ELEMENTOR_MENU_SLUG, 'Elementor' ],
		];

		$this->menu_manager->adjust_elementor_menu_capability_before_filter();

		$this->assertEquals( 'manage_options', $menu[10][1] );

		$this->activate_editor_one_experiment();
		wp_delete_user( $editor_user );
	}

	public function test_adjust_elementor_menu_capability_before_filter__does_not_change_if_user_has_manage_options() {
		global $menu;

		$admin_user = $this->create_user_with_role( 'administrator' );
		wp_set_current_user( $admin_user );

		$menu = [
			10 => [ 'Elementor', 'manage_options', Menu_Config::ELEMENTOR_MENU_SLUG, 'Elementor' ],
		];

		$this->menu_manager->adjust_elementor_menu_capability_before_filter();

		$this->assertEquals( 'manage_options', $menu[10][1] );

		wp_delete_user( $admin_user );
	}

	public function test_adjust_elementor_menu_capability_before_filter__does_not_change_if_user_lacks_edit_posts() {
		global $menu;

		$subscriber_user = $this->create_user_with_role( 'subscriber' );
		wp_set_current_user( $subscriber_user );

		$menu = [
			10 => [ 'Elementor', 'manage_options', Menu_Config::ELEMENTOR_MENU_SLUG, 'Elementor' ],
		];

		$this->menu_manager->adjust_elementor_menu_capability_before_filter();

		$this->assertEquals( 'manage_options', $menu[10][1] );

		wp_delete_user( $subscriber_user );
	}

	public function test_adjust_elementor_menu_capability_before_filter__handles_empty_menu() {
		global $menu;

		$editor_user = $this->create_user_with_role( 'editor' );
		wp_set_current_user( $editor_user );

		$menu = [];

		$this->menu_manager->adjust_elementor_menu_capability_before_filter();

		$this->assertEmpty( $menu );

		wp_delete_user( $editor_user );
	}

	public function test_adjust_elementor_menu_capability_before_filter__handles_menu_not_found() {
		global $menu;

		$editor_user = $this->create_user_with_role( 'editor' );
		wp_set_current_user( $editor_user );

		$menu = [
			20 => [ 'Other Menu', 'manage_options', 'other-menu', 'Other Menu' ],
		];

		$this->menu_manager->adjust_elementor_menu_capability_before_filter();

		$this->assertEquals( 'manage_options', $menu[20][1] );

		wp_delete_user( $editor_user );
	}

	public function test_remove_all_submenus_for_limited_users__removes_all_submenus_for_editor_user() {
		global $submenu;

		$editor_user = $this->create_user_with_role( 'editor' );
		wp_set_current_user( $editor_user );

		$submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] = [
			0 => [ 'Editor', 'edit_posts', Menu_Config::EDITOR_MENU_SLUG ],
			1 => [ 'Templates', 'edit_posts', 'elementor-templates' ],
			2 => [ 'Settings', 'manage_options', 'elementor-settings' ],
			3 => [ 'Tools', 'manage_options', 'elementor-tools' ],
		];

		$this->menu_manager->remove_all_submenus_for_edit_posts_users();

		$this->assertCount( 1, $submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] );
		$this->assertEquals( Menu_Config::EDITOR_MENU_SLUG, $submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ][0][2] );

		wp_delete_user( $editor_user );
	}

	public function test_remove_all_submenus_for_limited_users__keeps_first_submenu_item() {
		global $submenu;

		$editor_user = $this->create_user_with_role( 'editor' );
		wp_set_current_user( $editor_user );

		$submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] = [
			0 => [ 'Editor', 'edit_posts', Menu_Config::EDITOR_MENU_SLUG ],
			1 => [ 'Templates', 'edit_posts', 'elementor-templates' ],
			2 => [ 'Settings', 'manage_options', 'elementor-settings' ],
		];

		$this->menu_manager->remove_all_submenus_for_edit_posts_users();

		$this->assertCount( 1, $submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] );
		$this->assertEquals( 'Editor', $submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ][0][0] );
		$this->assertEquals( Menu_Config::EDITOR_MENU_SLUG, $submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ][0][2] );

		wp_delete_user( $editor_user );
	}

	public function test_remove_all_submenus_for_limited_users__does_not_remove_for_admin() {
		global $submenu;

		$admin_user = $this->create_user_with_role( 'administrator' );
		wp_set_current_user( $admin_user );

		$submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] = [
			0 => [ 'Editor', 'edit_posts', Menu_Config::EDITOR_MENU_SLUG ],
			1 => [ 'Templates', 'edit_posts', 'elementor-templates' ],
			2 => [ 'Settings', 'manage_options', 'elementor-settings' ],
		];

		$this->menu_manager->remove_all_submenus_for_edit_posts_users();

		$this->assertCount( 3, $submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] );

		wp_delete_user( $admin_user );
	}

	public function test_remove_all_submenus_for_limited_users__does_not_remove_if_user_lacks_edit_posts() {
		global $submenu;

		$subscriber_user = $this->create_user_with_role( 'subscriber' );
		wp_set_current_user( $subscriber_user );

		$submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] = [
			0 => [ 'Editor', 'edit_posts', Menu_Config::EDITOR_MENU_SLUG ],
			1 => [ 'Templates', 'edit_posts', 'elementor-templates' ],
		];

		$this->menu_manager->remove_all_submenus_for_edit_posts_users();

		$this->assertCount( 2, $submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] );

		wp_delete_user( $subscriber_user );
	}

	public function test_remove_all_submenus_for_limited_users__handles_empty_submenu() {
		global $submenu;

		$editor_user = $this->create_user_with_role( 'editor' );
		wp_set_current_user( $editor_user );

		$submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] = [];

		$this->menu_manager->remove_all_submenus_for_edit_posts_users();

		$this->assertEmpty( $submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] );

		wp_delete_user( $editor_user );
	}

	public function test_remove_all_submenus_for_limited_users__handles_missing_submenu() {
		global $submenu;

		$editor_user = $this->create_user_with_role( 'editor' );
		wp_set_current_user( $editor_user );

		$submenu = [];

		$this->menu_manager->remove_all_submenus_for_edit_posts_users();

		$this->assertArrayNotHasKey( Menu_Config::ELEMENTOR_MENU_SLUG, $submenu );

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

	private function activate_editor_one_experiment(): void {
		$experiments_manager = Plugin::instance()->experiments;
		$experiments_manager->set_feature_default_state( 'e_editor_one', $experiments_manager::STATE_ACTIVE );
	}

	private function deactivate_editor_one_experiment(): void {
		$experiments_manager = Plugin::instance()->experiments;
		$experiments_manager->set_feature_default_state( 'e_editor_one', $experiments_manager::STATE_INACTIVE );
	}
}

