<?php

namespace Elementor\Modules\EditorOne\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Current_Page_Inspector {
	private Menu_Data_Provider $menu_data_provider;

	public function __construct( Menu_Data_Provider $menu_data_provider ) {
		$this->menu_data_provider = $menu_data_provider;
	}

	public function is_elementor_editor_page(): bool {
		if ( ! get_current_screen() ) {
			return false;
		}

		$page = filter_input( INPUT_GET, 'page', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) ?? '';

		if ( Menu_Config::ELEMENTOR_HOME_MENU_SLUG === $page ) {
			return false;
		}

		if ( in_array( $page, $this->menu_data_provider->get_all_sidebar_page_slugs(), true ) ) {
			return true;
		}

		$post_type = filter_input( INPUT_GET, 'post_type', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) ?? '';

		return $this->is_elementor_post_type( $post_type );
	}

	private function is_elementor_post_type( string $post_type ): bool {
		if ( empty( $post_type ) ) {
			return false;
		}

		return isset( Menu_Config::get_elementor_post_types()[ $post_type ] );
	}
}

