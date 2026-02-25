<?php

namespace Elementor\Includes\Settings\AdminMenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Third_Level_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Settings_Menu implements Menu_Item_Third_Level_Interface, Admin_Menu_Item_With_Page {

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
		return esc_html__( 'Settings', 'elementor' );
	}

	public function get_position(): int {
		return 20;
	}

	public function get_slug(): string {
		return 'elementor-settings';
	}

	public function get_icon(): string {
		return 'settings';
	}

	public function has_children(): bool {
		return false;
	}

	public function get_page_title() {
		return $this->get_label();
	}

	public function render() {
		Plugin::$instance->settings->display_settings_page();
	}
}
