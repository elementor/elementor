<?php

namespace Elementor\Core\RoleManager;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Third_Level_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Role_Manager_Menu implements Menu_Item_Third_Level_Interface, Admin_Menu_Item_With_Page {

	public function get_capability(): string {
		return 'manage_options';
	}

	public function get_parent_slug(): string {
		return Menu_Config::ELEMENTOR_MENU_SLUG;
	}

	public function is_visible(): bool {
		return true;
	}

	public function get_group_id(): string {
		return Menu_Config::EDITOR_GROUP_ID;
	}

	public function get_label(): string {
		return esc_html__( 'Role Manager', 'elementor' );
	}

	public function get_position(): int {
		return 40;
	}

	public function get_slug(): string {
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
