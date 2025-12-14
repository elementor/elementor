<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

use Elementor\Modules\EditorOne\Classes\Menu\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Custom_Code_Menu extends Custom_Code_Promotion_Item implements Menu_Item_Interface {
	public function get_position() {
		return 40;
	}

	public function get_slug() {
		return 'elementor_custom_code';
	}

	public function get_parent_slug() {
		return 'elementor_custom_code';
	}

	public function get_label() {
		return esc_html__( 'Code', 'elementor' );
	}
	public function get_group_id() {
		return Menu_Config::CUSTOM_ELEMENTS_GROUP_ID;
	}
}
