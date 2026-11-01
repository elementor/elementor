<?php

namespace Elementor\Modules\EditorOne\Components;

use Elementor\Modules\EditorOne\Classes\Admin_Flow_Config;
use Elementor\Modules\EditorOne\Classes\Admin_Flow_Map;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Admin_Flow_Handler {

	private ?Admin_Flow_Map $map = null;

	private ?array $active_state = null;

	public function __construct() {
		$this->register_actions();
	}

	private function register_actions(): void {
		add_action( 'admin_menu', [ $this, 'redirect_parent_to_default_destination' ], 10010 );
		add_filter( 'parent_file', [ $this, 'filter_parent_file' ] );
		add_filter( 'submenu_file', [ $this, 'filter_submenu_file' ] );
	}

	public function get_map(): Admin_Flow_Map {
		if ( null === $this->map ) {
			$this->map = new Admin_Flow_Map( Menu_Data_Provider::instance(), Admin_Flow_Config::get_config() );
		}

		return $this->map;
	}

	public function get_active_state(): array {
		if ( null === $this->active_state ) {
			$this->active_state = $this->get_map()->resolve( $this->get_current_query_args() );
		}

		return $this->active_state;
	}

	public function redirect_parent_to_default_destination(): void {
		$page = filter_input( INPUT_GET, 'page', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) ?? '';

		if ( empty( $page ) ) {
			return;
		}

		$redirect_url = $this->get_map()->get_parent_redirect_url( $page );

		if ( empty( $redirect_url ) ) {
			return;
		}

		wp_safe_redirect( $redirect_url );
		exit;
	}

	public function filter_parent_file( $parent_file ) {
		if ( empty( $this->get_active_state()['parent'] ) ) {
			return $parent_file;
		}

		return Menu_Config::ELEMENTOR_HOME_MENU_SLUG;
	}

	public function filter_submenu_file( $submenu_file ) {
		$active_parent = $this->get_active_state()['parent'];

		return empty( $active_parent ) ? $submenu_file : $active_parent;
	}

	private function get_current_query_args(): array {
		$query_args = [];

		foreach ( Admin_Flow_Map::ROUTE_KEYS as $key ) {
			$value = filter_input( INPUT_GET, $key, FILTER_SANITIZE_FULL_SPECIAL_CHARS );

			if ( ! empty( $value ) ) {
				$query_args[ $key ] = $value;
			}
		}

		return $query_args;
	}
}
