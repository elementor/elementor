<?php
namespace Elementor\Includes\Settings\MenuItems;

use Elementor\Plugin;
use Elementor\Settings;
use Elementor\Tools;
use Elementor\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Tools_Menu_Item implements \Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item {

	private $tools_page;

	public function __construct( Tools $tools_page ) {
		$this->tools_page = $tools_page;
	}

	public function is_visible() {
		return true;
	}

	public function parent_slug() {
		return Settings::PAGE_ID;
	}

	public function label() {
		return esc_html__( 'Tools', 'elementor' );
	}

	public function page_title() {
		return esc_html__( 'Tools', 'elementor' );
	}

	public function position() {
		return 1;
	}

	public function capability() {
		return 'manage_options';
	}

	public function callback() {
		$this->tools_page->display_settings_page();
	}
}
