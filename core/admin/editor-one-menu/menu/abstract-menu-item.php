<?php

namespace Elementor\Core\Admin\EditorOneMenu\Menu;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Third_Level_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Abstract_Menu_Item implements Menu_Item_Third_Level_Interface {

	public function get_capability(): string {
		return Menu_Config::CAPABILITY_MANAGE_OPTIONS;
	}

	public function get_parent_slug(): string {
		return Menu_Config::ELEMENTOR_MENU_SLUG;
	}

	public function is_visible(): bool {
		return true;
	}

	public function get_group_id(): string {
		return Menu_Config::EDITOR_GROUP_ID;
	}

	public function has_children(): bool {
		return false;
	}

	abstract public function get_label(): string;

	abstract public function get_position(): int;

	abstract public function get_slug(): string;

	abstract public function get_icon(): string;
}
