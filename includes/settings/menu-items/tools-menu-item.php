<?php
namespace Elementor\Includes\Settings\MenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Renderable_Admin_Menu_Item;
use Elementor\Settings;
use Elementor\Tools;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Tools_Menu_Item implements Renderable_Admin_Menu_Item {

	private $tools_page;

	public function __construct( Tools $tools_page ) {
		$this->tools_page = $tools_page;
	}

	public function is_visible() {
		return true;
	}

	public function get_parent_slug() {
		return Settings::PAGE_ID;
	}

	public function get_label() {
		return esc_html__( 'Tools', 'elementor' );
	}

	public function get_page_title() {
		return esc_html__( 'Tools', 'elementor' );
	}

	public function get_position() {
		return 1;
	}

	public function get_capability() {
		return 'manage_options';
	}

	public function callback() {
		$this->tools_page->display_settings_page();
	}
}
