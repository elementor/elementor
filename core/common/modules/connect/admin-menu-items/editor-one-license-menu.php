<?php

namespace Elementor\Core\Common\Modules\Connect\AdminMenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Modules\EditorOne\Classes\Menu\Interface\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Core\Common\Modules\Connect\Admin;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_License_Menu implements Menu_Item_Interface, Admin_Menu_Item_With_Page {

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
		return esc_html__( 'License', 'elementor' );
	}

	public function get_position() {
		return 30;
	}

	public function get_slug() {
		return Admin::PAGE_ID;
	}

	public function get_group_id() {
		return Menu_Config::SYSTEM_GROUP_ID;
	}

	public function get_page_title() {
		return $this->get_label();
	}

	public function render() {
		$connect_module = Plugin::$instance->common->get_component( 'connect' );
		if ( $connect_module && method_exists( $connect_module, 'render_admin_widget_content' ) ) {
			$connect_module->render_admin_widget_content();
		}
	}
}

