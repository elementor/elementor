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
			return apply_filters( 'elementor/editor-one/menu/filter_level3_items', $menu_items, $user );
		}

		$has_edit_posts = isset( $user->allcaps['edit_posts'] ) && $user->allcaps['edit_posts'];
		$has_manage_options = isset( $user->allcaps['manage_options'] ) && $user->allcaps['manage_options'];

		if ( $has_manage_options || ! $has_edit_posts ) {
			return apply_filters( 'elementor/editor-one/menu/filter_level3_items', $menu_items, $user );
		}

		$templates_group_id = Menu_Config::TEMPLATES_GROUP_ID;
		$level3_items = $this->menu_data_provider->get_level3_items();
		$level4_items = $this->menu_data_provider->get_level4_items();
		$filtered = [];

		foreach ( $menu_items as $item_data ) {
			$item_slug = $item_data['slug'] ?? '';
			$item_group_id = $item_data['group_id'] ?? '';

			if ( $item_group_id !== $templates_group_id ) {
				continue;
			}

			$original_item = null;
			foreach ( $level3_items as $group_items ) {
				if ( isset( $group_items[ $item_slug ] ) ) {
					$original_item = $group_items[ $item_slug ];
					break;
				}
			}

			if ( $original_item ) {
				$is_accessible = $this->menu_data_provider->is_item_accessible( $original_item );
				
				if ( ! $is_accessible && $original_item->has_children() ) {
					$child_items = $level4_items[ $item_group_id ] ?? [];
					$has_accessible_child = false;
					
					foreach ( $child_items as $child_slug => $child_item ) {
						if ( $this->menu_data_provider->is_item_accessible( $child_item ) ) {
							$has_accessible_child = true;
							break;
						}
					}
					
					$is_accessible = $has_accessible_child;
				}
				
				if ( $is_accessible ) {
					$filtered[] = $item_data;
				}
			}
		}

		return apply_filters( 'elementor/editor-one/menu/filter_limited_user_items', $filtered, $menu_items, $user, 'level3' );
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

		$templates_group_id = Menu_Config::TEMPLATES_GROUP_ID;
		$filtered_groups = [];

		if ( isset( $level4_groups[ $templates_group_id ] ) ) {
			$group_items = $level4_groups[ $templates_group_id ]['items'] ?? [];
			$filtered_items = [];

			$level4_items = $this->menu_data_provider->get_level4_items();
			$templates_items = $level4_items[ $templates_group_id ] ?? [];

			foreach ( $group_items as $item_data ) {
				$item_slug = $item_data['slug'] ?? '';
				$original_item = $templates_items[ $item_slug ] ?? null;

				if ( $original_item && $this->menu_data_provider->is_item_accessible( $original_item ) ) {
					$filtered_items[] = $item_data;
				}
			}

			if ( ! empty( $filtered_items ) ) {
				$filtered_groups[ $templates_group_id ] = [
					'items' => $filtered_items,
				];
			}
		}

		return apply_filters( 'elementor/editor-one/menu/filter_limited_user_items', $filtered_groups, $level4_groups, $user, 'level4' );
	}
}
