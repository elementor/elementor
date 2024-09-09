<?php

namespace elementor\modules\checklist\steps;

use Elementor\Core\DocumentTypes\Page;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class All_Done extends Step_Base {
	const STEP_ID = 'all_done';

	public function get_id() : string {
		return self::STEP_ID;
	}
	public function get_title() : string {
		return __( 'You\'re on your way!', 'elementor' );
	}

	public function get_description() : string {
		return __( 'With these steps, you\'ve got a great base for a robust website. Enjoy your web creation journey!', 'elementor' );
	}

	public function get_cta_text() : string {
		return esc_html__( 'Got it', 'elementor' );
	}

	public function get_image_src() : string {
		return 'https://assets.elementor.com/checklist/v1/images/checklist-step-7.jpg';
	}

	public function get_is_completion_immutable() : bool {
		return false;
	}

	public function get_cta_url() : string {
		return '';
	}

	public function is_absolute_completed() : bool {
		return true;
	}
}
