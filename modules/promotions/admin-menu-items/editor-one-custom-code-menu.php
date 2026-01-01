<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Custom_Code_Menu extends Custom_Code_Promotion_Item implements Menu_Item_Interface {
	public function get_position(): int {
		return 40;
	}

	public function get_slug(): string {
		return 'elementor_custom_code';
	}

	public function get_parent_slug(): string {
		return 'elementor_custom_code';
	}

	public function get_label(): string {
		return esc_html__( 'Code', 'elementor' );
	}
	public function get_group_id(): string {
		return Menu_Config::CUSTOM_ELEMENTS_GROUP_ID;
	}
}
