<?php

namespace Elementor\Core\Admin\Menu;

use Elementor\Core\Admin\Menu\Interfaces\Editor_Elementor_One_Menu_Item;
use Elementor\Core\Admin\Menu\Interfaces\Elementor_One_Menu_Item_With_Page;
use Elementor\Core\Admin\Menu\Interfaces\Flyout_Editor_Elementor_One_Menu_Item;
use Elementor\Core\Admin\Menu\Interfaces\Root_Elementor_One_Menu_Item;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Elementor_One_Menu_Manager {

	const ROOT_MENU_SLUG = 'elementor-one';

	const EXPERIMENT_NAME = 'editor-one';

	/**
	 * @var Root_Elementor_One_Menu_Item[]
	 */
	private $root_items = [];

	/**
	 * @var Editor_Elementor_One_Menu_Item[]
	 */
	private $editor_items = [];

	/**
	 * @var Flyout_Editor_Elementor_One_Menu_Item[]
	 */
	private $flyout_items = [];

	public function register_root_item( $item_slug, Root_Elementor_One_Menu_Item $item ) {
		$this->root_items[ $item_slug ] = $item;
	}

	public function register_editor_item( $item_slug, Editor_Elementor_One_Menu_Item $item ) {
		$this->editor_items[ $item_slug ] = $item;
	}

	public function register_flyout_item( $item_slug, Flyout_Editor_Elementor_One_Menu_Item $item ) {
		$this->flyout_items[ $item_slug ] = $item;
	}

	public function unregister_root_item( $item_slug ) {
		unset( $this->root_items[ $item_slug ] );
	}

	public function unregister_editor_item( $item_slug ) {
		unset( $this->editor_items[ $item_slug ] );
	}

	public function unregister_flyout_item( $item_slug ) {
		unset( $this->flyout_items[ $item_slug ] );
	}

	public function get_root_item( $item_slug ) {
		return $this->root_items[ $item_slug ] ?? null;
	}

	public function get_editor_item( $item_slug ) {
		return $this->editor_items[ $item_slug ] ?? null;
	}

	public function get_flyout_item( $item_slug ) {
		return $this->flyout_items[ $item_slug ] ?? null;
	}

	public function get_all_root_items() {
		return $this->root_items;
	}

	public function get_all_editor_items() {
		return $this->editor_items;
	}

	public function get_all_flyout_items() {
		return $this->flyout_items;
	}

	public function is_experiment_active() {
		return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME );
	}

	public function register_actions() {
		if ( ! $this->is_experiment_active() ) {
			return;
		}

		add_action( 'admin_menu', function () {
			$this->register_wp_menus();
		}, 20 );

		add_action( 'admin_head', function () {
			$this->hide_invisible_menus();
		} );
	}

	private function register_wp_menus() {
		do_action( 'elementor-one/admin/menu/register', $this );

		$hooks = [];

		$root_menu_hook = $this->register_root_menu();
		$hooks[ self::ROOT_MENU_SLUG ] = $root_menu_hook;

		foreach ( $this->get_all_root_items() as $item_slug => $item ) {
			$hooks[ $item_slug ] = $this->register_root_submenu( $item_slug, $item );
		}

		foreach ( $this->get_all_editor_items() as $item_slug => $item ) {
			$hooks[ $item_slug ] = $this->register_editor_menu( $item_slug, $item );
		}

		foreach ( $this->get_all_flyout_items() as $item_slug => $item ) {
			$hooks[ $item_slug ] = $this->register_flyout_menu( $item_slug, $item );
		}

		do_action( 'elementor-one/admin/menu/after_register', $this, $hooks );
	}

	private function register_root_menu() {
		$first_root_item = reset( $this->root_items );
		
		if ( ! $first_root_item ) {
			$page_title = esc_html__( 'Elementor One', 'elementor' );
			$callback = '';
			$icon_url = '';
			$position = 58.5;
		} else {
			$has_page = ( $first_root_item instanceof Elementor_One_Menu_Item_With_Page );
			$page_title = $has_page ? $first_root_item->get_page_title() : esc_html__( 'Elementor One', 'elementor' );
			$callback = $has_page ? [ $first_root_item, 'render' ] : '';
			$icon_url = $first_root_item->get_icon_url();
			$position = $first_root_item->get_position();
		}

		return add_menu_page(
			$page_title,
			esc_html__( 'Elementor One', 'elementor' ),
			'manage_options',
			self::ROOT_MENU_SLUG,
			$callback,
			$icon_url,
			$position
		);
	}

	private function register_root_submenu( $item_slug, Root_Elementor_One_Menu_Item $item ) {
		$has_page = ( $item instanceof Elementor_One_Menu_Item_With_Page );

		$page_title = $has_page ? $item->get_page_title() : '';
		$callback = $has_page ? [ $item, 'render' ] : '';

		return add_submenu_page(
			self::ROOT_MENU_SLUG,
			$page_title,
			$item->get_label(),
			$item->get_capability(),
			$item_slug,
			$callback
		);
	}

	private function register_editor_menu( $item_slug, Editor_Elementor_One_Menu_Item $item ) {
		$has_page = ( $item instanceof Elementor_One_Menu_Item_With_Page );

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

	private function register_flyout_menu( $item_slug, Flyout_Editor_Elementor_One_Menu_Item $item ) {
		$has_page = ( $item instanceof Elementor_One_Menu_Item_With_Page );

		$page_title = $has_page ? $item->get_page_title() : '';
		$callback = $has_page ? [ $item, 'render' ] : '';

		$parent_slug = $item->get_parent_slug();

		return add_submenu_page(
			$parent_slug,
			$page_title,
			$item->get_label(),
			$item->get_capability(),
			$item_slug,
			$callback
		);
	}

	private function hide_invisible_menus() {
		foreach ( $this->get_all_root_items() as $item_slug => $item ) {
			if ( ! $item->is_visible() ) {
				remove_submenu_page( self::ROOT_MENU_SLUG, $item_slug );
			}
		}

		foreach ( $this->get_all_editor_items() as $item_slug => $item ) {
			if ( ! $item->is_visible() ) {
				remove_submenu_page( $item->get_parent_slug(), $item_slug );
			}
		}

		foreach ( $this->get_all_flyout_items() as $item_slug => $item ) {
			if ( ! $item->is_visible() ) {
				remove_submenu_page( $item->get_parent_slug(), $item_slug );
			}
		}
	}
}

