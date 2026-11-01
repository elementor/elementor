<?php

namespace Elementor\Modules\EditorOne\Classes;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Admin_Flow_Map {
	const ROUTE_KEYS = [ 'page', 'post_type', 'tabs_group', 'elementor_library_type' ];

	private Menu_Data_Provider $menu_data_provider;
	private array $config;
	private ?array $registered_items = null;

	public function __construct( Menu_Data_Provider $menu_data_provider, array $config ) {
		$this->menu_data_provider = $menu_data_provider;
		$this->config = $config;
	}

	public function get_parent_group( string $parent_slug ): string {
		return $this->config['parents'][ $parent_slug ]['group'] ?? '';
	}

	public function get_tabs( string $group_id ): array {
		$tabs = [];

		foreach ( $this->config['groups'][ $group_id ] ?? [] as $tab_id => $tab ) {
			$item = $this->find_accessible_item( $tab['items'] ?? [] );

			if ( ! $item ) {
				continue;
			}

			$tabs[ $tab_id ] = [
				'id' => $tab_id,
				'label' => $item->get_label(),
				'url' => $this->resolve_tab_url( $tab, $item ),
				'parent' => $tab['parent'],
				'routes' => $this->get_tab_routes( $tab, $item ),
			];
		}

		return $tabs;
	}

	public function get_default_tab( string $parent_slug ): ?array {
		$parent = $this->config['parents'][ $parent_slug ] ?? null;

		if ( null === $parent || empty( $parent['group'] ) ) {
			return null;
		}

		$tabs = $this->get_tabs( $parent['group'] );

		if ( isset( $tabs[ $parent['default_tab'] ] ) ) {
			return $tabs[ $parent['default_tab'] ];
		}

		foreach ( $tabs as $tab ) {
			if ( $parent_slug === $tab['parent'] ) {
				return $tab;
			}
		}

		return null;
	}

	public function get_default_url( string $parent_slug ): string {
		if ( ! isset( $this->config['parents'][ $parent_slug ] ) ) {
			return '';
		}

		if ( empty( $this->config['parents'][ $parent_slug ]['group'] ) ) {
			return admin_url( 'admin.php?page=' . $parent_slug );
		}

		$default_tab = $this->get_default_tab( $parent_slug );

		return $default_tab['url'] ?? '';
	}

	public function get_parent_redirect_url( string $page ): string {
		$default_tab = $this->get_default_tab( $page );

		if ( ! $default_tab ) {
			return '';
		}

		foreach ( $default_tab['routes'] as $route ) {
			if ( ( $route['page'] ?? '' ) === $page ) {
				return '';
			}
		}

		return $default_tab['url'];
	}

	public function resolve( array $query_args ): array {
		$page = $query_args['page'] ?? '';

		if ( isset( $this->config['pages'][ $page ] ) ) {
			return $this->create_state( $this->config['pages'][ $page ] );
		}

		if ( isset( $this->config['parents'][ $page ] ) ) {
			$default_tab = $this->get_default_tab( $page );

			return $this->create_state( $page, $this->get_parent_group( $page ), $default_tab['id'] ?? '' );
		}

		return $this->resolve_by_tab_routes( $query_args );
	}

	private function resolve_by_tab_routes( array $query_args ): array {
		$state = $this->create_state();
		$best_score = 0;

		foreach ( array_keys( $this->config['groups'] ) as $group_id ) {
			foreach ( $this->get_tabs( $group_id ) as $tab ) {
				$score = $this->get_best_route_score( $tab['routes'], $query_args );

				if ( $score > $best_score ) {
					$best_score = $score;
					$state = $this->create_state( $tab['parent'], $group_id, $tab['id'] );
				}
			}
		}

		return $state;
	}

	private function get_best_route_score( array $routes, array $query_args ): int {
		$best_score = 0;

		foreach ( $routes as $route ) {
			if ( empty( $route ) || array_diff_assoc( $route, $query_args ) ) {
				continue;
			}

			$best_score = max( $best_score, count( $route ) );
		}

		return $best_score;
	}

	private function create_state( string $parent_slug = '', string $group = '', string $tab = '' ): array {
		return [
			'parent' => $parent_slug,
			'group' => $group,
			'tab' => $tab,
		];
	}

	private function find_accessible_item( array $identifiers ): ?Menu_Item_Interface {
		foreach ( $identifiers as $identifier ) {
			$item = $this->find_item( $identifier );

			if ( $item && $this->menu_data_provider->is_item_accessible( $item ) ) {
				return $item;
			}
		}

		return null;
	}

	private function find_item( string $identifier ): ?Menu_Item_Interface {
		$items = $this->get_registered_items();

		if ( isset( $items[ $identifier ] ) ) {
			return $items[ $identifier ];
		}

		foreach ( $items as $item ) {
			if ( $item instanceof $identifier ) {
				return $item;
			}
		}

		return null;
	}

	private function get_registered_items(): array {
		if ( null !== $this->registered_items ) {
			return $this->registered_items;
		}

		$this->registered_items = [];

		$groups = array_merge(
			array_values( $this->menu_data_provider->get_level3_items() ),
			array_values( $this->menu_data_provider->get_level4_items() )
		);

		foreach ( $groups as $group_items ) {
			$this->registered_items = array_merge( $this->registered_items, $group_items );
		}

		return $this->registered_items;
	}

	private function resolve_tab_url( array $tab, Menu_Item_Interface $item ): string {
		if ( isset( $tab['url'] ) && is_callable( $tab['url'] ) ) {
			return call_user_func( $tab['url'] );
		}

		return $this->menu_data_provider->resolve_item_url( $item, $item->get_slug() );
	}

	private function get_tab_routes( array $tab, Menu_Item_Interface $item ): array {
		$routes = $tab['routes'] ?? [];
		$url = $this->menu_data_provider->resolve_item_url( $item, $item->get_slug() );

		if ( false === strpos( $url, '#' ) ) {
			$routes[] = $this->parse_route( $url );
		}

		return $routes;
	}

	private function parse_route( string $url ): array {
		$query_args = [];
		wp_parse_str( (string) wp_parse_url( $url, PHP_URL_QUERY ), $query_args );

		return array_intersect_key( $query_args, array_flip( self::ROUTE_KEYS ) );
	}
}
