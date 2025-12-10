<?php

namespace Elementor\App\Modules\KitLibrary\AdminMenuItems;

use Elementor\Modules\EditorOne\Classes\Menu\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Website_Templates_Menu implements Menu_Item_Interface {

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
		return esc_html__( 'Website Templates', 'elementor' );
	}

	public function get_position() {
		return 30;
	}

	public function get_slug() {
		$app = Plugin::$instance->app;
		if ( $app ) {
			return $app->get_base_url() . '&source=wp_db_templates_menu#/kit-library';
		}
		return 'elementor-app#/kit-library';
	}

	public function get_group_id() {
		return Menu_Config::TEMPLATES_GROUP_ID;
	}
}
