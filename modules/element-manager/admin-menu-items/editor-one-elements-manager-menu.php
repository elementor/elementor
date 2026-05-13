<?php

namespace Elementor\Modules\ElementManager\AdminMenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\ElementManager\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Elements_Manager_Menu implements Menu_Item_Interface, Admin_Menu_Item_With_Page {

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
		return esc_html__( 'Element Manager', 'elementor' );
	}

	public function get_position(): int {
		return 20;
	}

	public function get_slug(): string {
		return Module::PAGE_ID;
	}

	public function get_group_id(): string {
		return Menu_Config::SYSTEM_GROUP_ID;
	}

	public function get_page_title() {
		return $this->get_label();
	}

	public function render() {
		echo '<div class="wrap">';
		echo '<h1 class="wp-heading-inline">' . esc_html__( 'Element Manager', 'elementor' ) . '</h1>';
		echo '<div id="elementor-element-manager-wrap"></div>';
		echo '</div>';
	}
}
