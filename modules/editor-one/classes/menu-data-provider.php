<?php

namespace Elementor\Modules\EditorOne\Classes;

use Elementor\Plugin;
use Elementor\Modules\EditorOne\Classes\Menu\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Menu\Menu_Item_Third_Level_Interface;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Menu_Data_Provider {

	private static ?Menu_Data_Provider $instance = null;

	private array $level3_items = [];
	private array $level4_items = [];
	private ?string $theme_builder_url = null;
	private ?array $cached_editor_flyout_data = null;
	private ?array $cached_level4_flyout_data = null;
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
		if ( $item instanceof Menu_Item_Third_Level_Interface ) {
			$this->register_level3_item( $item );
		} else {
			$this->register_level4_item( $item );
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

	public function get_editor_flyout_data(): array {
		if ( null !== $this->cached_editor_flyout_data ) {
			return $this->cached_editor_flyout_data;
		}

		$items = $this->build_level3_flyout_items();

		$this->sort_items_by_priority( $items );

		$this->cached_editor_flyout_data = [
			'parent_slug' => Menu_Config::EDITOR_MENU_SLUG,
			'items' => $items,
		];

		return $this->cached_editor_flyout_data;
	}

	public function get_level4_flyout_data(): array {
		if ( null !== $this->cached_level4_flyout_data ) {
			return $this->cached_level4_flyout_data;
		}

		$groups = $this->build_level4_flyout_groups();

		foreach ( $groups as $group_id => $group ) {
			if ( ! empty( $group['items'] ) ) {
				$this->sort_items_by_priority( $groups[ $group_id ]['items'] );
			}
		}

		$this->cached_level4_flyout_data = $groups;

		return $this->cached_level4_flyout_data;
	}

	public function get_theme_builder_url(): string {
		if ( null === $this->theme_builder_url ) {
			$pro_url = Plugin::$instance->app ? Plugin::$instance->app->get_settings( 'menu_url' ) : null;
			$default_url = $pro_url ? $pro_url : admin_url( 'admin.php?page=elementor-app#site-editor/promotion' );

			$this->theme_builder_url = apply_filters( 'elementor/editor-one/menu/theme_builder_url', $default_url );
		}

		return $this->theme_builder_url;
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

		if ( in_array( $page, $this->get_all_sidebar_page_slugs(), true ) ) {
			return true;
		}

		$post_type = filter_input( INPUT_GET, 'post_type', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) ?? '';

		return $this->is_elementor_post_type( $post_type );
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
		$items = [];
		$existing_slugs = [];
		$excluded_slugs = Menu_Config::get_excluded_level3_slugs();

		foreach ( $this->level3_items as $group_items ) {
			foreach ( $group_items as $item_slug => $item ) {
				if ( ! $this->should_include_flyout_item( $item, $item_slug, $existing_slugs, $excluded_slugs ) ) {
					continue;
				}

				$items[] = $this->create_flyout_item_data( $item, $item_slug );
				$existing_slugs[] = $item_slug;
			}
		}

		return $items;
	}

	private function should_include_flyout_item( Menu_Item_Interface $item, string $item_slug, array $existing_slugs, array $excluded_slugs ): bool {
		if ( ! $this->is_item_accessible( $item ) ) {
			return false;
		}

		if ( in_array( $item_slug, $existing_slugs, true ) ) {
			return false;
		}

		if ( in_array( $item_slug, $excluded_slugs, true ) ) {
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

		return [
			'slug' => $item_slug,
			'label' => $item->get_label(),
			'url' => $this->resolve_flyout_item_url( $item, $item_slug ),
			'icon' => $item->get_icon(),
			'group_id' => $group_id,
			'priority' => $item->get_position() ?? 100,
		];
	}

	private function resolve_flyout_item_url( Menu_Item_Interface $item, string $item_slug ): string {
		$url = $this->get_item_url( $item_slug, $item->get_parent_slug() );

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
				'url' => $this->get_item_url( $child_slug, $child_item->get_parent_slug() ),
				'priority' => $child_item->get_position() ?? 100,
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

				if ( $this->slug_normalizer->is_excluded( $item_slug, $excluded_slugs ) ) {
					continue;
				}

				$label = $item->get_label();
				$label_lower = strtolower( $label );

				if ( in_array( $label_lower, $existing_labels, true ) ) {
					continue;
				}

				$groups[ $group_id ]['items'][] = [
					'slug' => $item_slug,
					'label' => $label,
					'url' => $this->get_item_url( $item_slug, $item->get_parent_slug() ),
					'priority' => $item->get_position() ?? 100,
				];

				$existing_labels[] = $label_lower;
			}
		}

		return $groups;
	}

	private function is_item_accessible( Menu_Item_Interface $item ): bool {
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

	private function sort_items_by_priority( array &$items ): void {
		usort( $items, function ( array $a, array $b ): int {
			return ( $a['priority'] ?? 100 ) <=> ( $b['priority'] ?? 100 );
		} );
	}

	private function invalidate_cache(): void {
		$this->cached_editor_flyout_data = null;
		$this->cached_level4_flyout_data = null;
	}
}
