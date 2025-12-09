<?php
namespace Elementor\Includes\TemplateLibrary\Sources\AdminMenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Flyout_Editor_Elementor_One_Menu_Item;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Templates_Categories_Elementor_One_Menu_Item implements Flyout_Editor_Elementor_One_Menu_Item {

	public function get_capability() {
		return 'manage_categories';
	}

	public function get_label() {
		return esc_html__( 'Categories', 'elementor' );
	}

	public function get_parent_slug() {
		return 'elementor-templates';
	}

	public function is_visible() {
		return true;
	}
}

