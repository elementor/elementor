<?php

namespace Elementor\Modules\EditorOne\Classes\Menu\Items;

use Elementor\Modules\EditorOne\Classes\Menu\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Abstract_Level4_Menu_Item implements Menu_Item_Interface {

	public function get_capability() {
		return 'manage_options';
	}

	public function get_parent_slug() {
		return Menu_Config::ELEMENTOR_MENU_SLUG;
	}

	public function is_visible() {
		return true;
	}

	abstract public function get_label();

	abstract public function get_position();

	abstract public function get_slug();

	abstract public function get_group_id();
}
