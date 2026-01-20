<?php

namespace Elementor\Core\Admin\EditorOneMenu;

use Elementor\Core\Admin\EditorOneMenu\Menu\Editor_One_Custom_Elements_Menu;
use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Legacy_Submenu_Interceptor;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
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
		add_action( 'admin_menu', [ $this, 'register_elementor_home_submenus' ], 9 );

		add_action( 'admin_menu', function () {
			do_action( 'elementor/editor-one/menu/register', $this->menu_data_provider );
		} );

		add_action( 'admin_menu', [ $this, 'register_pro_submenus' ], 100 );

		add_action( 'admin_menu', [ $this, 'intercept_legacy_submenus' ], 10003 );
		add_action( 'admin_menu', [ $this, 'register_flyout_items_as_hidden_submenus' ], 10004 );
		add_action( 'admin_menu', [ $this, 'remove_all_submenus_for_edit_posts_users' ], 10005 );
		add_action( 'admin_menu', [ $this, 'override_elementor_page_for_edit_posts_users' ], 1006 );
		add_filter( 'add_menu_classes', [ $this, 'fix_theme_builder_submenu_url' ] );
		add_action( 'admin_head', [ $this, 'hide_flyout_items_from_wp_menu' ] );
		add_action( 'admin_head', [ $this, 'hide_legacy_templates_menu' ] );
		add_action( 'admin_head', [ $this, 'hide_old_elementor_menu' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_menu_assets' ] );
		add_action( 'admin_print_scripts-elementor_page_elementor-editor', [ $this, 'enqueue_home_screen_on_editor_page' ] );
	}

	public function check_if_pro_module_is_enabled(): void {
		$this->is_pro_module_enabled = apply_filters( 'elementor/modules/editor-one/is_pro_module_enabled', false );

		if ( ! $this->is_pro_module_enabled && Utils::has_pro() ) {
			$this->menu_data_provider->register_menu( new Editor_One_Custom_Elements_Menu() );
		}
	}

	public function register_elementor_home_submenus(): void {
		add_submenu_page(
			Menu_Config::ELEMENTOR_HOME_MENU_SLUG,
			esc_html__( 'Editor', 'elementor' ),
			esc_html__( 'Editor', 'elementor' ),
			Menu_Config::CAPABILITY_EDIT_POSTS,
			Menu_Config::ELEMENTOR_MENU_SLUG,
			[ $this, 'render_editor_page' ],
			20
		);

		do_action( 'elementor/editor-one/menu/register_submenus' );
	}

	public function register_pro_submenus(): void {
		if ( ! $this->is_pro_module_enabled &&
			Utils::has_pro() &&
			class_exists( '\ElementorPro\License\API' ) &&
			\ElementorPro\License\API::is_license_active()
		) {
			add_submenu_page(
				Menu_Config::ELEMENTOR_HOME_MENU_SLUG,
				esc_html__( 'Theme Builder', 'elementor' ),
				esc_html__( 'Theme Builder', 'elementor' ),
				Menu_Config::CAPABILITY_EDIT_POSTS,
				'elementor-theme-builder',
				'',
				70
			);

			add_submenu_page(
				Menu_Config::ELEMENTOR_HOME_MENU_SLUG,
				esc_html__( 'Submissions', 'elementor' ),
				esc_html__( 'Submissions', 'elementor' ),
				'edit_posts',
				'e-form-submissions',
				'',
				80
			);
		}
	}

	public function remove_all_submenus_for_edit_posts_users(): void {
		$user_capabilities = Menu_Data_Provider::get_current_user_capabilities();

		if ( ! $user_capabilities['is_edit_posts_user'] ) {
			return;
		}

		global $submenu;

		if ( empty( $submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] ) ) {
			return;
		}

		$submenu_items = $submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ];

		foreach ( $submenu_items as $index => $submenu_item ) {
			if ( 0 === $index ) {
				continue;
			}

			$submenu_slug = $submenu_item[2] ?? '';
			if ( ! empty( $submenu_slug ) ) {
				remove_submenu_page( Menu_Config::ELEMENTOR_MENU_SLUG, $submenu_slug );
			}
		}
	}

	public function render_editor_page(): void {
		Plugin::instance()->settings->display_home_screen();
	}

	public function override_elementor_page_for_edit_posts_users(): void {
		$user_capabilities = Menu_Data_Provider::get_current_user_capabilities();

		if ( ! $user_capabilities['is_edit_posts_user'] ) {
			return;
		}

		$page = filter_input( INPUT_GET, 'page', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) ?? '';
		if ( Menu_Config::ELEMENTOR_MENU_SLUG !== $page ) {
			return;
		}

		$templates_url = admin_url( 'edit.php?post_type=elementor_library&tabs_group=library' );
		wp_safe_redirect( $templates_url );
		exit;
	}

	public function enqueue_home_screen_on_editor_page(): void {
		$home_module = Plugin::instance()->modules_manager->get_modules( 'home' );

		if ( $home_module && method_exists( $home_module, 'enqueue_home_screen_scripts' ) ) {
			$home_module->enqueue_home_screen_scripts();
		}
	}

	public function fix_theme_builder_submenu_url( $menu ) {
		global $submenu;

		$menu_slugs = [ Menu_Config::ELEMENTOR_HOME_MENU_SLUG ];

		foreach ( $menu_slugs as $menu_slug ) {
			if ( empty( $submenu[ $menu_slug ] ) ) {
				continue;
			}

			foreach ( $submenu[ $menu_slug ] as &$item ) {
				if ( 'elementor-theme-builder' === $item[2] ) {
					$item[2] = $this->get_theme_builder_url(); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
					break;
				}
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

	public function hide_old_elementor_menu(): void {
		?>
		<style type="text/css">
			#toplevel_page_elementor {
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
		$position = $item->get_position();

		return add_submenu_page(
			$parent_slug,
			$page_title,
			$item->get_label(),
			$capability,
			$item_slug,
			$callback,
			$position
		);
	}

	private function resolve_hidden_submenu_parent( ?string $parent_slug ): string {
		$default_parent_slug = Menu_Config::ELEMENTOR_HOME_MENU_SLUG;
		if ( empty( $parent_slug ) ) {
			return $default_parent_slug;
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
			return $default_parent_slug;
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
		$this->legacy_submenu_interceptor->intercept_all( $this->is_pro_module_enabled );
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
			'editorFlyout' => $this->menu_data_provider->get_third_level_data(
				Menu_Data_Provider::THIRD_LEVEL_FLYOUT_MENU
			),
		];

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
}

