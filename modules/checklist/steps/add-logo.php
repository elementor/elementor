<?php

namespace Elementor\Modules\Checklist\Steps;

use Elementor\Core\Base\Document;
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
		$link = $this->get_site_settings_url_config();

		if ( ! $link ) {
			return $this->get_elementor_create_new_page_url();
		}

		$parsed_url = parse_url( $link );
		$query_params = [];
		parse_str( $parsed_url['query'] ?? '', $query_params );
		$additional_params = [
			'active-document' => Plugin::$instance->kits_manager->get_active_id(),
			'active-tab' => self::SITE_IDENTITY_TAB,
		];

		$merged_params = array_merge( $query_params, $additional_params );

		if ( $this->page_exists( $merged_params ) ) {
			return $this->wordpress_adapter->add_query_arg( $additional_params, $link );
		}

		return $this->get_elementor_create_new_page_url();
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

	private function get_elementor_create_new_page_url(): string {
		return $this->wordpress_adapter->add_query_arg( [
			'active-document' => Plugin::$instance->kits_manager->get_active_id(),
			'active-tab' => self::SITE_IDENTITY_TAB,
		], Plugin::$instance->documents->get_create_new_post_url( 'page' ) );
	}

	private function get_site_settings_url_config(): string {
		$existing_elementor_page = $this->get_elementor_page();
		return ! empty( $existing_elementor_page )
			? $this->get_elementor_edit_url( $existing_elementor_page->ID )
			: $this->get_elementor_create_new_page_url();
	}

	private function get_elementor_edit_url( int $post_id ): string {
		$active_kit_id = Plugin::$instance->kits_manager->get_active_id();
		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			return '';
		}

		return $this->wordpress_adapter->add_query_arg( [ 'active-document' => $active_kit_id ], $document->get_edit_url() );
	}

	private function get_elementor_page() {
		$args = [
			'meta_key' => Document::BUILT_WITH_ELEMENTOR_META_KEY,
			'sort_order' => 'asc',
			'sort_column' => 'post_date',
		];
		$pages = $this->wordpress_adapter->get_pages( $args );

		if ( empty( $pages ) ) {
			return null;
		}

		$show_page_on_front = 'page' === $this->wordpress_adapter->get_option( 'show_on_front' );

		if ( ! $show_page_on_front ) {
			return $pages[0];
		}

		$home_page_id = $this->wordpress_adapter->get_option( 'page_on_front' );

		foreach ( $pages as $page ) {
			if ( (string) $page->ID === $home_page_id ) {
				return $page;
			}
		}

		return $pages[0];
	}
}
