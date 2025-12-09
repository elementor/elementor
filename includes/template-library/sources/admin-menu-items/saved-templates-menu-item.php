<?php
namespace Elementor\Includes\TemplateLibrary\Sources\AdminMenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item;
use Elementor\Core\Editor\Editor;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_Has_Position;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Saved_Templates_Menu_Item implements Admin_Menu_Item, Admin_Menu_Item_Has_Position {

	public function is_visible() {
		return true;
	}

	public function get_parent_slug() {
		return Source_Local::ADMIN_MENU_SLUG;
	}

	public function get_label() {
		return esc_html__( 'Saved Templates', 'elementor' );
	}

	public function get_capability() {
		return Editor::EDITING_CAPABILITY;
	}

	public function get_position() {
		return 10;
	}
}
