<?php

namespace Elementor\Modules\Promotions\MenuItems;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Custom_Icons_Promotion_Item extends Base_Promotion_Item {
	public function label() {
		return esc_html__( 'Custom Icons', 'elementor' );
	}

	public function page_title() {
		return esc_html__( 'Custom Icons', 'elementor' );
	}

	public function promotion_title() {
		return esc_html__( 'Add Your Custom Icons', 'elementor' );
	}

	public function promotion_description() {
		echo esc_html__(
			'Don\'t rely solely on the FontAwesome icons everyone else is using! Differentiate your website and your style with custom icons you can upload from your favorite icons source.',
			'elementor'
		);
	}

	public function cta_url() {
		return 'https://go.elementor.com/go-pro-custom-icons/';
	}
}
