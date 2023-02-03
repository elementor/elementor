<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Form_Submissions_Promotion_Item extends Base_Promotion_Item {
	public function get_label() {
		return esc_html__( 'Submissions', 'elementor' );
	}

	public function get_page_title() {
		return esc_html__( 'Submissions', 'elementor' );
	}

	public function get_promotion_title() {
		return esc_html__( 'Collect Your Form Submissions', 'elementor' );
	}

	public function render_promotion_description() {
		echo esc_html__(
			'Save and manage all of your form submissions in one single place.
			All within a simple, intuitive place.',
			'elementor'
		); ?>

		<a href="https://go.elementor.com/wp-dash-submissions" target="_blank" rel="nofollow">
			<?php echo esc_html__( 'Learn More', 'elementor' ); ?>
		</a>

		<?php
	}

	public function get_cta_url() {
		return 'https://go.elementor.com/go-pro-submissions/';
	}
}
