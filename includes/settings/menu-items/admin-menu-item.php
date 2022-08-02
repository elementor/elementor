<?php
namespace Elementor\Includes\Settings\MenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Renderable_Admin_Menu_Item;
use Elementor\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Admin_Menu_Item implements Renderable_Admin_Menu_Item {
	private $settings_page;

	public function __construct( Settings $settings_page ) {
		$this->settings_page = $settings_page;
	}

	public function is_visible() {
		return true;
	}

	public function parent_slug() {
		return null;
	}

	public function label() {
		return esc_html__( 'Elementor', 'elementor' );

	}

	public function page_title() {
		return esc_html__( 'Elementor', 'elementor' );
	}

	public function position() {
		return '58.5';
	}

	public function capability() {
		return 'manage_options';
	}

	public function callback() {
		$this->settings_page->display_settings_page();
	}
}
