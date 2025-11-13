<?php
namespace Elementor\Modules\CssConverter\Admin;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Converter_Admin_Menu implements Admin_Menu_Item_With_Page {

	const MENU_SLUG = 'elementor-css-converter';

	public function is_visible() {
		return true;
	}

	public function get_parent_slug() {
		return Settings::PAGE_ID;
	}

	public function get_label() {
		return esc_html__( 'CSS Converter', 'elementor' );
	}

	public function get_page_title() {
		return esc_html__( 'CSS Converter', 'elementor' );
	}

	public function get_capability() {
		return 'manage_options';
	}

	public function render() {
		echo '<div class="wrap">';
		echo '<h1>' . esc_html__( 'CSS Converter', 'elementor' ) . '</h1>';
		echo '<div id="elementor-css-converter-root"></div>';
		echo '</div>';
	}
}

