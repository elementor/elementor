<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Custom_Fonts_Promotion_Item extends Base_Promotion_Template {
	public function get_name() {
		return 'custom_fonts';
	}

	public function get_label() {
		return esc_html__( 'Custom Fonts', 'elementor' );
	}

	public function get_page_title() {
		return esc_html__( 'Custom Fonts', 'elementor' );
	}

	public function get_promotion_title() {
		return esc_html__( 'Stay on brand with a Custom Font', 'elementor' );
	}

	public function set_list() {
		return [
			esc_html__( 'Upload any font to keep your website true to your brand', 'elementor' ),
			sprintf(
				/* translators: %s: br  */
				esc_html__( 'Remain GDPR compliant with Custom Fonts that let you disable %s Google Fonts from your website', 'elementor' ),
				'<br />'
			),
		];
	}

	public function get_cta_url() {
		return 'https://go.elementor.com/go-pro-custom-fonts/';
	}

	public function get_video_url() {
		return 'https://www.youtube-nocookie.com/embed/j_guJkm28eY?si=cdd2TInwuGDTtCGD';
	}
}
