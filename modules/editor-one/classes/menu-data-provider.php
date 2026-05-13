<?php

namespace Elementor\Modules\EditorOne\Classes;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;
use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Third_Level_Interface;
use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_With_Custom_Url_Interface;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Menu_Data_Provider {
	public const THIRD_LEVEL_EDITOR_FLYOUT = 'editor_flyout';
	public const THIRD_LEVEL_FLYOUT_MENU = 'flyout_menu';

	private static ?Menu_Data_Provider $instance = null;
	private array $level3_items = [];
	private array $level4_items = [];
	private ?string $theme_builder_url = null;
	private ?array $cached_level3_sidebar_data = null;
	private ?array $cached_level4_sidebar_data = null;
	private ?array $cached_flyout_menu_data = null;
	private Slug_Normalizer $slug_normalizer;

	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	private function __construct() {
		$this->slug_normalizer = new Slug_Normalizer();
	}

	public function get_slug_normalizer(): Slug_Normalizer {
		return $this->slug_normalizer;
	}

	public function register_menu( Menu_Item_Interface $item ): void {
		if ( ! ( $item instanceof Menu_Item_Third_Level_Interface ) ) {
			$this->register_level4_item( $item );
			return;
		}

		$group_id = $item->get_group_id();
		$collapsible_groups = [
			Menu_Config::TEMPLATES_GROUP_ID,
			Menu_Config::CUSTOM_ELEMENTS_GROUP_ID,
			Menu_Config::SYSTEM_GROUP_ID,
		];

		if ( in_array( $group_id, $collapsible_groups, true ) && ! $item->has_children() ) {
			$this->register_level4_item( $item );
		} else {
			$this->register_level3_item( $item );
		}
	}

	public function register_level3_item( Menu_Item_Third_Level_Interface $item ): void {
		$group_id = $item->get_group_id();
		$item_slug = $item->get_slug();

		if ( ! isset( $this->level3_items[ $group_id ] ) ) {
			$this->level3_items[ $group_id ] = [];
		}

		$this->level3_items[ $group_id ][ $item_slug ] = $item;

		$this->invalidate_cache();
	}

	public function register_level4_item( Menu_Item_Interface $item ): void {
		$group_id = $item->get_group_id();
		$item_slug = $item->get_slug();

		if ( ! isset( $this->level4_items[ $group_id ] ) ) {
			$this->level4_items[ $group_id ] = [];
		}

		$this->level4_items[ $group_id ][ $item_slug ] = $item;
		$this->invalidate_cache();
	}

	public function get_level3_items(): array {
		return $this->level3_items;
	}

	public function get_level4_items(): array {
		return $this->level4_items;
	}

	public function is_item_already_registered( string $item_slug ): bool {
		$all_items = array_merge( $this->level3_items, $this->level4_items );

		foreach ( $all_items as $group_items ) {
			if ( isset( $group_items[ $item_slug ] ) ) {
				return true;
			}
		}

		return false;
	}

	public function get_third_level_data( string $variant ): array {
		if ( self::THIRD_LEVEL_EDITOR_FLYOUT === $variant ) {
			return $this->get_third_level_data_from_cache(
				$this->cached_level3_sidebar_data,
				[ $this, 'build_level3_flyout_items' ]
			);
		}

		if ( self::THIRD_LEVEL_FLYOUT_MENU === $variant ) {
			return $this->get_third_level_data_from_cache(
				$this->cached_flyout_menu_data,
				[ $this, 'build_flyout_items_with_expanded_third_party' ]
			);
		}

		return [];
	}

	public function get_level4_flyout_data(): array {
		if ( null !== $this->cached_level4_sidebar_data ) {
			return $this->cached_level4_sidebar_data;
		}

		$groups = $this->build_level4_flyout_groups();

		foreach ( $groups as $group_id => $group ) {
			if ( ! empty( $group['items'] ) ) {
				$this->sort_items_by_priority( $groups[ $group_id ]['items'] );
			}
		}

		$this->cached_level4_sidebar_data = $groups;

		return $this->cached_level4_sidebar_data;
	}

	private function get_third_level_data_from_cache( ?array &$cache, callable $items_builder ): array {
		if ( null !== $cache ) {
			return $cache;
		}

		$items = $items_builder();

		$this->sort_items_by_priority( $items );

		$cache = [
			'parent_slug' => Menu_Config::EDITOR_MENU_SLUG,
			'items' => $items,
		];

		return $cache;
	}

	public function get_theme_builder_url(): string {
		if ( null === $this->theme_builder_url ) {
			$pro_url = Plugin::$instance->app ? Plugin::$instance->app->get_settings( 'menu_url' ) : null;
			$return_to = esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ?? '' ) );

			if ( $pro_url ) {
				if ( false !== strpos( $pro_url, '#' ) ) {
					$url = $this->add_return_to_url( $pro_url, $return_to );
				} else {
					$url = $pro_url;
				}
			} else {
				$url = $this->add_return_to_url(
					admin_url( 'admin.php?page=elementor-app' ) . '#/site-editor/promotion',
					$return_to
				);
			}

			$this->theme_builder_url = apply_filters( 'elementor/editor-one/menu/theme_builder_url', $url );
		}

		return $this->theme_builder_url;
	}

	private function add_return_to_url( string $url, string $return_to ): string {
		$hash_position = strpos( $url, '#' );

		if ( false === $hash_position ) {
			return add_query_arg( [ 'return_to' => $return_to ], $url );
		}

		$base_url = substr( $url, 0, $hash_position );
		$hash_fragment = substr( $url, $hash_position );

		return add_query_arg( [ 'return_to' => $return_to ], $base_url ) . $hash_fragment;
	}

	public function get_all_sidebar_page_slugs(): array {
		$base_slugs = [
			Menu_Config::ELEMENTOR_MENU_SLUG,
			Menu_Config::EDITOR_MENU_SLUG,
		];

		$slugs = array_merge(
			$base_slugs,
			$this->get_dynamic_page_slugs()
		);

		return array_values( array_unique( $slugs ) );
	}

	public function is_elementor_editor_page(): bool {
		if ( ! get_current_screen() ) {
			return false;
		}

		$page = filter_input( INPUT_GET, 'page', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) ?? '';

		if ( Menu_Config::ELEMENTOR_HOME_MENU_SLUG === $page ) {
			return false;
		}

		if ( in_array( $page, $this->get_all_sidebar_page_slugs(), true ) ) {
			return true;
		}

		$post_type = filter_input( INPUT_GET, 'post_type', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) ?? '';

		return $this->is_elementor_post_type( $post_type );
	}

	public function is_editor_one_post_edit_screen(): bool {
		$screen = get_current_screen();

		if ( ! $screen || empty( $screen->post_type ) ) {
			return false;
		}

		if ( 'post' !== $screen->base ) {
			return false;
		}

		$post_types = apply_filters( 'elementor/editor-one/admin-edit-post-types', [] );

		return in_array( $screen->post_type, $post_types, true );
	}

	public function is_editor_one_admin_page(): bool {
		return $this->is_elementor_editor_page() || $this->is_editor_one_post_edit_screen();
	}

	private function is_elementor_post_type( string $post_type ): bool {
		if ( empty( $post_type ) ) {
			return false;
		}

		return isset( Menu_Config::get_elementor_post_types()[ $post_type ] );
	}

	public static function get_elementor_post_types(): array {
		return Menu_Config::get_elementor_post_types();
	}

	private function get_dynamic_page_slugs(): array {
		$slugs = [];

		foreach ( $this->level3_items as $group_items ) {
			$slugs = array_merge( $slugs, array_keys( $group_items ) );
		}

		foreach ( $this->level4_items as $group_items ) {
			foreach ( $group_items as $item_slug => $item ) {
				$slugs[] = $item_slug;
			}
		}

		$allowed_prefixes = [ 'elementor', 'e-', 'popup_templates' ];

		return array_values( array_filter( $slugs, function( string $slug ) use ( $allowed_prefixes ): bool {
			foreach ( $allowed_prefixes as $prefix ) {
				if ( 0 === strpos( $slug, $prefix ) ) {
					return true;
				}
			}

			return false;
		} ) );
	}

	private function build_level3_flyout_items(): array {
		return $this->build_flyout_items( false );
	}

	private function build_flyout_items_with_expanded_third_party(): array {
		return $this->build_flyout_items( true );
	}

	private function build_flyout_items( bool $expand_third_party ): array {
		$items = [];
		$existing_slugs = [];
		$excluded_slugs = Menu_Config::get_excluded_level3_slugs();
		$excluded_level4_slugs = $expand_third_party ? Menu_Config::get_excluded_level4_slugs() : [];

		foreach ( $this->level3_items as $group_items ) {
			foreach ( $group_items as $item_slug => $item ) {
				if ( ! $this->should_include_flyout_item( $item, $item_slug, $existing_slugs, $excluded_slugs ) ) {
					continue;
				}

				if ( $expand_third_party && $this->is_third_party_parent_with_children( $item ) ) {
					$children = $this->level4_items[ Menu_Config::THIRD_PARTY_GROUP_ID ] ?? [];
					$is_first_child = true;

					foreach ( $children as $child_slug => $child ) {
						if ( ! $this->is_item_accessible( $child ) ) {
							continue;
						}

						if ( $this->is_slug_excluded( $child_slug, $excluded_level4_slugs, true ) ) {
							continue;
						}

						if ( in_array( $child_slug, $existing_slugs, true ) ) {
							continue;
						}

						$child_data = $this->create_expanded_child_item_data( $child, $child_slug, $is_first_child );
						$items[] = $child_data;
						$existing_slugs[] = $child_slug;
						$is_first_child = false;
					}
					continue;
				}

				$items[] = $this->create_flyout_item_data( $item, $item_slug );
				$existing_slugs[] = $item_slug;
			}
		}

		return $items;
	}

	private function is_third_party_parent_with_children( Menu_Item_Interface $item ): bool {
		if ( Menu_Config::THIRD_PARTY_GROUP_ID !== $item->get_group_id() ) {
			return false;
		}

		if ( ! $item->has_children() ) {
			return false;
		}

		$children = $this->level4_items[ Menu_Config::THIRD_PARTY_GROUP_ID ] ?? [];

		return ! empty( $children );
	}

	private function create_expanded_child_item_data( Menu_Item_Interface $item, string $item_slug, bool $is_first ): array {
		$url = $this->resolve_item_url( $item, $item_slug );

		return [
			'slug' => $item_slug,
			'label' => $this->title_case( $item->get_label() ),
			'url' => $url,
			'group_id' => '',
			'priority' => $this->get_item_priority( $item ),
			'has_divider_before' => $is_first,
		];
	}

	private function should_include_flyout_item( Menu_Item_Interface $item, string $item_slug, array $existing_slugs, array $excluded_slugs ): bool {
		if ( ! $this->is_item_accessible( $item ) ) {
			return false;
		}

		if ( in_array( $item_slug, $existing_slugs, true ) ) {
			return false;
		}

		if ( $this->is_slug_excluded( $item_slug, $excluded_slugs ) ) {
			return false;
		}

		if ( empty( trim( wp_strip_all_tags( $item->get_label() ) ) ) ) {
			return false;
		}

		return true;
	}

	private function create_flyout_item_data( Menu_Item_Interface $item, string $item_slug ): array {
		$has_children = $item->has_children();
		$group_id = $has_children ? $item->get_group_id() : '';
		$is_third_party_parent = Menu_Config::THIRD_PARTY_GROUP_ID === $item->get_group_id();

		return [
			'slug' => $item_slug,
			'label' => $this->title_case( $item->get_label() ),
			'url' => $this->resolve_flyout_item_url( $item, $item_slug ),
			'icon' => $item->get_icon(),
			'group_id' => $group_id,
			'priority' => $this->get_item_priority( $item ),
			'has_divider_before' => $is_third_party_parent,
		];
	}

	private function resolve_flyout_item_url( Menu_Item_Interface $item, string $item_slug ): string {
		$url = $this->resolve_item_url( $item, $item_slug );

		if ( ! $item->has_children() ) {
			return $url;
		}

		$children = $this->get_level4_items()[ $item->get_group_id() ] ?? [];

		if ( empty( $children ) ) {
			return $url;
		}

		$first_child_url = $this->get_first_accessible_child_url( $children );

		return $first_child_url ?? $url;
	}

	private function get_first_accessible_child_url( array $children ): ?string {
		$children_data = [];

		foreach ( $children as $child_slug => $child_item ) {
			if ( ! $this->is_item_accessible( $child_item ) ) {
				continue;
			}

			$children_data[] = [
				'url' => $this->resolve_item_url( $child_item, $child_slug ),
				'priority' => $this->get_item_priority( $child_item ),
			];
		}

		if ( empty( $children_data ) ) {
			return null;
		}

		$this->sort_items_by_priority( $children_data );

		return $children_data[0]['url'];
	}

	private function build_level4_flyout_groups(): array {
		$groups = [];
		$excluded_slugs = Menu_Config::get_excluded_level4_slugs();

		foreach ( $this->level4_items as $group_id => $items ) {
			$groups[ $group_id ] = [ 'items' => [] ];
			$existing_labels = [];

			foreach ( $items as $item_slug => $item ) {
				if ( ! $this->is_item_accessible( $item ) ) {
					continue;
				}

				if ( $this->is_slug_excluded( $item_slug, $excluded_slugs, true ) ) {
					continue;
				}

				$label = $item->get_label();
				$label_lower = strtolower( $label );

				if ( in_array( $label_lower, $existing_labels, true ) ) {
					continue;
				}

				$url = $this->resolve_item_url( $item, $item_slug );

				$groups[ $group_id ]['items'][] = [
					'slug' => $item_slug,
					'label' => $this->title_case( $item->get_label() ),
					'url' => $url,
					'priority' => $this->get_item_priority( $item ),
				];

				$existing_labels[] = $label_lower;
			}
		}

		return $groups;
	}

	public function is_item_accessible( Menu_Item_Interface $item ): bool {
		return $item->is_visible() && current_user_can( $item->get_capability() );
	}

	private function get_item_url( string $item_slug, ?string $parent_slug = null ): string {
		$admin_path_prefixes = [ 'edit.php', 'post-new.php', 'admin.php' ];

		foreach ( $admin_path_prefixes as $prefix ) {
			if ( 0 === strpos( $item_slug, $prefix ) ) {
				return admin_url( $item_slug );
			}
		}

		if ( 0 === strpos( $item_slug, 'http' ) ) {
			return $item_slug;
		}

		if ( $parent_slug && 0 === strpos( $parent_slug, 'edit.php' ) ) {
			return admin_url( $parent_slug . '&page=' . $item_slug );
		}

		return admin_url( 'admin.php?page=' . $item_slug );
	}

	private function resolve_item_url( Menu_Item_Interface $item, string $item_slug ): string {
		if ( $item instanceof Menu_Item_With_Custom_Url_Interface ) {
			return $item->get_menu_url();
		}

		return $this->get_item_url( $item_slug, $item->get_parent_slug() );
	}

	private function get_item_priority( Menu_Item_Interface $item ): int {
		return $item->get_position() ?? 100;
	}

	private function is_slug_excluded( string $item_slug, array $excluded_slugs, bool $use_normalizer = false ): bool {
		if ( $use_normalizer ) {
			return $this->slug_normalizer->is_excluded( $item_slug, $excluded_slugs );
		}

		return in_array( $item_slug, $excluded_slugs, true );
	}

	private function sort_items_by_priority( array &$items ): void {
		usort( $items, function ( array $a, array $b ): int {
			return ( $a['priority'] ?? 100 ) <=> ( $b['priority'] ?? 100 );
		} );
	}

	private function title_case( string $text ): string {
		if ( function_exists( 'mb_convert_case' ) ) {
			return mb_convert_case( $text, MB_CASE_TITLE, 'UTF-8' );
		}

		return ucwords( strtolower( $text ) );
	}

	private function invalidate_cache(): void {
		$this->cached_level3_sidebar_data = null;
		$this->cached_level4_sidebar_data = null;
		$this->cached_flyout_menu_data = null;
	}

	public static function get_current_user_capabilities(): array {
		$user = wp_get_current_user();

		if ( ! $user || ! $user->exists() ) {
			return [
				'user' => null,
				'has_edit_posts' => false,
				'has_manage_options' => false,
				'is_edit_posts_user' => false,
			];
		}

		$has_edit_posts = isset( $user->allcaps[ Menu_Config::CAPABILITY_EDIT_POSTS ] ) && $user->allcaps[ Menu_Config::CAPABILITY_EDIT_POSTS ];
		$has_manage_options = isset( $user->allcaps[ Menu_Config::CAPABILITY_MANAGE_OPTIONS ] ) && $user->allcaps[ Menu_Config::CAPABILITY_MANAGE_OPTIONS ];
		$is_edit_posts_user = $has_edit_posts && ! $has_manage_options;

		return [
			'user' => $user,
			'has_edit_posts' => $has_edit_posts,
			'has_manage_options' => $has_manage_options,
			'is_edit_posts_user' => $is_edit_posts_user,
		];
	}
}
