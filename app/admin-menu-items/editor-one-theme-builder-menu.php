<?php

namespace Elementor\App\AdminMenuItems;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;
use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_With_Custom_Url_Interface;
use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\App\App;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Theme_Builder_Menu implements Menu_Item_Interface, Admin_Menu_Item_With_Page, Menu_Item_With_Custom_Url_Interface {

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
		return esc_html__( 'Theme Builder', 'elementor' );
	}

	public function get_position(): int {
		return 15;
	}

	public function get_slug(): string {
		return App::PAGE_ID;
	}

	public function get_menu_url(): string {
		return Menu_Data_Provider::instance()->get_theme_builder_url();
	}

	public function get_group_id(): string {
		return Menu_Config::TEMPLATES_GROUP_ID;
	}

	public function get_page_title(): string {
		return esc_html__( 'Theme Builder', 'elementor' );
	}

	public function render(): void {
	}
}
