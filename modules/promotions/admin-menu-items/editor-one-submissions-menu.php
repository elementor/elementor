<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Third_Level_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Submissions_Menu extends Form_Submissions_Promotion_Item implements Menu_Item_Third_Level_Interface {

	public function get_position(): int {
		return 50;
	}

	public function get_slug(): string {
		return 'e-form-submissions';
	}

	public function get_parent_slug(): string {
		return Menu_Config::ELEMENTOR_MENU_SLUG;
	}

	public function get_label(): string {
		return esc_html__( 'Submissions', 'elementor' );
	}

	public function get_group_id(): string {
		return Menu_Config::EDITOR_GROUP_ID;
	}

	public function get_icon(): string {
		return 'send';
	}

	public function has_children(): bool {
		return false;
	}
}
