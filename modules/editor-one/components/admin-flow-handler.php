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

		$redirect_url = $this->get_redirect_url( $page );

		if ( empty( $redirect_url ) ) {
			return;
		}

		wp_safe_redirect( $redirect_url );
		exit;
	}

	/**
	 * Default destinations may carry a `return_to` that points back to the parent alias itself,
	 * which would redirect into the destination again when it is closed.
	 */
	public function get_redirect_url( string $page ): string {
		$redirect_url = $this->get_map()->get_parent_redirect_url( $page );

		if ( empty( $redirect_url ) || false === strpos( $redirect_url, 'return_to=' ) ) {
			return $redirect_url;
		}

		$redirect_url = remove_query_arg( 'return_to', $redirect_url );
		$referer = wp_get_referer();

		return $referer ? add_query_arg( 'return_to', rawurlencode( $referer ), $redirect_url ) : $redirect_url;
	}

	public function filter_parent_file( $parent_file ) {
		if ( empty( $this->get_active_state()['parent'] ) ) {
			return $parent_file;
		}

		$this->map_detected_parent_to_elementor_home();

		return Menu_Config::ELEMENTOR_HOME_MENU_SLUG;
	}

	/**
	 * WordPress re-detects the parent with `get_admin_page_parent()` right after the `parent_file` filter,
	 * which would pick the hidden legacy Elementor / Templates top-level menus. Since WP 7, a top-level
	 * plugin page ignores `$_wp_real_parent_file` for the global, so its hidden menu entry is dropped instead.
	 */
	private function map_detected_parent_to_elementor_home(): void {
		global $_wp_real_parent_file, $menu, $pagenow, $plugin_page;

		$detected_parent = get_admin_page_parent();

		if ( empty( $detected_parent ) || Menu_Config::ELEMENTOR_HOME_MENU_SLUG === $detected_parent ) {
			return;
		}

		$_wp_real_parent_file[ $detected_parent ] = Menu_Config::ELEMENTOR_HOME_MENU_SLUG; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited

		if ( 'admin.php' !== $pagenow || $plugin_page !== $detected_parent ) {
			return;
		}

		foreach ( (array) $menu as $index => $menu_item ) {
			if ( ( $menu_item[2] ?? '' ) === $detected_parent ) {
				unset( $menu[ $index ] );
			}
		}
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

		if ( empty( $query_args['post_type'] ) && ! empty( $GLOBALS['typenow'] ) ) {
			$query_args['post_type'] = sanitize_key( $GLOBALS['typenow'] );
		}

		return $query_args;
	}
}
