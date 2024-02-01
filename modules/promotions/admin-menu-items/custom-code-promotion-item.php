<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Custom_Code_Promotion_Item extends Base_Promotion_Template {
	public function get_name() {
		return 'custom_code';
	}

	public function get_label() {
		return esc_html__( 'Custom Code', 'elementor' );
	}

	public function get_page_title() {
		return esc_html__( 'Custom Code', 'elementor' );
	}

	public function get_promotion_title() {
		echo sprintf(
			esc_html( 'Enjoy Creative Freedom with Custom Code', 'elementor' ),
			'<br />'
		);
	}

	public function set_list() {
		return [
			esc_html__( 'Add Custom Code snippets anywhere on your website, including the header or footer to measure your page’s performance*', 'elementor' ),
			esc_html__( 'Use Custom Code to create sophisticated custom interactions to engage visitors', 'elementor' ),
			esc_html__( 'Leverage Elementor AI to instantly generate Custom Code for Elementor', 'elementor' ),
		];
	}

	public function get_side_note() {
		return esc_html__( '* Requires an Advanced subscription or higher', 'elementor' );
	}


	/**
	 * @deprecated use get_promotion_description instead
	 * @return void
	 */
	public function get_cta_url() {
		return 'https://go.elementor.com/go-pro-custom-code/';
	}

	public function get_video_url() {
		return 'https://www.youtube-nocookie.com/embed/IOovQd1hJUg?si=xeBJ_mRZxRH1l5O6';
	}
}
