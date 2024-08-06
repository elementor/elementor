<?php

namespace Elementor\Modules\Checklist\Steps;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Create_Pages extends Step_Base {
	const STEP_ID = 'create_pages';

	public function get_id() : string {
		return self::STEP_ID;
	}

	public function get_completion_absolute_status() : bool {
		$pages = $this->wordpress_adapter->get_pages( [
			'meta_key' => '_elementor_version',
			'number' => 3,
		] );

		return count( $pages ) >= 3;
	}

	public function get_config() : array {
		return [
			'id' => self::get_id(),
			'title' => esc_html__( 'Create your first 3 pages', 'elementor' ),
			'description' => esc_html__( 'Jumpstart your creation with professional designs form the Template Library or start from scratch.', 'elementor' ),
			'learn_more_text' => esc_html__( 'Learn more', 'elementor' ),
			'learn_more_url' => esc_url( 'https://go.elementor.com/getting-started-with-elementor/' ),
			'cta_text' => esc_html__( 'Create a new page', 'elementor' ),
			'cta_url' => admin_url( 'post-new.php' ),
			'is_responsive_to_changes' => false,
			Step_Base::IS_ONE_COMPLETION_SUFFICIENT => true,
		];
	}
}
