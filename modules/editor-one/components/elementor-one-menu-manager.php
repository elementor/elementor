<?php

namespace Elementor\Modules\EditorOne\Components;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Modules\EditorOne\Classes\Legacy_Submenu_Interceptor;
use Elementor\Modules\EditorOne\Classes\Menu\Items\Editor_One_Custom_Elements_Menu;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Modules\EditorOne\Classes\Menu\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Slug_Normalizer;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Elementor_One_Menu_Manager {

	private Menu_Data_Provider $menu_data_provider;

	private bool $is_pro_module_enabled = false;

	private Legacy_Submenu_Interceptor $legacy_submenu_interceptor;

	public function __construct() {
		$this->menu_data_provider = Menu_Data_Provider::instance();
		$this->legacy_submenu_interceptor = new Legacy_Submenu_Interceptor(
			$this->menu_data_provider,
			new Slug_Normalizer()
		);

		$this->register_actions();
	}

	private function register_actions(): void {
		add_action( 'init', [ $this, 'check_if_pro_module_is_enabled' ] );
		add_action( 'admin_menu', [ $this, 'register_unified_submenus' ], 21 );

		add_action( 'admin_menu', function () {
			do_action( 'elementor/editor-one/menu/register', $this->menu_data_provider );
		}, 4 );

		add_action( 'admin_menu', [ $this, 'intercept_legacy_submenus' ], 999 );
		add_action( 'admin_menu', [ $this, 'register_flyout_items_as_hidden_submenus' ], 1001 );
		add_action( 'admin_menu', [ $this, 'reorder_elementor_submenu' ], 1002 );
		add_action( 'admin_menu', [ $this, 'reposition_elementor_menu' ], 1003 );
		add_filter( 'add_menu_classes', [ $this, 'fix_theme_builder_submenu_url' ] );
		add_action( 'admin_head', [ $this, 'hide_flyout_items_from_wp_menu' ] );
		add_action( 'admin_head', [ $this, 'hide_legacy_templates_menu' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_menu_assets' ] );
		add_action( 'admin_print_scripts-elementor_page_elementor-editor', [ $this, 'enqueue_home_screen_on_editor_page' ] );
	}

	public function check_if_pro_module_is_enabled(): void {
		$this->is_pro_module_enabled = apply_filters( 'elementor/modules/editor-one/is_pro_module_enabled', false );

		if ( ! $this->is_pro_module_enabled && Utils::has_pro() ) {
			$this->menu_data_provider->register_menu( new Editor_One_Custom_Elements_Menu() );
		}
	}

	public function register_unified_submenus(): void {
		add_submenu_page(
			Menu_Config::ELEMENTOR_MENU_SLUG,
			esc_html__( 'Editor', 'elementor' ),
			esc_html__( 'Editor', 'elementor' ),
			'edit_posts',
			Menu_Config::EDITOR_MENU_SLUG,
			[ $this, 'render_editor_page' ]
		);

		add_submenu_page(
			Menu_Config::ELEMENTOR_MENU_SLUG,
			esc_html__( 'Theme Builder', 'elementor' ),
			esc_html__( 'Theme Builder', 'elementor' ),
			'edit_posts',
			'elementor-theme-builder',
			''
		);

		do_action( 'elementor/editor-one/menu/register_submenus', Menu_Config::ELEMENTOR_MENU_SLUG );
	}

	public function reorder_elementor_submenu(): void {
		global $submenu;

		if ( empty( $submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] ) ) {
			return;
		}

		$desired_order = [
			Menu_Config::ELEMENTOR_MENU_SLUG,
			Menu_Config::EDITOR_MENU_SLUG,
			'elementor-theme-builder',
			'e-form-submissions',
		];

		$ordered = [];
		$remaining = [];

		foreach ( $submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] as $item ) {
			$slug = $item[2] ?? '';
			$position = array_search( $slug, $desired_order, true );

			if ( false !== $position ) {
				$ordered[ $position ] = $item;
			} else {
				$remaining[] = $item;
			}
		}

		ksort( $ordered );
		$submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] = array_merge( array_values( $ordered ), $remaining ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
	}

	public function reposition_elementor_menu(): void {
		global $menu;

		$elementor_menu_key = null;
		$elementor_menu_item = null;

		foreach ( $menu as $key => $item ) {
			if ( isset( $item[2] ) && Menu_Config::ELEMENTOR_MENU_SLUG === $item[2] ) {
				$elementor_menu_key = $key;
				$elementor_menu_item = $item;
				break;
			}
		}

		if ( null === $elementor_menu_key || null === $elementor_menu_item ) {
			return;
		}

		unset( $menu[ $elementor_menu_key ] );

		$menu['3'] = $elementor_menu_item;  // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited

		ksort( $menu );
	}

	public function render_editor_page(): void {
		Plugin::instance()->settings->display_home_screen();
	}

	public function enqueue_home_screen_on_editor_page(): void {
		$home_module = Plugin::instance()->modules_manager->get_modules( 'home' );

		if ( $home_module && method_exists( $home_module, 'enqueue_home_screen_scripts' ) ) {
			$home_module->enqueue_home_screen_scripts();
		}
	}

	public function fix_theme_builder_submenu_url( $menu ) {
		global $submenu;

		if ( empty( $submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] ) ) {
			return $menu;
		}

		foreach ( $submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] as &$item ) {
			if ( 'elementor-theme-builder' === $item[2] ) {
				$item[2] = $this->get_theme_builder_url(); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
				break;
			}
		}

		return $menu;
	}

	private function get_theme_builder_url(): string {
		return $this->menu_data_provider->get_theme_builder_url();
	}

	public function hide_legacy_templates_menu(): void {
		?>
		<style type="text/css">
			#menu-posts-elementor_library {
				display: none !important;
			}
		</style>
		<?php
	}

	public function register_flyout_items_as_hidden_submenus(): void {
		$hooks = [];

		$this->iterate_all_flyout_items( function( string $item_slug, Menu_Item_Interface $item ) use ( &$hooks ) {
			$hook = $this->register_hidden_submenu( $item_slug, $item );

			if ( $hook ) {
				$hooks[ $item_slug ] = $hook;
			}
		} );

		do_action( 'elementor/editor-one/menu/after_register_hidden_submenus', $hooks );
	}

	private function register_hidden_submenu( string $item_slug, Menu_Item_Interface $item ) {
		$original_parent = $this->get_original_parent_slug( $item );
		$parent_slug = $this->resolve_hidden_submenu_parent( $original_parent );
		$has_page = method_exists( $item, 'render' );
		$page_title = $has_page ? $item->get_page_title() : '';
		$callback = $has_page ? [ $item, 'render' ] : '';
		$capability = $item->get_capability();

		return add_submenu_page(
			$parent_slug,
			$page_title,
			$item->get_label(),
			$capability,
			$item_slug,
			$callback
		);
	}

	private function resolve_hidden_submenu_parent( ?string $parent_slug ): string {
		if ( empty( $parent_slug ) ) {
			return Menu_Config::ELEMENTOR_MENU_SLUG;
		}

		$elementor_parent_slugs = [
			Menu_Config::EDITOR_GROUP_ID => true,
			Menu_Config::EDITOR_MENU_SLUG => true,
			Menu_Config::TEMPLATES_GROUP_ID => true,
			Menu_Config::LEGACY_TEMPLATES_SLUG => true,
			Menu_Config::SETTINGS_GROUP_ID => true,
			Menu_Config::CUSTOM_ELEMENTS_GROUP_ID => true,
			Menu_Config::SYSTEM_GROUP_ID => true,
		];

		if ( isset( $elementor_parent_slugs[ $parent_slug ] ) ) {
			return Menu_Config::ELEMENTOR_MENU_SLUG;
		}

		return $parent_slug;
	}

	private function iterate_all_flyout_items( callable $callback ): void {
		$level3_items = $this->menu_data_provider->get_level3_items();
		$level4_items = $this->menu_data_provider->get_level4_items();

		$all_items = array_merge_recursive( $level3_items, $level4_items );

		foreach ( $all_items as $group_items ) {
			foreach ( $group_items as $item_slug => $item ) {
				$callback( $item_slug, $item );
			}
		}
	}

	private function get_original_parent_slug( $item ): ?string {
		return $item->get_parent_slug();
	}

	public function hide_flyout_items_from_wp_menu(): void {
		$protected_wp_menu_slugs = [
			Menu_Config::EDITOR_MENU_SLUG,
			'elementor-theme-builder',
			'e-form-submissions',
		];

		$this->iterate_all_flyout_items( function( string $item_slug, Menu_Item_Interface $item ) use ( $protected_wp_menu_slugs ) {
			if ( in_array( $item_slug, $protected_wp_menu_slugs, true ) ) {
				return;
			}

			$original_parent = $this->get_original_parent_slug( $item );
			$parent_slug = $this->resolve_hidden_submenu_parent( $original_parent );
			remove_submenu_page( $parent_slug, $item_slug );
		} );
	}

	public function intercept_legacy_submenus(): void {
		$this->legacy_submenu_interceptor->intercept_all();
	}

	public function enqueue_admin_menu_assets(): void {
		$min_suffix = Utils::is_script_debug() ? '' : '.min';

		wp_enqueue_style(
			'elementor-admin-menu',
			ELEMENTOR_ASSETS_URL . 'css/modules/editor-one/admin-menu' . $min_suffix . '.css',
			[],
			ELEMENTOR_VERSION
		);

		$config = [
			'editorFlyout' => $this->get_editor_flyout_data(),
		];

		$min_suffix = Utils::is_script_debug() ? '' : '.min';

		wp_enqueue_script(
			'editor-one-menu',
			ELEMENTOR_ASSETS_URL . 'js/editor-one-menu' . $min_suffix . '.js',
			[],
			ELEMENTOR_VERSION,
			true
		);

		wp_localize_script(
			'editor-one-menu',
			'editorOneMenuConfig',
			$config
		);
	}

	private function get_editor_flyout_data(): array {
		return $this->menu_data_provider->get_editor_flyout_data();
	}
}
