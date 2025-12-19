<?php

namespace Elementor\Modules\EditorOne\Classes\Menu\Items;

use Elementor\Modules\EditorOne\Classes\Menu\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Abstract_Level4_Menu_Item implements Menu_Item_Interface {

	public function get_capability() {
<<<<<<< HEAD
		return 'manage_options';
=======
		return Menu_Config::CAPABILITY_MANAGE_OPTIONS;
>>>>>>> origin/internal/ED-21915-handle-user-permissions
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
