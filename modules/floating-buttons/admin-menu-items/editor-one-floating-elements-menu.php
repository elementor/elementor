<?php

namespace Elementor\Modules\FloatingButtons\AdminMenuItems;

use Elementor\Modules\EditorOne\Classes\Menu\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\FloatingButtons\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Floating_Elements_Menu implements Menu_Item_Interface {

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
		return esc_html__( 'Floating Elements', 'elementor' );
	}

	public function get_position() {
		return 40;
	}

	public function get_slug() {
		return Module::ADMIN_PAGE_SLUG_CONTACT;
	}

	public function get_group_id() {
		return Menu_Config::TEMPLATES_GROUP_ID;
	}
}
