<?php
namespace Elementor\Modules\Promotions\AdminMenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Flyout_Editor_Elementor_One_Menu_Item;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Custom_Fonts_Elementor_One_Menu_Item implements Flyout_Editor_Elementor_One_Menu_Item {

	public function get_capability() {
		return 'manage_options';
	}

	public function get_label() {
		return esc_html__( 'Custom Fonts', 'elementor' );
	}

	public function get_parent_slug() {
		return 'elementor-custom-elements';
	}

	public function is_visible() {
		return true;
	}
}

