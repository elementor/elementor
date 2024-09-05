<?php

namespace Elementor\Modules\Checklist\Steps;

use Elementor\Core\DocumentTypes\Page;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Add_Logo extends Step_Base {
	const STEP_ID = 'add_logo';

	const SITE_IDENTITY_TAB = 'settings-site-identity';

	public function get_id() : string {
		return self::STEP_ID;
	}

	public function is_absolute_completed() : bool {
		return $this->wordpress_adapter->has_custom_logo();
	}

	public function get_title() : string {
		return esc_html__( 'Add your logo', 'elementor' );
	}

	public function get_description() : string {
		return __( 'Let\'s start by adding your logo and filling in the site identity settings. This will establish your initial presence and also improve SEO.', 'elementor' );
	}

	public function get_cta_text() : string {
		return esc_html__( 'Go to Site Identity', 'elementor' );
	}

	public function get_cta_url() : string {
		$link = Page::get_site_settings_url_config( true );

		if ( ! $link ) {
			return Page::get_elementor_create_new_page_url( self::SITE_IDENTITY_TAB );
		}

		$parsed_url = wp_parse_url( $link );
		$query_params = [];
		wp_parse_str( $parsed_url['query'] ?? '', $query_params );
		$additional_params = [
			'active-document' => Plugin::$instance->kits_manager->get_active_id(),
			'active-tab' => self::SITE_IDENTITY_TAB,
		];

		$merged_params = array_merge( $query_params, $additional_params );

		if ( $this->page_exists( $merged_params ) ) {
			return $this->wordpress_adapter->add_query_arg( $additional_params, $link );
		}

		return Page::get_elementor_create_new_page_url();
	}

	public function get_is_completion_immutable() : bool {
		return false;
	}

	public function get_image_src() : string {
		return 'https://assets.elementor.com/checklist/v1/images/checklist-step-1.jpg';
	}

	public function get_learn_more_url() : string {
		return 'http://go.elementor.com/app-website-checklist-logo-article';
	}

	public function page_exists( $params ) : bool {
		$query = new \WP_Query( $params );

		return $query->found_posts;
	}
}
