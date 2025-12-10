<?php

namespace Elementor\Modules\EditorOne\Classes\Menu\Items;

use Elementor\Modules\EditorOne\Classes\Menu\Menu_Item_Third_Level_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Custom_Elements_Menu implements Menu_Item_Third_Level_Interface {

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
		return esc_html__( 'Custom Elements', 'elementor' );
	}

	public function get_position() {
		return 70;
	}

	public function get_slug() {
		return 'elementor-custom-elements';
	}

	public function get_icon(): string {
		return 'adjustments';
	}

	public function get_group_id() {
		return Menu_Config::CUSTOM_ELEMENTS_GROUP_ID;
	}

	public function has_children(): bool {
		return true;
	}
}
