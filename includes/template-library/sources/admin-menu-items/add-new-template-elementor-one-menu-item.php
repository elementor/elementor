<?php
namespace Elementor\Includes\TemplateLibrary\Sources\AdminMenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Flyout_Editor_Elementor_One_Menu_Item;
use Elementor\Core\Editor\Editor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Add_New_Template_Elementor_One_Menu_Item implements Flyout_Editor_Elementor_One_Menu_Item {

	public function get_capability() {
		return Editor::EDITING_CAPABILITY;
	}

	public function get_label() {
		return esc_html__( 'Add New', 'elementor' );
	}

	public function get_parent_slug() {
		return 'elementor-templates';
	}

	public function is_visible() {
		return true;
	}
}

