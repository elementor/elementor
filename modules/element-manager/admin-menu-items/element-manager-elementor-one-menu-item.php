<?php
namespace Elementor\Modules\ElementManager\AdminMenuItems;

use Elementor\Core\Admin\Menu\Elementor_One_Menu_Manager;
use Elementor\Core\Admin\Menu\Interfaces\Editor_Elementor_One_Menu_Item;
use Elementor\Core\Admin\Menu\Interfaces\Elementor_One_Menu_Item_With_Page;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Element_Manager_Elementor_One_Menu_Item implements Editor_Elementor_One_Menu_Item, Elementor_One_Menu_Item_With_Page {

	public function get_capability() {
		return 'manage_options';
	}

	public function get_label() {
		return esc_html__( 'Element Manager', 'elementor' );
	}

	public function get_parent_slug() {
		return Elementor_One_Menu_Manager::ROOT_MENU_SLUG;
	}

	public function is_visible() {
		return true;
	}

	public function get_page_title() {
		return esc_html__( 'Element Manager', 'elementor' );
	}

	public function render() {
		echo '<div id="elementor-element-manager-app"></div>';
	}
}

