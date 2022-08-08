<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Custom_Fonts_Promotion_Item extends Base_Promotion_Item {
	public function get_label() {
		return esc_html__( 'Custom Fonts', 'elementor' );
	}

	public function get_page_title() {
		return esc_html__( 'Custom Fonts', 'elementor' );
	}

	public function get_promotion_title() {
		return esc_html__( 'Add Your Custom Fonts', 'elementor' );
	}

	public function render_promotion_description() {
		echo esc_html__(
			'Custom Fonts allows you to add your self-hosted fonts and use them on your Elementor projects to create a unique brand language.',
			'elementor'
		);
	}

	public function get_cta_url() {
		return 'https://go.elementor.com/go-pro-custom-fonts/';
	}
}
