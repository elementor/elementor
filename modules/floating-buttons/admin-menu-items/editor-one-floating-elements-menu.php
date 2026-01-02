<?php

namespace Elementor\Modules\FloatingButtons\AdminMenuItems;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\FloatingButtons\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Floating_Elements_Menu implements Menu_Item_Interface {

	public function get_capability(): string {
		return 'manage_options';
	}

	public function get_parent_slug(): string {
		return Menu_Config::ELEMENTOR_MENU_SLUG;
	}

	public function is_visible(): bool {
		return true;
	}

	public function get_label(): string {
		return esc_html__( 'Floating Elements', 'elementor' );
	}

	public function get_position(): int {
		return 40;
	}

	public function get_slug(): string {
		return Module::ADMIN_PAGE_SLUG_CONTACT;
	}

	public function get_group_id(): string {
		return Menu_Config::TEMPLATES_GROUP_ID;
	}
}
