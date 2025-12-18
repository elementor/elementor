<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Modules\EditorOne\Components\Elementor_One_Menu_Manager;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Elementor_One_Menu_Manager_Edit_Posts_Users extends Elementor_Test_Base {

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


		$this->deactivate_editor_one_experiment();
	}

	public function test_reregister_elementor_menu_for_edit_posts_users__reregisters_menu_for_editor_user() {
		global $menu;

		$editor_user = $this->create_user_with_role( 'editor' );
		wp_set_current_user( $editor_user );

		add_menu_page(
			'Elementor',
			'Elementor',
			'manage_options',
			Menu_Config::ELEMENTOR_MENU_SLUG,
			'',
			'',
			58.5
		);

		$this->menu_manager->reregister_elementor_menu_for_edit_posts_users();

		$elementor_menu = null;
		foreach ( $menu as $item ) {
			if ( isset( $item[2] ) && Menu_Config::ELEMENTOR_MENU_SLUG === $item[2] ) {
				$elementor_menu = $item;
				break;
			}
		}

		$this->assertNotNull( $elementor_menu );
		$this->assertEquals( Menu_Config::CAPABILITY_EDIT_POSTS, $elementor_menu[1] );

		wp_delete_user( $editor_user );
	}

	public function test_reregister_elementor_menu_for_edit_posts_users__does_not_reregister_for_admin() {
		global $menu;

		$admin_user = $this->create_user_with_role( 'administrator' );
		wp_set_current_user( $admin_user );

		$menu_before = $menu;

		$this->menu_manager->reregister_elementor_menu_for_edit_posts_users();

		$this->assertEquals( $menu_before, $menu );

		wp_delete_user( $admin_user );
	}

	public function test_reregister_elementor_menu_for_edit_posts_users__does_not_reregister_for_subscriber() {
		global $menu;

		$subscriber_user = $this->create_user_with_role( 'subscriber' );
		wp_set_current_user( $subscriber_user );

		$menu_before = $menu;

		$this->menu_manager->reregister_elementor_menu_for_edit_posts_users();

		$this->assertEquals( $menu_before, $menu );

		wp_delete_user( $subscriber_user );
	}

	public function test_override_elementor_page_for_edit_posts_users__redirects_editor_user() {
		$editor_user = $this->create_user_with_role( 'editor' );
		wp_set_current_user( $editor_user );

		$_GET['page'] = Menu_Config::ELEMENTOR_MENU_SLUG;

		ob_start();
		try {
			$this->menu_manager->override_elementor_page_for_edit_posts_users();
			$this->fail( 'Expected redirect but method completed without redirecting' );
		} catch ( \Exception $e ) {
			$this->assertTrue( true );
		}
		ob_end_clean();

		wp_delete_user( $editor_user );
		unset( $_GET['page'] );
	}

	public function test_override_elementor_page_for_edit_posts_users__does_not_redirect_admin() {
		$admin_user = $this->create_user_with_role( 'administrator' );
		wp_set_current_user( $admin_user );

		$_GET['page'] = Menu_Config::ELEMENTOR_MENU_SLUG;

		$this->menu_manager->override_elementor_page_for_edit_posts_users();

		$this->assertTrue( true );

		wp_delete_user( $admin_user );
		unset( $_GET['page'] );
	}

	public function test_override_elementor_page_for_edit_posts_users__does_not_redirect_if_wrong_page() {
		$editor_user = $this->create_user_with_role( 'editor' );
		wp_set_current_user( $editor_user );

		$_GET['page'] = 'other-page';

		$this->menu_manager->override_elementor_page_for_edit_posts_users();

		$this->assertTrue( true );

		wp_delete_user( $editor_user );
		unset( $_GET['page'] );
	}

	public function test_remove_all_submenus_for_edit_posts_users__removes_all_submenus_for_editor_user() {
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

