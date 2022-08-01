<?php
namespace Elementor\Modules\System_Info;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class System_Info_Menu_Item implements Admin_Menu_Item {

	private $system_info_page;

	public function __construct( Module $system_info_page ) {
		$this->system_info_page = $system_info_page;
	}
	public function is_visible() {
		return true;
	}

	public function parent_slug() {
		return Settings::PAGE_ID;
	}

	public function label() {
		return esc_html__( 'System Info', 'elementor' );
	}

	public function page_title() {
		return esc_html__( 'System Info', 'elementor' );
	}

	public function position() {
		return 3;
	}

	public function capability() {
		return $this->system_info_page->get_capability();
	}

	public function callback() {
		$this->system_info_page->display_page();
	}
}
