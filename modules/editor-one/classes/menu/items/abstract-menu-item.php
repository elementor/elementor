<?php

namespace Elementor\Modules\EditorOne\Classes\Menu\Items;

use Elementor\Modules\EditorOne\Classes\Menu\Menu_Item_Third_Level_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Abstract_Menu_Item implements Menu_Item_Third_Level_Interface {

	public function get_capability() {
		return 'manage_options';
	}

	public function get_parent_slug() {
		return Menu_Config::ELEMENTOR_MENU_SLUG;
	}

	public function is_visible() {
		return true;
	}

	public function get_group_id() {
		return Menu_Config::EDITOR_GROUP_ID;
	}

	public function has_children(): bool {
		return false;
	}

	abstract public function get_label();

	abstract public function get_position();

	abstract public function get_slug();

	abstract public function get_icon(): string;
}
