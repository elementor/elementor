<?php
namespace Elementor\Modules\ElementsManager;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Admin_Menu_Apps implements Admin_Menu_Item_With_Page {

	public function is_visible() {
		return true;
	}

	public function get_parent_slug() {
		return Settings::PAGE_ID;
	}

	public function get_label() {
		return esc_html__( 'Elements Manager', 'elementor' );
	}

	public function get_page_title() {
		return esc_html__( 'Elements Manager', 'elementor' );
	}

	public function get_capability() {
		return 'manage_options';
	}

	public function render() {
		echo '<div class="wrap">';
		echo '<h2>' . esc_html__( 'Elements Manager', 'elementor' ) . '</h2>';
		echo '<div id="elementor-elements-manager-wrap"></div>';
		echo '</div>';
	}
}
