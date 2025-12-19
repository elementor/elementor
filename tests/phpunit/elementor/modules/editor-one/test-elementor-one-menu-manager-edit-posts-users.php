<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\EditorOne\Components\Elementor_One_Menu_Manager;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\EditorOne\Module as EditorOneModule;
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

	public function test_reregister_elementor_menu_for_edit_posts_users__captures_and_restores_submenu_items() {
		global $submenu;

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

		add_submenu_page(
			Menu_Config::ELEMENTOR_MENU_SLUG,
			'Templates',
			'Templates',
			'edit_posts',
			'elementor-templates',
			''
		);

		add_submenu_page(
			Menu_Config::ELEMENTOR_MENU_SLUG,
			'Help',
			'Help',
			'edit_posts',
			'go_knowledge_base_site',
			''
		);

		$submenu_slugs_before = [];
		if ( ! empty( $submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] ) ) {
			foreach ( $submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] as $submenu_item ) {
				if ( isset( $submenu_item[2] ) && Menu_Config::ELEMENTOR_MENU_SLUG !== $submenu_item[2] ) {
					$submenu_slugs_before[] = $submenu_item[2];
				}
			}
		}

		$this->menu_manager->reregister_elementor_menu_for_edit_posts_users();

		$this->assertArrayHasKey( Menu_Config::ELEMENTOR_MENU_SLUG, $submenu );

		$submenu_slugs_after = [];
		foreach ( $submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] as $submenu_item ) {
			if ( isset( $submenu_item[2] ) && Menu_Config::ELEMENTOR_MENU_SLUG !== $submenu_item[2] ) {
				$submenu_slugs_after[] = $submenu_item[2];
			}
		}

		foreach ( $submenu_slugs_before as $slug ) {
			$this->assertContains( $slug, $submenu_slugs_after, "Submenu item '{$slug}' should be restored after menu re-registration" );
		}

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

	public function test_remove_all_submenus_for_edit_posts_users__does_not_remove_for_admin() {
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

	private function create_user_with_role( string $role ): int {
		$user_id = wp_insert_user( [
			'user_login' => 'test_user_' . uniqid(),
			'user_pass' => 'password',
			'user_email' => 'test_' . uniqid() . '@example.com',
			'role' => $role,
		] );

		return $user_id;
	}

	private function activate_editor_one_experiment(): void {
		$experiments = Plugin::instance()->experiments;
		$experiments->set_feature_default_state(
			EditorOneModule::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);
	}

	private function deactivate_editor_one_experiment(): void {
		$experiments = Plugin::instance()->experiments;
		$experiments->set_feature_default_state(
			EditorOneModule::EXPERIMENT_NAME,
			Experiments_Manager::STATE_INACTIVE
		);
	}
}

