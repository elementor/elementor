<?php
namespace Elementor\Modules\ConversionCenter\AdminMenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item;
use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_Has_Position;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Conversion_Center_Menu_Item implements Admin_Menu_Item, Admin_Menu_Item_Has_Position {

	const AFTER_ELEMENTOR = 58.7;

	public function is_visible() {
		return true;
	}

	public function get_parent_slug() {
		return '';
	}

	public function get_label() {
		return esc_html__( 'Conversion Center', 'elementor' );
	}

	public function get_page_title() {
		return esc_html__( 'Conversion Center', 'elementor' );
	}

	public function get_capability() {
		return 'manage_options';
	}

	public function get_position() {
		return self::AFTER_ELEMENTOR;
	}
}
