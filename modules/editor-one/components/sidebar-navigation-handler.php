<?php

namespace Elementor\Modules\EditorOne\Components;

use Elementor\Core\Utils\Promotions\Filtered_Promotions_Manager;
use Elementor\Modules\EditorOne\Classes\Active_Menu_Resolver;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Modules\EditorOne\Classes\Url_Matcher;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Sidebar_Navigation_Handler {

	private const PROMOTION_URL = 'https://go.elementor.com/go-pro-upgrade-wp-editor-inner-menu/';

	private Menu_Data_Provider $menu_data_provider;

	private Active_Menu_Resolver $active_menu_resolver;

	public function __construct() {
		$this->menu_data_provider = Menu_Data_Provider::instance();
		$this->active_menu_resolver = new Active_Menu_Resolver( new Url_Matcher() );
		$this->register_actions();
	}

	private function register_actions(): void {
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_sidebar_assets' ] );
		add_action( 'in_admin_header', [ $this, 'render_sidebar_container' ] );
		add_filter( 'admin_body_class', [ $this, 'add_body_class' ] );
	}

	public function add_body_class( string $classes ): string {
		if ( ! $this->menu_data_provider->is_elementor_editor_page() ) {
			return $classes;
		}

		return $classes . ' e-has-sidebar-navigation';
	}

	public function enqueue_sidebar_assets(): void {
		if ( ! $this->menu_data_provider->is_elementor_editor_page() ) {
			return;
		}

		$min_suffix = Utils::is_script_debug() ? '' : '.min';

		wp_enqueue_style(
			'elementor-sidebar-navigation',
			ELEMENTOR_ASSETS_URL . 'css/modules/editor-one/sidebar-navigation' . $min_suffix . '.css',
			[],
			ELEMENTOR_VERSION
		);

		wp_enqueue_script(
			'editor-one-sidebar-navigation',
			ELEMENTOR_ASSETS_URL . 'js/editor-one-sidebar-navigation' . $min_suffix . '.js',
			[
				'react',
				'react-dom',
				'elementor-common',
				'elementor-v2-ui',
				'elementor-v2-icons',
			],
			ELEMENTOR_VERSION,
			true
		);

		wp_localize_script(
			'editor-one-sidebar-navigation',
			'editorOneSidebarConfig',
			$this->get_sidebar_config()
		);

		wp_set_script_translations( 'editor-one-sidebar-navigation', 'elementor' );
	}

	public function render_sidebar_container(): void {
		if ( ! $this->menu_data_provider->is_elementor_editor_page() ) {
			return;
		}

		echo '<div id="editor-one-sidebar-navigation"></div>';
	}

	private function get_sidebar_config(): array {
		$flyout_data = $this->menu_data_provider->get_editor_flyout_data();
		$level4_groups = $this->menu_data_provider->get_level4_flyout_data();
		$promotion = $this->get_promotion_data();
		
		$filtered_items = $this->filter_menu_items_for_limited_users( $flyout_data['items'] );
		$filtered_level4_groups = $this->filter_level4_groups_for_limited_users( $level4_groups );
		
		$active_state = $this->get_active_menu_state( $filtered_items, $filtered_level4_groups );

		return [
			'menuItems' => $filtered_items,
			'level4Groups' => $filtered_level4_groups,
			'activeMenuSlug' => $active_state['menu_slug'],
			'activeChildSlug' => $active_state['child_slug'],
			'isRTL' => is_rtl(),
			'siteTitle' => esc_html__( 'Editor', 'elementor' ),
			'hasPro' => Utils::has_pro(),
			'upgradeUrl' => $promotion['url'],
			'upgradeText' => $promotion['text'],
		];
	}

	private function get_promotion_data(): array {
		return Filtered_Promotions_Manager::get_filtered_promotion_data(
			[
				'text' => esc_html__( 'Upgrade plan', 'elementor' ),
				'url' => self::PROMOTION_URL,
			],
			'elementor/sidebar/promotion',
			'url'
		);
	}

	private function get_active_menu_state( array $menu_items, array $level4_groups ): array {
		$current_page = filter_input( INPUT_GET, 'page', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) ?? '';
		$current_uri = esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ?? '' ) );

		return $this->active_menu_resolver->resolve( $menu_items, $level4_groups, $current_page, $current_uri );
	}

	private function filter_menu_items_for_limited_users( array $menu_items ): array {
		$user = wp_get_current_user();
		if ( ! $user || ! $user->exists() ) {
			return $menu_items;
		}

		$has_edit_posts = isset( $user->allcaps['edit_posts'] ) && $user->allcaps['edit_posts'];
		$has_manage_options = isset( $user->allcaps['manage_options'] ) && $user->allcaps['manage_options'];

		if ( $has_manage_options || ! $has_edit_posts ) {
			return $menu_items;
		}

		$templates_group_id = Menu_Config::TEMPLATES_GROUP_ID;
		$filtered = array_filter( $menu_items, function( $item ) use ( $templates_group_id ) {
			return isset( $item['group_id'] ) && $item['group_id'] === $templates_group_id;
		} );

		return array_values( $filtered );
	}

	private function filter_level4_groups_for_limited_users( array $level4_groups ): array {
		$user = wp_get_current_user();
		if ( ! $user || ! $user->exists() ) {
			return $level4_groups;
		}

		$has_edit_posts = isset( $user->allcaps['edit_posts'] ) && $user->allcaps['edit_posts'];
		$has_manage_options = isset( $user->allcaps['manage_options'] ) && $user->allcaps['manage_options'];

		if ( $has_manage_options || ! $has_edit_posts ) {
			return $level4_groups;
		}

		$templates_group_id = 'elementor-editor-templates';
		$filtered_groups = [];

		if ( isset( $level4_groups[ $templates_group_id ] ) ) {
			$filtered_groups[ $templates_group_id ] = $level4_groups[ $templates_group_id ];
		}

		return $filtered_groups;
	}
}
