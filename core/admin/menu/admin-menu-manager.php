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
	 * Register Cloud Hosting Plans menu item.
	 */
	public function register_cloud_hosting_plans( Admin_Menu_Manager $admin_menu ) {
		$admin_menu->register( 'go_cloud_hosting_plans', new Cloud_Hosting_Plans_Menu_Item() );
	}

	/**
	 * Handle external redirects.
	 */
	public function handle_external_redirects() {
		if ( empty( $_GET['page'] ) ) {
			return;
		}

		if ( 'go_cloud_hosting_plans' === $_GET['page'] ) {
			wp_redirect( Cloud_Hosting_Plans_Menu_Item::get_url() );

			exit;
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
