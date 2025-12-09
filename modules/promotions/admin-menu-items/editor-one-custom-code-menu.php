<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

use Elementor\Modules\EditorOne\Classes\Elementor_One_Menu_Item_Fourth_Level;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Custom_Code_Menu extends Custom_Code_Promotion_Item implements Elementor_One_Menu_Item_Fourth_Level {
	public function get_position() {
		return 40;
	}

	public function get_parent_slug() {
		return 'elementor_custom_code';
	}

	public function get_label() {
		return esc_html__( 'Code', 'elementor' );
	}
}