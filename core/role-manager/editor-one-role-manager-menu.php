<?php

namespace Elementor\Core\RoleManager;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Modules\EditorOne\Classes\Menu\Menu_Item_Third_Level_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Role_Manager_Menu implements Menu_Item_Third_Level_Interface, Admin_Menu_Item_With_Page {

	public function get_capability() {
		return 'manage_options';
	}

	public function get_parent_slug() {
		return Menu_Config::ELEMENTOR_MENU_SLUG;
	}

	public function is_visible() {
		return true;
	}

	public function get_group_id() {
		return Menu_Config::EDITOR_GROUP_ID;
	}

	public function get_label() {
		return esc_html__( 'Role Manager', 'elementor' );
	}

	public function get_position() {
		return 40;
	}

	public function get_slug() {
		return Role_Manager::PAGE_ID;
	}

	public function get_icon(): string {
		return 'users';
	}

	public function has_children(): bool {
		return false;
	}

	public function get_page_title() {
		return $this->get_label();
	}

	public function render() {
		$role_manager = Plugin::$instance->role_manager;
		if ( $role_manager ) {
			$role_manager->display_settings_page();
		}
	}
}
