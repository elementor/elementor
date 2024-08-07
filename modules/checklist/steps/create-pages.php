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

	public function get_config() : array {
		return [
			'id' => self::get_id(),
			'title' => esc_html__( 'Create your first 3 pages', 'elementor' ),
			'description' => esc_html__( 'Jumpstart your creation with professional designs form the Template Library or start from scratch.', 'elementor' ),
			'learn_more_text' => esc_html__( 'Learn more', 'elementor' ),
			'learn_more_url' => esc_url( 'https://go.elementor.com/getting-started-with-elementor/' ),
			'cta_text' => esc_html__( 'Create a new page', 'elementor' ),
			'cta_url' => Plugin::$instance->documents->get_create_new_post_url( 'page' ),
			'is_responsive_to_changes' => false,
			Step_Base::IS_COMPLETION_IMMUTABLE => true,
		];
	}
}
