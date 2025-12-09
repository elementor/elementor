<?php
namespace Elementor\Modules\Promotions\AdminMenuItems;

use Elementor\Core\Admin\Menu\Elementor_One_Menu_Manager;
use Elementor\Core\Admin\Menu\Interfaces\Editor_Elementor_One_Menu_Item;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Custom_Elements_Elementor_One_Menu_Item implements Editor_Elementor_One_Menu_Item {

	public function get_capability() {
		return 'manage_options';
	}

	public function get_label() {
		return esc_html__( 'Custom Elements', 'elementor' );
	}

	public function get_parent_slug() {
		return Elementor_One_Menu_Manager::ROOT_MENU_SLUG;
	}

	public function is_visible() {
		return true;
	}
}

