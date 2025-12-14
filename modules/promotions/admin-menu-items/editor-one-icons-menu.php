<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

use Elementor\Modules\EditorOne\Classes\Menu\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Icons_Menu extends Custom_Icons_Promotion_Item implements Menu_Item_Interface {

	public function get_position() {
		return 20;
	}

	public function get_slug() {
		return 'elementor_custom_icons';
	}

	public function get_parent_slug() {
		return Menu_Config::ELEMENTOR_MENU_SLUG;
	}

	public function get_label() {
		return esc_html__( 'Icons', 'elementor' );
	}

	public function get_group_id() {
		return Menu_Config::CUSTOM_ELEMENTS_GROUP_ID;
	}
}
