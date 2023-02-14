<?php
namespace Elementor\App_Dashboard;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Wp_Menu_Item implements Admin_Menu_Item {

	public function is_visible() {
		return true;
	}

	public function get_parent_slug() {
		return '';
	}

	public function get_label() {
		return esc_html__( 'Wordpress', 'elementor' );
	}

	public function get_capability() {
		return 'manage_options';
	}
}
