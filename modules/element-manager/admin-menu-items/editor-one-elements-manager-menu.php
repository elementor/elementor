<?php

namespace Elementor\Modules\ElementManager\AdminMenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Modules\EditorOne\Classes\Menu\Interface\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\ElementManager\Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Elements_Manager_Menu implements Menu_Item_Interface, Admin_Menu_Item_With_Page {

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
		return esc_html__( 'Elements Manager', 'elementor' );
	}

	public function get_position() {
		return 20;
	}

	public function get_slug() {
		return Module::PAGE_ID;
	}

	public function get_group_id() {
		return Menu_Config::SYSTEM_GROUP_ID;
	}

	public function get_page_title() {
		return $this->get_label();
	}

	public function render() {
		$element_manager = Plugin::$instance->modules_manager->get_modules( 'element-manager' );
		if ( $element_manager && method_exists( $element_manager, 'render_app' ) ) {
			$element_manager->render_app();
		}
	}
}

