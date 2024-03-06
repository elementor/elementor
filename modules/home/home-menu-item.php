<?php
namespace Elementor\Modules\Home;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Settings;
//use Elementor\Modules\Apps\Admin_Apps_Page;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Home_Menu_item implements Admin_Menu_Item_With_Page {

	public function is_visible() {
		return true;
	}

	public function get_parent_slug() {
		return Settings::PAGE_ID;
	}

	public function get_label() {
		return esc_html__( 'Home', 'elementor' );
	}

	public function get_page_title() {
		return esc_html__( 'Home', 'elementor' );
	}

	public function get_capability() {
		return 'manage_options';
	}

	public function render() {}
}
