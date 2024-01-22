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

			$promotion = apply_filters( 'elementor/fonts/restrictions/custom_promotion', $promotion );
			return ELEMENTOR_ASSETS_URL . $promotion['image'];
	}

	public function get_cta_text() {
		$promotion['upgrade_text'] = 'Upgrade';
		$upgrade_text = apply_filters( 'elementor/fonts/restrictions/custom_promotion', $promotion )['upgrade_text'];
		return esc_html__( $upgrade_text, 'elementor' );
	}

	public function get_promotion_title() {
		$promotion['title'] = 'Add Your Custom Fonts';

		$promotion = apply_filters( 'elementor/fonts/restrictions/custom_promotion', $promotion );
		return esc_html__( $promotion['title'], 'elementor' );
	}

	public function render_promotion_description() {
		$promotion['description'] = 'Custom Fonts allows you to add your self-hosted fonts and use them on your Elementor projects to create a unique brand language.';

		$promotion = apply_filters( 'elementor/fonts/restrictions/custom_promotion', $promotion );
		echo esc_html__( $promotion['description'], 'elementor' );
	}

	public function get_cta_url() {
		$upgrade_url = 'https://go.elementor.com/go-pro-custom-fonts/';
		$promotion['upgrade_url'] = $upgrade_url;

		$promotion = apply_filters( 'elementor/fonts/restrictions/custom_promotion', $promotion );

		if ( strpos( $promotion['upgrade_url'] ?? '', 'elementor.com' ) === false ) {
			$promotion['upgrade_url'] = $upgrade_url;
		}
		return esc_url( $promotion['upgrade_url'] );
	}
}
