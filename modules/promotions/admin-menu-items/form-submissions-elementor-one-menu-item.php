<?php
namespace Elementor\Modules\Promotions\AdminMenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Root_Elementor_One_Menu_Item;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Form_Submissions_Elementor_One_Menu_Item implements Root_Elementor_One_Menu_Item {

	public function get_capability() {
		return 'manage_options';
	}

	public function get_label() {
		return esc_html__( 'Form Submissions', 'elementor' );
	}

	public function get_icon_url() {
		return '';
	}

	public function get_position() {
		return null;
	}

	public function is_visible() {
		return true;
	}
}

