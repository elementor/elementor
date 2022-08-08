<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Custom_Code_Promotion_Item extends Base_Promotion_Item {
	public function get_label() {
		return esc_html__( 'Custom Code', 'elementor' );
	}

	public function get_page_title() {
		return esc_html__( 'Custom Code', 'elementor' );
	}

	public function get_promotion_title() {
		return esc_html__( 'Add Your Custom Code', 'elementor' );
	}

	public function render_promotion_description() {
		echo esc_html__(
			'Custom Code is a tool gives you one place where you can insert scripts, rather than dealing with dozens of different plugins and deal with code.',
			'elementor'
		);
	}

	public function get_cta_url() {
		return 'https://go.elementor.com/go-pro-custom-code/';
	}
}
