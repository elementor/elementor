<?php

namespace Elementor\Modules\EditorOne\Components;

use Elementor\Modules\EditorOne\Classes\Admin_Flow_Config;
use Elementor\Modules\EditorOne\Classes\Admin_Flow_Map;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Admin_Menu_Structure {

	const DIVIDER_CLASS = 'elementor-submenu-divider';

	const PAGES_MENU_SLUG = 'edit.php?post_type=page';

	const UPGRADE_SLUGS = [
		'elementor-one-upgrade',
		'go_elementor_pro',
	];

	public function __construct() {
		add_action( 'admin_menu', [ $this, 'register_parent_aliases' ], 10008 );
		add_action( 'admin_menu', [ $this, 'place_elementor_below_pages' ], 10020 );
		add_action( 'admin_head', [ $this, 'rebuild_submenu' ], 20 );
	}

	public function register_parent_aliases(): void {
		if ( ! $this->should_apply() ) {
			return;
		}

		$parents = $this->get_available_parents();

		foreach ( $parents as $slug => $parent ) {
			if ( $this->slug_exists( $slug ) ) {
				continue;
			}

			add_submenu_page(
				Menu_Config::ELEMENTOR_HOME_MENU_SLUG,
				$parent['label'] ?? $slug,
				$parent['label'] ?? $slug,
				Menu_Config::CAPABILITY_MANAGE_OPTIONS,
				$slug,
				'__return_empty_string'
			);
		}
	}

	public function place_elementor_below_pages(): void {
		if ( ! $this->should_apply() ) {
			return;
		}

		global $menu;

		$menu = $this->move_below_pages( (array) $menu, Menu_Config::ELEMENTOR_HOME_MENU_SLUG, self::PAGES_MENU_SLUG ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
	}

	public function rebuild_submenu(): void {
		if ( ! $this->should_apply() ) {
			return;
		}

		global $submenu;

		$parent_slug = Menu_Config::ELEMENTOR_HOME_MENU_SLUG;
		$existing_items = $submenu[ $parent_slug ] ?? [];
		$upgrade_item = $this->extract_upgrade_item( $existing_items );

		$submenu[ $parent_slug ] = $this->build_submenu( // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
			$this->get_available_parents(),
			$existing_items,
			$upgrade_item
		);
	}

	public function move_below_pages( array $menu, string $item_slug, string $pages_slug ): array {
		$item_key = $this->find_menu_key( $menu, $item_slug );
		$pages_key = $this->find_menu_key( $menu, $pages_slug );

		if ( null === $item_key || null === $pages_key ) {
			return $menu;
		}

		$item = $menu[ $item_key ];
		unset( $menu[ $item_key ] );

		$menu[ $this->next_position( $menu, $pages_key ) ] = $item;

		return $menu;
	}

	public function build_submenu( array $parents, array $existing_items, ?array $upgrade_item ): array {
		$items = [];
		$previous_group = null;
		$last_slug = '';

		foreach ( $parents as $slug => $parent ) {
			$section = $this->get_menu_section( $parent );

			if ( $this->should_separate_sections( $previous_group, $section, $last_slug ) ) {
				$items[] = $this->create_divider( $slug );
			}

			$items[] = $this->create_parent_item( $slug, $parent, $existing_items );
			$previous_group = $section;
			$last_slug = $slug;
		}

		if ( empty( $upgrade_item ) ) {
			return $items;
		}

		if ( Admin_Flow_Config::PARENT_ACCOUNT !== $last_slug && $this->should_separate_sections( $previous_group, 'upgrade', $last_slug ) ) {
			$items[] = $this->create_divider( 'upgrade' );
		}

		$items[] = $upgrade_item;

		return $items;
	}

	private function should_apply(): bool {
		return current_user_can( Menu_Config::CAPABILITY_MANAGE_OPTIONS );
	}

	private function get_available_parents(): array {
		$config = Admin_Flow_Config::get_config();
		$map = new Admin_Flow_Map( Menu_Data_Provider::instance(), $config );
		$parents = [];

		foreach ( $config['parents'] as $slug => $parent ) {
			if ( $this->is_parent_available( $slug, $parent, $map ) ) {
				$parents[ $slug ] = $parent;
			}
		}

		return $parents;
	}

	private function is_parent_available( string $slug, array $parent_config, Admin_Flow_Map $map ): bool {
		if ( empty( $parent_config['group'] ) ) {
			return true;
		}

		if ( '' !== $map->get_default_url( $slug ) ) {
			return true;
		}

		return Admin_Flow_Config::PARENT_SUBMISSIONS === $slug && $this->slug_exists( $slug );
	}

	private function should_separate_sections( ?string $previous_section, string $section, string $previous_slug ): bool {
		if ( null === $previous_section || $section === $previous_section ) {
			return false;
		}

		return Admin_Flow_Config::PARENT_HOME !== $previous_slug;
	}

	private function get_menu_section( array $parent_config ): string {
		if ( isset( $parent_config['menu_section'] ) ) {
			return $parent_config['menu_section'];
		}

		return $parent_config['group'] ?? '';
	}

	private function create_parent_item( string $slug, array $parent_config, array $existing_items ): array {
		$label = $parent_config['label'] ?? $slug;
		$existing = $this->find_existing_item( $existing_items, $slug );

		if ( null !== $existing ) {
			$existing[0] = $label;
			$existing[2] = $slug;

			return $existing;
		}

		return [ $label, Menu_Config::CAPABILITY_MANAGE_OPTIONS, $slug, $label ];
	}

	private function find_existing_item( array $existing_items, string $slug ): ?array {
		$home_alias = null;

		foreach ( $existing_items as $item ) {
			$item_slug = $item[2] ?? '';

			if ( $item_slug === $slug ) {
				return $item;
			}

			if ( Admin_Flow_Config::PARENT_HOME === $slug && false !== strpos( $item_slug, 'page=' . $slug ) ) {
				$home_alias = $item;
			}
		}

		return $home_alias;
	}

	private function create_divider( string $key ): array {
		return [
			'',
			Menu_Config::CAPABILITY_MANAGE_OPTIONS,
			'elementor-submenu-divider-' . $key,
			'',
			self::DIVIDER_CLASS,
		];
	}

	private function extract_upgrade_item( array $existing_items ): ?array {
		foreach ( self::UPGRADE_SLUGS as $upgrade_slug ) {
			foreach ( $existing_items as $item ) {
				if ( ( $item[2] ?? '' ) === $upgrade_slug ) {
					return $item;
				}
			}
		}

		return null;
	}

	private function slug_exists( string $slug ): bool {
		global $submenu;

		foreach ( (array) $submenu as $items ) {
			foreach ( (array) $items as $item ) {
				if ( ( $item[2] ?? '' ) === $slug ) {
					return true;
				}
			}
		}

		return Menu_Config::ELEMENTOR_HOME_MENU_SLUG === $slug;
	}

	private function find_menu_key( array $menu, string $slug ) {
		foreach ( $menu as $key => $item ) {
			if ( ( $item[2] ?? '' ) === $slug ) {
				return $key;
			}
		}

		return null;
	}

	private function next_position( array $menu, $after_key ): string {
		$position = (float) $after_key + 1;

		while ( $this->is_position_taken( $menu, $position ) ) {
			++$position;
		}

		return (string) $position;
	}

	private function is_position_taken( array $menu, float $position ): bool {
		if ( isset( $menu[ (string) $position ] ) ) {
			return true;
		}

		return floor( $position ) === $position && isset( $menu[ (int) $position ] );
	}
}
