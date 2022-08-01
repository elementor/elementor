<?php

namespace Elementor\Core\Admin\Menu;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item;

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
			if ( ! current_user_can( 'manage_options' ) ) {
				return;
			}

			$this->register_menus();
		}, 20 );

		// TODO: Handle is_visible()
	}

	private function register_menus() {
		do_action( 'elementor/admin/menu/register', $this );

		foreach ( $this->get_all() as $item_slug => $item ) {
			$is_top_level = empty( $item->parent_slug() );

			if ( $is_top_level ) {
				$this->register_top_level_menu( $item_slug, $item );
			} else {
				$this->register_sub_menu( $item_slug, $item );
			}
		}

		do_action( 'elementor/admin/menu/after_register', $this );
	}

	private function register_top_level_menu( $item_slug, Admin_Menu_Item $item ) {
		add_menu_page(
			$item->page_title(),
			$item->label(),
			$item->capability(),
			$item_slug,
			[ $item, 'callback' ],
			'', // TODO: Add support?
			$item->position()
		);
	}

	private function register_sub_menu( $item_slug, Admin_Menu_Item $item ) {
		add_submenu_page(
			$item->parent_slug(),
			$item->page_title(),
			$item->label(),
			$item->capability(),
			$item_slug,
			[ $item, 'callback' ],
			$item->position()
		);
	}}
