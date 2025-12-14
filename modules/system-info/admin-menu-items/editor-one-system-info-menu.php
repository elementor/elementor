<?php

namespace Elementor\Modules\System_Info\AdminMenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Modules\EditorOne\Classes\Menu\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_System_Info_Menu implements Menu_Item_Interface, Admin_Menu_Item_With_Page {

	public function get_capability() {
		return 'manage_options';
	}

	public function get_parent_slug() {
		return Menu_Config::ELEMENTOR_MENU_SLUG;
	}

	public function is_visible() {
		return true;
	}

	public function get_label() {
		return esc_html__( 'System Info', 'elementor' );
	}

	public function get_position() {
		return 10;
	}

	public function get_slug() {
		return 'elementor-system-info';
	}

	public function get_group_id() {
		return Menu_Config::SYSTEM_GROUP_ID;
	}

	public function get_page_title() {
		return $this->get_label();
	}

	public function render() {
		Plugin::$instance->system_info->display_page();
	}
}
