<?php

namespace Elementor\Includes\TemplateLibrary\Sources\AdminMenuItems;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;
use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_With_Custom_Url_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Saved_Templates_Menu implements Menu_Item_Interface, Menu_Item_With_Custom_Url_Interface {

	public function get_capability(): string {
		return 'edit_posts';
	}

	public function get_parent_slug(): string {
		return Menu_Config::ELEMENTOR_MENU_SLUG;
	}

	public function is_visible(): bool {
		return true;
	}

	public function get_label(): string {
		return esc_html__( 'Saved Templates', 'elementor' );
	}

	public function get_position(): int {
		return 10;
	}

	public function get_slug(): string {
		return Source_Local::ADMIN_MENU_SLUG;
	}

	public function get_menu_url(): string {
		return Source_Local::get_admin_url();
	}

	public function get_group_id(): string {
		return Menu_Config::TEMPLATES_GROUP_ID;
	}
}
