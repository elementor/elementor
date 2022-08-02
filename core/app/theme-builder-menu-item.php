<?php
namespace Elementor\Core\App;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Theme_Builder_Menu_Item implements Admin_Menu_Item {

	public function is_visible() {
		return true;
	}

	public function get_parent_slug() {
		return Source_Local::ADMIN_MENU_SLUG;
	}

	public function get_label() {
		return esc_html__( 'Theme Builder', 'elementor' );
	}

	public function get_page_title() {
		return esc_html__( 'Theme Builder', 'elementor' );
	}

	public function get_position() {
		return 1;
	}

	public function get_capability() {
		return 'manage_options';
	}
}
