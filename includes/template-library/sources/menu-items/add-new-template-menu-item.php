<?php
namespace Elementor\Includes\TemplateLibrary\Sources\MenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item;
use Elementor\Core\Editor\Editor;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Add_New_Template_Menu_Item implements Admin_Menu_Item {

	public function is_visible() {
		return true;
	}

	public function parent_slug() {
		return Source_Local::ADMIN_MENU_SLUG;
	}

	public function label() {
		return esc_html__( 'Add New', 'elementor' );
	}

	public function page_title() {
		return esc_html__( 'Add New', 'elementor' );
	}

	public function position() {
		return null;
	}

	public function capability() {
		return Editor::EDITING_CAPABILITY;
	}
}
