<?php

namespace Elementor\Core\Admin\Menu\Items;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Children;
use Elementor\Core\Admin\Menu\Unified_Menu_Manager;
use Elementor\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Settings_Group_Menu_Item implements Admin_Menu_Item_With_Children {

	const PAGE_ID = 'elementor-settings';

	public function is_visible() {
		return true;
	}

	public function get_parent_slug() {
		return Unified_Menu_Manager::ELEMENTOR_MENU_SLUG;
	}

	public function get_label() {
		return esc_html__( 'Settings', 'elementor' );
	}

	public function get_capability() {
		return 'manage_options';
	}

	public function get_children_group_id() {
		return Unified_Menu_Manager::SETTINGS_GROUP_ID;
	}
}

