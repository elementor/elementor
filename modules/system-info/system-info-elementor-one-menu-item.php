<?php
namespace Elementor\Modules\System_Info;

use Elementor\Core\Admin\Menu\Elementor_One_Menu_Manager;
use Elementor\Core\Admin\Menu\Interfaces\Editor_Elementor_One_Menu_Item;
use Elementor\Core\Admin\Menu\Interfaces\Elementor_One_Menu_Item_With_Page;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class System_Info_Elementor_One_Menu_Item implements Editor_Elementor_One_Menu_Item, Elementor_One_Menu_Item_With_Page {

	private $system_info_page;

	public function __construct( Module $system_info_page ) {
		$this->system_info_page = $system_info_page;
	}

	public function get_capability() {
		return $this->system_info_page->get_capability();
	}

	public function get_label() {
		return esc_html__( 'System Info', 'elementor' );
	}

	public function get_parent_slug() {
		return Elementor_One_Menu_Manager::ROOT_MENU_SLUG;
	}

	public function is_visible() {
		return true;
	}

	public function get_page_title() {
		return esc_html__( 'System Info', 'elementor' );
	}

	public function render() {
		$this->system_info_page->display_page();
	}
}

