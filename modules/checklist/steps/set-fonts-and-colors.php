<?php

namespace Elementor\Modules\Checklist\Steps;

use Elementor\Core\DocumentTypes\Page;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Set_Fonts_And_Colors extends Step_Base {
	const STEP_ID = 'set_fonts_and_colors';

	public function get_id() : string {
		return self::STEP_ID;
	}

	public function is_absolute_completed() : bool {
		$settings = $this->kit_adapter->get_kit_settings();
		$custom_color = $settings['custom_colors'] ?? '';
		$custom_fonts = $settings['custom_typography'] ?? '';

		return ! empty( $custom_color ) && ! empty( $custom_fonts );
	}

	public function get_title() : string {
		return __( 'Set up your Global Fonts & Colors', 'elementor' );
	}

	public function get_description() : string {
		return esc_html__( 'Global colors and fonts ensure a cohesive look across your site. Start by defining one color and one font.', 'elementor' );
	}

	public function get_cta_text() : string {
		return esc_html__( 'Go to Site Identity', 'elementor' );
	}

	public function get_cta_url() : string {
		$link = Page::get_site_settings_url_config( true )['url'];

		if ( ! $link ) {
			return Page::get_create_new_editor_page_url();
		}

		$parsed_url = wp_parse_url( $link );
		$query_params = [];
		wp_parse_str( $parsed_url['query'] ?? '', $query_params );
		$additional_params = [
			'active-document' => Plugin::$instance->kits_manager->get_active_id(),
		];

		$merged_params = array_merge( $query_params, $additional_params );

		if ( $this->page_exists( $merged_params ) ) {
			return $this->wordpress_adapter->add_query_arg( $additional_params, $link );
		}

		return Page::get_create_new_editor_page_url();
	}

	public function get_is_completion_immutable() : bool {
		return false;
	}

	public function get_image_src() : string {
		return 'https://assets.elementor.com/checklist/v1/images/checklist-step-2.jpg';
	}

	public function get_learn_more_url() : string {
		return 'http://go.elementor.com/app-website-checklist-global-article';
	}

	public function page_exists( $params ) : bool {
		$query = new \WP_Query( $params );

		return $query->found_posts;
	}
}
