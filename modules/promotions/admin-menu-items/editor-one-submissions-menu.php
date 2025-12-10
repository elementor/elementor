<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

use Elementor\Modules\EditorOne\Classes\Menu\Menu_Item_Third_Level_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Submissions_Menu extends Form_Submissions_Promotion_Item implements Menu_Item_Third_Level_Interface {

	public function get_position() {
		return 50;
	}

	public function get_slug() {
		return 'e-form-submissions';
	}

	public function get_parent_slug() {
		return Menu_Config::ELEMENTOR_MENU_SLUG;
	}

	public function get_label() {
		return esc_html__( 'Submissions', 'elementor' );
	}

	public function get_group_id() {
		return Menu_Config::EDITOR_GROUP_ID;
	}

	public function get_icon(): string {
		return 'send';
	}

	public function has_children(): bool {
		return false;
	}
}
