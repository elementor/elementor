<?php

namespace Elementor\Modules\Promotions\MenuItems;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Custom_Fonts_Promotion_Item extends Base_Promotion_Item {
	public function label() {
		return esc_html__( 'Custom Fonts', 'elementor' );
	}

	public function page_title() {
		return esc_html__( 'Custom Fonts', 'elementor' );
	}

	public function promotion_title() {
		return esc_html__( 'Add Your Custom Fonts', 'elementor' );
	}

	public function promotion_description() {
		echo esc_html__(
			'Custom Fonts allows you to add your self-hosted fonts and use them on your Elementor projects to create a unique brand language.',
			'elementor'
		);
	}

	public function cta_url() {
		return 'https://go.elementor.com/go-pro-custom-fonts/';
	}
}
