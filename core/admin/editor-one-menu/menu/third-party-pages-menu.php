<?php

namespace Elementor\Core\Admin\EditorOneMenu\Menu;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Third_Level_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Third_Party_Pages_Menu implements Menu_Item_Third_Level_Interface {

	public function get_capability(): string {
		return Menu_Config::CAPABILITY_EDIT_POSTS;
	}

	public function get_parent_slug(): string {
		return Menu_Config::ELEMENTOR_HOME_MENU_SLUG;
	}

	public function is_visible(): bool {
		return true;
	}

	public function get_label(): string {
		return esc_html__( 'Addons', 'elementor' );
	}

	public function get_position(): int {
		return 200;
	}

	public function get_slug(): string {
		return 'elementor-third-party-pages';
	}

	public function get_icon(): string {
		return 'extension';
	}

	public function get_group_id(): string {
		return Menu_Config::THIRD_PARTY_GROUP_ID;
	}

	public function has_children(): bool {
		return true;
	}
}
