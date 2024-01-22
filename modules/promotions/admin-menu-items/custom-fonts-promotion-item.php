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

	public function get_image_url() {
			$promotion['image'] = 'images/go-pro-wp-dashboard.svg';

			$promotion= apply_filters( 'elementor/fonts/restrictions/custom_promotion', $promotion );
			return ELEMENTOR_ASSETS_URL . $promotion['image'];
	}

	public function get_cta_text() {
		$promotion['upgrade_text'] = 'Upgrade';
		$promotion= apply_filters( 'elementor/fonts/restrictions/custom_promotion', $promotion );
		return esc_html__( $promotion['upgrade_text'], 'elementor' );
	}

	public function get_promotion_title() {
		$promotion['title'] = esc_html__( 'Add Your Custom Fonts', 'elementor' );

		$promotion= apply_filters( 'elementor/fonts/restrictions/custom_promotion', $promotion );
		return $promotion['title'];
	}

	public function render_promotion_description() {
		$promotion['description'] = esc_html__(
			'Custom Fonts allows you to add your self-hosted fonts and use them on your Elementor projects to create a unique brand language.',
			'elementor'
		);

		$promotion = apply_filters( 'elementor/fonts/restrictions/custom_promotion', $promotion );
		echo $promotion['description'];
	}

	public function get_cta_url() {
		$upgrade_url = 'https://go.elementor.com/go-pro-custom-fonts/';
		$promotion['upgrade_url'] = $upgrade_url;

		$promotion = apply_filters( 'elementor/fonts/restrictions/custom_promotion', $promotion );

		if( strpos( $promotion['upgrade_url'] ?? '', 'elementor.com' ) === false ) {
			$promotion['upgrade_url'] = $upgrade_url;
		}
		return (string) $promotion['upgrade_url'];
	}
}
