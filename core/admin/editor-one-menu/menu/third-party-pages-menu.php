<?php

namespace Elementor\Core\Admin\EditorOneMenu\Menu;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Third_Level_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Third_Party_Pages_Menu implements Menu_Item_Third_Level_Interface {

	public function get_capability() {
		return Menu_Config::CAPABILITY_EDIT_POSTS;
	}

	public function get_parent_slug() {
		return Menu_Config::ELEMENTOR_HOME_MENU_SLUG;
	}

	public function is_visible() {
		return true;
	}

<<<<<<< HEAD
	public function get_label() {
		return esc_html__( 'Third Party Pages', 'elementor' );
=======
	public function get_label(): string {
		return esc_html__( 'Addons', 'elementor' );
>>>>>>> 40cd34dd81 (Internal: VQA fixes [ED-22181] (#34069))
	}

	public function get_position() {
		return 200;
	}

	public function get_slug() {
		return 'elementor-third-party-pages';
	}

	public function get_icon(): string {
		return 'extension';
	}

	public function get_group_id() {
		return Menu_Config::THIRD_PARTY_GROUP_ID;
	}

	public function has_children(): bool {
		return true;
	}
}
