<?php

namespace Elementor\App\AdminMenuItems;

use Elementor\Modules\EditorOne\Classes\Menu\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\App\App;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Theme_Builder_Menu implements Menu_Item_Interface {

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
		return esc_html__( 'Theme builder', 'elementor' );
	}

	public function get_position() {
		return 20;
	}

	public function get_slug() {
		return App::PAGE_ID;
	}

	public function get_group_id() {
		return Menu_Config::TEMPLATES_GROUP_ID;
	}
}
