<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

use Elementor\Modules\Promotions\AdminMenuItems\Base_Promotion_Template;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Form_Submissions_Promotion_Item extends Base_Promotion_Template {

	public function get_label() {
		return esc_html__( 'Submissions', 'elementor' );
	}

	public function get_page_title() {
		return esc_html__( 'Submissions', 'elementor' );
	}

	public function get_promotion_title() {
		/* translators: %s: br  */
		echo sprintf(
			esc_html( 'Create Forms and Collect Leads %s with Elementor Pro', 'elementor' ),
			'<br />'
		);
	}

	public function set_list() {
		return [
			esc_html__( 'Create single or multi-step forms to engage and convert visitors', 'elementor' ),
			esc_html__( 'Use any field to collect the information you need', 'elementor' ),
			esc_html__( 'Integrate your favorite marketing software*', 'elementor' ),
			esc_html__( 'Collect lead submissions directly within your WordPress Admin to manage, analyze and perform bulk actions on the submitted lead*', 'elementor' ),
		];
	}

	public function get_cta_url() {
		return 'https://go.elementor.com/go-pro-submissions/';
	}

	public function get_video_url() {
		return 'https://www.youtube-nocookie.com/embed/LNfnwba9C-8?si=JLHk3UAexnvTfU1a';
	}

	public function get_side_note() {
		return esc_html__( '* Requires an Advanced subscription or higher', 'elementor' );
	}
}
