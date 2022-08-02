<?php

namespace Elementor\Core\Admin\Menu;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item;
use Elementor\Core\Admin\Menu\Interfaces\Renderable_Admin_Menu_Item;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Admin_Menu {

	/**
	 * @var Admin_Menu_Item[]
	 */
	private $items = [];

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
			$this->register_menus();
		}, 20 );

		add_action( 'admin_head', function () {
			$this->hide_invisible_menus();
		} );
	}

	private function register_menus() {
		do_action( 'elementor/admin/menu/register', $this );

		foreach ( $this->get_all() as $item_slug => $item ) {
			$is_top_level = empty( $item->get_parent_slug() );

			if ( $is_top_level ) {
				$this->register_top_level_menu( $item_slug, $item );
			} else {
				$this->register_sub_menu( $item_slug, $item );
			}
		}

		do_action( 'elementor/admin/menu/after_register', $this );
	}

	private function register_top_level_menu( $item_slug, Admin_Menu_Item $item ) {
		$callback = $item instanceof Renderable_Admin_Menu_Item
			? [ $item, 'callback' ]
			: '';

		add_menu_page(
			$item->get_page_title(),
			$item->get_label(),
			$item->get_capability(),
			$item_slug,
			$callback,
			'', // TODO: Add support?
			$item->get_position()
		);
	}

	private function register_sub_menu( $item_slug, Admin_Menu_Item $item ) {
		$callback = $item instanceof Renderable_Admin_Menu_Item
			? [ $item, 'callback' ]
			: '';

		add_submenu_page(
			$item->get_parent_slug(),
			$item->get_page_title(),
			$item->get_label(),
			$item->get_capability(),
			$item_slug,
			$callback,
			$item->get_position()
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
