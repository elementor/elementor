<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Custom_Icons_Promotion_Item extends Base_Promotion_Template {
	public function get_name() {
		return 'custom_icons';
	}


	public function get_label() {
		return esc_html__( 'Custom Icons', 'elementor' );
	}

	public function get_page_title() {
		return esc_html__( 'Custom Icons', 'elementor' );
	}

	public function get_promotion_title() {
		/* translators: %s: br  */
		echo sprintf(
			esc_html( 'Enjoy creative freedom %s with Custom Icons', 'elementor' ),
			'<br />'
		);
	}

	public function set_list() {
		return [
			sprintf(
				esc_html( 'Expand your icon library beyond FontAwesome and add icon %s libraries of your choice', 'elementor' ),
				'<br />'
			),
			esc_html__( 'Add any icon, anywhere on your website', 'elementor' ),
		];
	}

	public function get_cta_url() {
		return 'https://go.elementor.com/go-pro-submissions/';
	}

	public function get_video_url() {
		return 'https://www.youtube-nocookie.com/embed/PsowinxDWfM?si=SV9Z3TLz3_XEy5C6';
	}
}
