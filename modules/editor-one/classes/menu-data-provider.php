<?php

namespace Elementor\Modules\EditorOne\Classes;

use Elementor\Plugin;

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

	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	private function __construct() {}

	public function register_level3_item( string $item_slug, $item, string $group_id = Menu_Config::EDITOR_GROUP_ID ): void {
		if ( ! isset( $this->level3_items[ $group_id ] ) ) {
			$this->level3_items[ $group_id ] = [];
		}

		$this->level3_items[ $group_id ][ $item_slug ] = $item;
		$this->invalidate_cache();
	}

	public function register_level4_item( string $item_slug, $item, string $group_id ): void {
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

		$items = Menu_Config::get_editor_flyout_items();
		$items = apply_filters( 'elementor/admin_menu/editor_flyout_items', $items );

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

		$groups = Menu_Config::get_level4_flyout_groups( $this->get_theme_builder_url() );
		$groups = $this->merge_level4_legacy_items( $groups );
		$groups = apply_filters( 'elementor/admin_menu/level4_flyout_groups', $groups );

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

			$this->theme_builder_url = apply_filters( 'elementor/admin_menu/theme_builder_url', $default_url );
		}

		return $this->theme_builder_url;
	}

	public function get_all_sidebar_page_slugs(): array {
		$static_pages = [
			'elementor',
			'elementor-editor',
			'elementor-settings',
			'elementor-tools',
			'elementor-role-manager',
			'elementor-system-info',
			'elementor-element-manager',
			'elementor_custom_fonts',
			'elementor_custom_icons',
			'elementor_custom_code',
			'e-form-submissions',
		];

		$dynamic_pages = $this->get_dynamic_page_slugs();

		return array_unique( array_merge( $static_pages, $dynamic_pages ) );
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

		return isset( self::get_elementor_post_types()[ $post_type ] );
	}

	public static function get_elementor_post_types(): array {
		return [
			'elementor_library' => true,
			'elementor_icons' => [
				'menu_slug' => 'elementor-custom-elements',
				'child_slug' => 'custom-icons',
			],
			'elementor_font' => [
				'menu_slug' => 'elementor-custom-elements',
				'child_slug' => 'custom-fonts',
			],
			'elementor_snippet' => [
				'menu_slug' => 'elementor-custom-elements',
				'child_slug' => 'custom-code',
			],
		];
	}
	private function get_dynamic_page_slugs(): array {
		$slugs = [];

		foreach ( $this->level4_items as $group_items ) {
			foreach ( $group_items as $item_slug => $item ) {
				if ( 0 === strpos( $item_slug, 'elementor' ) || 0 === strpos( $item_slug, 'e-' ) ) {
					$slugs[] = $item_slug;
				}
			}
		}

		return $slugs;
	}

	private function merge_level4_legacy_items( array $groups ): array {
		$excluded_level4_slugs = Menu_Config::get_excluded_level4_slugs();

		foreach ( $this->level4_items as $group_id => $items ) {
			if ( ! isset( $groups[ $group_id ] ) ) {
				$groups[ $group_id ] = [ 'items' => [] ];
			}

			$existing_labels = array_map( function( $item ) {
				return strtolower( $item['label'] );
			}, $groups[ $group_id ]['items'] );

			foreach ( $items as $item_slug => $item ) {
				if ( ! $item->is_visible() ) {
					continue;
				}

				if ( ! current_user_can( $item->get_capability() ) ) {
					continue;
				}

				if ( $this->is_slug_excluded( $item_slug, $excluded_level4_slugs ) ) {
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
					'url' => $this->get_item_url( $item_slug ),
					'priority' => 100,
				];

				$existing_labels[] = $label_lower;
			}
		}

		return $groups;
	}

	private function is_slug_excluded( string $item_slug, array $excluded_slugs ): bool {
		if ( in_array( $item_slug, $excluded_slugs, true ) ) {
			return true;
		}

		$normalized_slug = $this->normalize_slug( $item_slug );

		return in_array( $normalized_slug, $excluded_slugs, true );
	}

	private function normalize_slug( string $slug ): string {
		if ( 0 !== strpos( $slug, 'http' ) ) {
			return $slug;
		}

		$parsed = wp_parse_url( $slug );
		$path = basename( $parsed['path'] ?? '' );

		if ( ! empty( $parsed['query'] ) ) {
			$path .= '?' . $parsed['query'];
		}

		if ( ! empty( $parsed['fragment'] ) ) {
			$path .= '#' . $parsed['fragment'];
		}

		return $path;
	}

	private function get_item_url( string $item_slug ): string {
		$admin_path_prefixes = [ 'edit.php', 'post-new.php', 'admin.php' ];

		foreach ( $admin_path_prefixes as $prefix ) {
			if ( 0 === strpos( $item_slug, $prefix ) ) {
				return admin_url( $item_slug );
			}
		}

		if ( 0 === strpos( $item_slug, 'http' ) ) {
			return $item_slug;
		}

		return admin_url( 'admin.php?page=' . $item_slug );
	}

	private function sort_items_by_priority( array &$items ): void {
		usort( $items, function( $a, $b ) {
			return ( $a['priority'] ?? 100 ) - ( $b['priority'] ?? 100 );
		} );
	}

	private function invalidate_cache(): void {
		$this->cached_editor_flyout_data = null;
		$this->cached_level4_flyout_data = null;
	}
}
