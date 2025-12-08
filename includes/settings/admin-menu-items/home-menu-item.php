<?php
namespace Elementor\Includes\Settings\AdminMenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Home_Menu_Item implements Admin_Menu_Item_With_Page {
	private $settings_page;

	public function __construct( Settings $settings_page ) {
		$this->settings_page = $settings_page;
	}

	public function is_visible() {
		return true;
	}

	public function get_parent_slug() {
		return null;
	}

	public function get_label() {
		return esc_html__( 'Home', 'elementor' );
	}

	public function get_page_title() {
		return $this->get_label();
	}

	public function get_position() {
		return 10;
	}

	public function get_capability() {
		return 'manage_options';
	}

	public function render() {
		$this->settings_page->display_home_screen();
	}
}

