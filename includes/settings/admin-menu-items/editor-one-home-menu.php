<?php

namespace Elementor\Includes\Settings\AdminMenuItems;

use Elementor\Modules\EditorOne\Classes\Menu\Menu_Item_Third_Level_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Home_Menu implements Menu_Item_Third_Level_Interface {

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
		return esc_html__( 'Home', 'elementor' );
	}

	public function get_position() {
		return 10;
	}

	public function get_slug() {
		return 'elementor';
	}

	public function get_icon(): string {
		return 'home';
	}

	public function has_children(): bool {
		return false;
	}

	public function get_page_title() {
		return $this->get_label();
	}
}
