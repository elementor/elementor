<?php
namespace Elementor\Includes\Settings\AdminMenuItems;

use Elementor\Core\Admin\Menu\Elementor_One_Menu_Manager;
use Elementor\Core\Admin\Menu\Interfaces\Editor_Elementor_One_Menu_Item;
use Elementor\Core\Admin\Menu\Interfaces\Elementor_One_Menu_Item_With_Page;
use Elementor\Tools;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Tools_Elementor_One_Menu_Item implements Editor_Elementor_One_Menu_Item, Elementor_One_Menu_Item_With_Page {

	private $tools_page;

	public function __construct( Tools $tools_page ) {
		$this->tools_page = $tools_page;
	}

	public function get_capability() {
		return Tools::CAPABILITY;
	}

	public function get_label() {
		return esc_html__( 'Tools', 'elementor' );
	}

	public function get_parent_slug() {
		return Elementor_One_Menu_Manager::ROOT_MENU_SLUG;
	}

	public function is_visible() {
		return true;
	}

	public function get_page_title() {
		return esc_html__( 'Tools', 'elementor' );
	}

	public function render() {
		$this->tools_page->display_settings_page();
	}
}

