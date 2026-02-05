<?php

namespace Elementor\Core\Admin\Menu;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item;
use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_Has_Position;
use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Core\Admin\Menu\Deprecated;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @deprecated 3.34.2 Elementor menu items are now registered inside Elementor\Core\Admin\EditorOneMenu. Use Elementor\Core\Admin\EditorOneMenu\Elementor_One_Menu_Manager instead.
 */
class Admin_Menu_Manager {
	use Deprecated;

	/**
	 * @var Admin_Menu_Item[]
	 */
	private $items = [];

	/**
	 * @deprecated 3.34.2 Use Elementor\Core\Admin\EditorOneMenu\Elementor_One_Menu_Manager instead.
	 */
	public function register( $item_slug, Admin_Menu_Item $item, $internal = false ) {
		$this->trigger_deprecation_notice( __METHOD__, '3.34.2', $internal );

		$this->items[ $item_slug ] = $item;
	}

	/**
	 * @deprecated 3.34.2 Use Elementor\Core\Admin\EditorOneMenu\Elementor_One_Menu_Manager instead.
	 */
	public function unregister( $item_slug, $internal = false ) {
		$this->trigger_deprecation_notice( __METHOD__, '3.34.2', $internal );

		unset( $this->items[ $item_slug ] );
	}

	/**
	 * @deprecated 3.34.2 Use Elementor\Core\Admin\EditorOneMenu\Elementor_One_Menu_Manager instead.
	 */
	public function get( $item_slug, $internal = false ) {
		$this->trigger_deprecation_notice( __METHOD__, '3.34.2', $internal );

		if ( empty( $this->items[ $item_slug ] ) ) {
			return null;
		}

		return $this->items[ $item_slug ];
	}

	/**
	 * @deprecated 3.34.2 Use Elementor\Core\Admin\EditorOneMenu\Elementor_One_Menu_Manager instead.
	 */
	public function get_all( $internal = false ) {
		$this->trigger_deprecation_notice( __METHOD__, '3.34.2', $internal );

		return $this->items;
	}

	/**
	 * @deprecated 3.34.2 Use Elementor\Core\Admin\EditorOneMenu\Elementor_One_Menu_Manager instead.
	 */
	public function register_actions( $internal = false ) {
		$this->trigger_deprecation_notice( __METHOD__, '3.34.2', $internal );

		add_action( 'admin_menu', function () {
			$this->register_wp_menus();
		}, 20 );

		add_action( 'admin_head', function () {
			$this->hide_invisible_menus();
		} );
	}

	private function register_wp_menus() {
		$this->trigger_deprecated_action( 'elementor/admin/menu/register', [ $this ], '3.34.2', true );

		$hooks = [];

		foreach ( $this->get_all( true ) as $item_slug => $item ) {
			$is_top_level = empty( $item->get_parent_slug() );

			if ( $is_top_level ) {
				$hooks[ $item_slug ] = $this->register_top_level_menu( $item_slug, $item );
			} else {
				$hooks[ $item_slug ] = $this->register_sub_menu( $item_slug, $item );
			}
		}

		$this->trigger_deprecated_action( 'elementor/admin/menu/after_register', [ $this, $hooks ], '3.34.2', true );
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
		foreach ( $this->get_all( true ) as $item_slug => $item ) {
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
