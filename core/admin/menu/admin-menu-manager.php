<?php

namespace Elementor\Core\Admin\Menu;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item;
use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_Has_Position;
use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Admin_Menu_Manager {

	/**
	 * @var Admin_Menu_Item[]
	 */
	private $items = [];

	public function __construct() {
		// Handle external redirects
		add_action( 'admin_init', [ $this, 'handle_external_redirects' ] );
	}

	public function register( $item_slug, Admin_Menu_Item $item ) {
		$this->items[ $item_slug ] = $item;
	}

	public function unregister( $item_slug ) {
		unset( $this->items[ $item_slug ] );
	}

	public function get( $item_slug ) {
		if ( empty( $this->items[ $item_slug ] ) ) {
			return null;
		}

		return $this->items[ $item_slug ];
	}

	public function get_all() {
		return $this->items;
	}

	public function register_actions() {
		add_action( 'admin_menu', function () {
			$this->register_wp_menus();
		}, 20 );

		add_action( 'admin_head', function () {
			$this->hide_invisible_menus();
		} );

		add_action( 'elementor/admin/menu/register', [ $this, 'register_cloud_hosting_plans' ], 999 );
	}

	/**
	 * Register Cloud Hosting Plans menu item
	 */
	public function register_cloud_hosting_plans( Admin_Menu_Manager $admin_menu ) {
		$admin_menu->register( 'go_cloud_hosting_plans', new Cloud_Hosting_Plans_Menu_Item() );
	}

	/**
	 * Handle external redirects
	 */
	public function handle_external_redirects() {
		if ( empty( $_GET['page'] ) ) {
			return;
		}

		if ( 'go_cloud_hosting_plans' === $_GET['page'] ) {
			wp_redirect( Cloud_Hosting_Plans_Menu_Item::get_url() );
			die;
		}
	}

	private function register_wp_menus() {
		do_action( 'elementor/admin/menu/register', $this );

		$hooks = [];

		foreach ( $this->get_all() as $item_slug => $item ) {
			$is_top_level = empty( $item->get_parent_slug() );

			if ( $is_top_level ) {
				$hooks[ $item_slug ] = $this->register_top_level_menu( $item_slug, $item );
			} else {
				$hooks[ $item_slug ] = $this->register_sub_menu( $item_slug, $item );
			}
		}

		do_action( 'elementor/admin/menu/after_register', $this, $hooks );
	}

	private function register_top_level_menu( $item_slug, Admin_Menu_Item $item ) {
		$has_page = ( $item instanceof Admin_Menu_Item_With_Page );
		$has_position = ( $item instanceof Admin_Menu_Item_Has_Position );

		$page_title = $has_page ? $item->get_page_title() : '';
		$callback = $has_page ? [ $item, 'render' ] : '';
		$position = $has_position ? $item->get_position() : null;

		return add_menu_page(
			$page_title,
			$item->get_label(),
			$item->get_capability(),
			$item_slug,
			$callback,
			'',
			$position
		);
	}

	private function register_sub_menu( $item_slug, Admin_Menu_Item $item ) {
		$has_page = ( $item instanceof Admin_Menu_Item_With_Page );

		$page_title = $has_page ? $item->get_page_title() : '';
		$callback = $has_page ? [ $item, 'render' ] : '';

		return add_submenu_page(
			$item->get_parent_slug(),
			$page_title,
			$item->get_label(),
			$item->get_capability(),
			$item_slug,
			$callback
		);
	}

	private function hide_invisible_menus() {
		foreach ( $this->get_all() as $item_slug => $item ) {
			if ( $item->is_visible() ) {
				continue;
			}

			$is_top_level = empty( $item->get_parent_slug() );

			if ( $is_top_level ) {
				remove_menu_page( $item_slug );
			} else {
				remove_submenu_page( $item->get_parent_slug(), $item_slug );
			}
		}
	}
}

/**
 * Cloud Hosting Plans Menu Item
 */
class Cloud_Hosting_Plans_Menu_Item implements Admin_Menu_Item_With_Page {
	const URL = 'https://go.elementor.com/host-local-side-menu/';

	public function is_visible() {
		// Check WordPress environment type
		$env_type = wp_get_environment_type();
		if (in_array($env_type, ['development', 'local', 'staging'])) {
			return true;
		}

		// Additional development environment checks as fallback
		$ip = $_SERVER['REMOTE_ADDR'] ?? '';
		$host = $_SERVER['HTTP_HOST'] ?? '';
		
		$is_dev = (
			strpos($host, '.local') !== false ||
			strpos($host, 'localhost') !== false ||
			preg_match('/^192\.168\./', $ip) || // Local IPs
			$ip === '127.0.0.1'
		);

		return $is_dev;
	}

	public function get_parent_slug() {
		return 'edit.php?post_type=elementor_library';
	}

	public function get_label() {
		return esc_html__( 'Cloud Hosting Plans', 'elementor' );
	}

	public function get_capability() {
		return 'manage_options';
	}

	public function get_page_title() {
		return esc_html__( 'Cloud Hosting Plans', 'elementor' );
	}

	public function render() {
		// This should never be reached due to redirect
		die;
	}

	public static function get_url() {
		return self::URL;
	}
}