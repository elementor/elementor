<?php

namespace Elementor\Modules\Checklist\Steps;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Create_Pages extends Step_Base {
	const STEP_ID = 'create_pages';

	public function get_id() : string {
		return self::STEP_ID;
	}

	public function is_absolute_completed() : bool {
		$pages = $this->wordpress_adapter->get_pages( [
			'meta_key' => '_elementor_version',
			'number' => 3,
		] ) ?? [];

		return count( $pages ) >= 3;
	}

	public function get_title() : string {
		return esc_html__( 'Create your first 3 pages', 'elementor' );
	}

	public function get_description() : string {
		return esc_html__( 'Jumpstart your creation with professional designs form the Template Library or start from scratch.', 'elementor' );
	}

	public function get_cta_text() : string {
		return esc_html__( 'Create a new page', 'elementor' );
	}

	public function get_cta_url() : string {
		return Plugin::$instance->documents->get_create_new_post_url( 'page' );
	}

	public function get_is_completion_immutable() : bool {
		return true;
	}
}
