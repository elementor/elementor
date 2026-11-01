<?php

namespace Elementor\Modules\EditorOne\Components;

use Elementor\Modules\EditorOne\Classes\Admin_Flow_Config;
use Elementor\Modules\EditorOne\Classes\Menu_Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Admin_Menu_Structure {

	const DIVIDER_CLASS = 'elementor-submenu-has-divider';

	const PAGES_MENU_SLUG = 'edit.php?post_type=page';

	const UPGRADE_SLUGS = [
		'elementor-one-upgrade',
		'go_elementor_pro',
	];

	private Admin_Flow_Handler $admin_flow_handler;

	public function __construct( Admin_Flow_Handler $admin_flow_handler ) {
		$this->admin_flow_handler = $admin_flow_handler;

		add_action( 'admin_menu', [ $this, 'register_parent_aliases' ], 10008 );
		add_action( 'admin_menu', [ $this, 'place_elementor_below_pages' ], 10020 );
		add_action( 'admin_head', [ $this, 'rebuild_submenu' ], 20 );
	}

	public function register_parent_aliases(): void {
		if ( ! $this->should_apply() ) {
			return;
		}

		foreach ( $this->get_available_parents() as $slug => $parent ) {
			if ( $this->has_home_page( $slug ) ) {
				continue;
			}

			$label = $this->get_label( $slug, $parent );

			add_submenu_page( Menu_Config::ELEMENTOR_HOME_MENU_SLUG, $label, $label, Menu_Config::CAPABILITY_MANAGE_OPTIONS, $slug, '__return_empty_string' );
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

		$existing_items = $submenu[ Menu_Config::ELEMENTOR_HOME_MENU_SLUG ] ?? [];

		$submenu[ Menu_Config::ELEMENTOR_HOME_MENU_SLUG ] = $this->build_submenu( // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
			$this->get_available_parents(),
			$existing_items,
			$this->extract_upgrade_item( $existing_items )
		);
	}

	public function move_below_pages( array $menu, string $item_slug, string $pages_slug ): array {
		$slugs = array_map( fn( $item ) => $item[2] ?? '', $menu );
		$item_key = array_search( $item_slug, $slugs, true );
		$pages_key = array_search( $pages_slug, $slugs, true );

		if ( false === $item_key || false === $pages_key ) {
			return $menu;
		}

		$item = $menu[ $item_key ];
		unset( $menu[ $item_key ] );
		$position = (float) $pages_key + 1;

		while ( isset( $menu[ (string) $position ] ) ) {
			++$position;
		}

		$menu[ (string) $position ] = $item;

		return $menu;
	}

	public function build_submenu( array $parents, array $existing_items, ?array $upgrade_item ): array {
		$items = [];
		$previous_section = null;
		$last_slug = '';

		foreach ( $parents as $slug => $parent ) {
			$section = $parent['menu_section'] ?? $parent['group'] ?? '';
			$item = $this->create_parent_item( $slug, $parent, $existing_items );

			$items[] = $this->should_separate_sections( $previous_section, $section, $last_slug ) ? $this->add_divider_before( $item ) : $item;
			$previous_section = $section;
			$last_slug = $slug;
		}

		if ( empty( $upgrade_item ) ) {
			return $items;
		}

		$items[] = Admin_Flow_Config::PARENT_ACCOUNT !== $last_slug && $this->should_separate_sections( $previous_section, 'upgrade', $last_slug )
			? $this->add_divider_before( $upgrade_item )
			: $upgrade_item;

		return $items;
	}

	/**
	 * WordPress links a submenu item to `admin.php?page=` only when it has a page hook under its parent,
	 * otherwise the raw slug becomes the `href`.
	 */
	public function has_home_page( string $slug ): bool {
		if ( Menu_Config::ELEMENTOR_HOME_MENU_SLUG === $slug ) {
			return true;
		}

		return $this->is_under_home( $slug ) && null !== get_plugin_page_hook( $slug, Menu_Config::ELEMENTOR_HOME_MENU_SLUG );
	}

	private function should_apply(): bool {
		return current_user_can( Menu_Config::CAPABILITY_MANAGE_OPTIONS );
	}

	private function get_available_parents(): array {
		$map = $this->admin_flow_handler->get_map();

		return array_filter(
			Admin_Flow_Config::get_config()['parents'],
			fn( $parent_config, $slug ) => empty( $parent_config['group'] )
				|| '' !== $map->get_default_url( $slug )
				|| ( Admin_Flow_Config::PARENT_SUBMISSIONS === $slug && $this->is_under_home( $slug ) ),
			ARRAY_FILTER_USE_BOTH
		);
	}

	private function should_separate_sections( ?string $previous_section, string $section, string $previous_slug ): bool {
		return null !== $previous_section && $section !== $previous_section && Admin_Flow_Config::PARENT_HOME !== $previous_slug;
	}

	private function get_label( string $slug, array $parent_config ): string {
		return $parent_config['label'] ?? $slug;
	}

	private function create_parent_item( string $slug, array $parent_config, array $existing_items ): array {
		$label = $this->get_label( $slug, $parent_config );
		$item = $this->find_existing_item( $existing_items, $slug ) ?? [ $label, Menu_Config::CAPABILITY_MANAGE_OPTIONS, $slug, $label ];

		$item[0] = $label;
		$item[2] = $slug;

		return $item;
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

	private function add_divider_before( array $item ): array {
		$item[3] = $item[3] ?? $item[0];
		$item[4] = trim( ( $item[4] ?? '' ) . ' ' . self::DIVIDER_CLASS );

		return $item;
	}

	private function extract_upgrade_item( array $existing_items ): ?array {
		$items_by_slug = array_column( $existing_items, null, 2 );

		foreach ( self::UPGRADE_SLUGS as $upgrade_slug ) {
			if ( isset( $items_by_slug[ $upgrade_slug ] ) ) {
				return $items_by_slug[ $upgrade_slug ];
			}
		}

		return null;
	}

	private function is_under_home( string $slug ): bool {
		global $submenu;

		return in_array( $slug, array_column( (array) ( $submenu[ Menu_Config::ELEMENTOR_HOME_MENU_SLUG ] ?? [] ), 2 ), true );
	}
}
