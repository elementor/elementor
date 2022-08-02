<?php
namespace Elementor\Modules\System_Info;

use Elementor\Core\Admin\Menu\Interfaces\Renderable_Admin_Menu_Item;
use Elementor\Settings;
use Elementor\Modules\System_Info\Module as System_Info_Page;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class System_Info_Menu_Item implements Renderable_Admin_Menu_Item {

	private $system_info_page;

	public function __construct( System_Info_Page $system_info_page ) {
		$this->system_info_page = $system_info_page;
	}

	public function is_visible() {
		return true;
	}

	public function get_parent_slug() {
		return Settings::PAGE_ID;
	}

	public function get_label() {
		return esc_html__( 'System Info', 'elementor' );
	}

	public function get_page_title() {
		return esc_html__( 'System Info', 'elementor' );
	}

	public function get_position() {
		return 3;
	}

	public function get_capability() {
		return $this->system_info_page->get_capability();
	}

	public function callback() {
		$this->system_info_page->display_page();
	}
}
