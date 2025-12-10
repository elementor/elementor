<?php

namespace Elementor\Modules\System_Info\AdminMenuItems;

use Elementor\Modules\EditorOne\Classes\Menu\Menu_Item_Third_Level_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_System_Menu implements Menu_Item_Third_Level_Interface {

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
		return esc_html__( 'System', 'elementor' );
	}

	public function get_position() {
		return 80;
	}

	public function get_slug() {
		return 'elementor-system';
	}

	public function get_icon(): string {
		return 'info-circle';
	}

	public function get_group_id() {
		return Menu_Config::SYSTEM_GROUP_ID;
	}

	public function has_children(): bool {
		return true;
	}
}
