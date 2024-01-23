<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

use Elementor\core\utils\promotions\Validate_Promotion;

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
			$default_image = 'images/go-pro-wp-dashboard.svg';
			$promotion['image'] = $default_image;
			$promotion = apply_filters( 'elementor/fonts/restrictions/custom_promotion', $promotion );

			if ( isset( $promotion['image'] ) ) {
				return esc_url( ELEMENTOR_ASSETS_URL . $promotion['image'] );
			}
			return esc_url($default_image);
	}

	public function get_cta_text() {
		$promotion['upgrade_text'] = __( 'Upgrade', 'elementor' );
		$upgrade_text = apply_filters( 'elementor/fonts/restrictions/custom_promotion', $promotion )['upgrade_text'] ?? $promotion['upgrade_text'];
		return esc_html( $upgrade_text );
	}

	public function get_promotion_title() {
		$promotion['title'] = __( 'Add Your Custom Fonts', 'elementor' );

		$title = apply_filters( 'elementor/fonts/restrictions/custom_promotion', $promotion )['title'] ?? $promotion['title'];
		return esc_html( $title );
	}

	public function render_promotion_description() {
		$promotion['description'] = __( 'Custom Fonts allows you to add your self-hosted fonts and use them on your Elementor projects to create a unique brand language.', 'elementor' );

		$description = apply_filters( 'elementor/fonts/restrictions/custom_promotion', $promotion )['description'] ?? $promotion['description'];
		echo esc_html( $description );
	}

	public function get_cta_url() {
		$upgrade_url = 'https://go.elementor.com/go-pro-custom-fonts/';
		$promotion['upgrade_url'] = $upgrade_url;

		$promotion = apply_filters( 'elementor/fonts/restrictions/custom_promotion', $promotion );

		if ( false === Validate_Promotion::domain_is_on_elementor_dot_com( $promotion['upgrade_url'] ) ) {
			$promotion['upgrade_url'] = $upgrade_url;
		}

		return esc_url( $promotion['upgrade_url'] );
	}
}
