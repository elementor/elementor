<?php
namespace Elementor\App\Modules\KitLibrary\AdminMenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Flyout_Editor_Elementor_One_Menu_Item;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Kit_Library_Elementor_One_Menu_Item implements Flyout_Editor_Elementor_One_Menu_Item {

	public function get_capability() {
		return 'manage_options';
	}

	public function get_label() {
		return esc_html__( 'Website Templates', 'elementor' );
	}

	public function get_parent_slug() {
		return 'elementor-templates';
	}

	public function is_visible() {
		return true;
	}
}

