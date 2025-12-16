<?php

namespace Elementor\Modules\EditorOne\Classes;

use Elementor\Modules\EditorOne\Classes\Menu\Items\Legacy_Submenu_Item;
use Elementor\Modules\EditorOne\Classes\Menu\Items\Legacy_Submenu_Item_Not_Mapped;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Legacy_Submenu_Interceptor {

	private Menu_Data_Provider $menu_data_provider;

	private Slug_Normalizer $slug_normalizer;

	public function __construct( Menu_Data_Provider $menu_data_provider, Slug_Normalizer $slug_normalizer ) {
		$this->menu_data_provider = $menu_data_provider;
		$this->slug_normalizer = $slug_normalizer;
	}

	public function intercept_all(): void {
		global $submenu;

		// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		$submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] = $this->intercept_elementor_menu_items(
			$submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] ?? []
		);

		// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		$submenu[ Menu_Config::LEGACY_TEMPLATES_SLUG ] = $this->intercept_templates_menu_items(
			$submenu[ Menu_Config::LEGACY_TEMPLATES_SLUG ] ?? []
		);
	}

	public function intercept_elementor_menu_items( array $submenu_items ): array {
		if ( empty( $submenu_items ) ) {
			return $submenu_items;
		}

		$legacy_pro_mapping = Menu_Config::get_legacy_pro_mapping();
		$items_to_remove = [];

		foreach ( $submenu_items as $index => $submenu_item ) {
			$item_slug = $submenu_item[2] ?? '';

			if ( empty( $item_slug ) ) {
				continue;
			}

			if ( $this->menu_data_provider->is_item_already_registered( $item_slug ) ) {
				continue;
			}

			$mapping_key = $this->find_mapping_key( $item_slug, $legacy_pro_mapping );

			if ( null !== $mapping_key ) {
				$this->register_mapped_item( $submenu_item, $mapping_key, $legacy_pro_mapping );
			} else {
				$this->register_unmapped_item( $submenu_item );
			}

			$items_to_remove[] = $index;
		}

		foreach ( $items_to_remove as $index ) {
			unset( $submenu_items[ $index ] );
		}

		return $submenu_items;
	}

	public function intercept_templates_menu_items( array $submenu_items ): array {
		if ( empty( $submenu_items ) ) {
			return $submenu_items;
		}

		$items_to_remove = [];

		foreach ( $submenu_items as $index => $submenu_item ) {
			$item_slug = $submenu_item[2] ?? '';

			if ( empty( $item_slug ) ) {
				continue;
			}

			if ( $this->menu_data_provider->is_item_already_registered( $item_slug ) ) {
				$items_to_remove[] = $index;
				continue;
			}

			$submenu_item[4] = Menu_Config::TEMPLATES_GROUP_ID;
			$legacy_item = new Legacy_Submenu_Item( $submenu_item, Menu_Config::LEGACY_TEMPLATES_SLUG );

			$this->menu_data_provider->register_menu( $legacy_item );

			$items_to_remove[] = $index;
		}

		foreach ( $items_to_remove as $index ) {
			unset( $submenu_items[ $index ] );
		}

		return $submenu_items;
	}

	public function find_mapping_key( string $item_slug, array $mapping ): ?string {
		if ( isset( $mapping[ $item_slug ] ) ) {
			return $item_slug;
		}

		$decoded_slug = html_entity_decode( $item_slug );

		if ( isset( $mapping[ $decoded_slug ] ) ) {
			return $decoded_slug;
		}

		$normalized_slug = $this->slug_normalizer->normalize( $item_slug );

		foreach ( $mapping as $key => $value ) {
			$normalized_key = $this->slug_normalizer->normalize( $key );

			if ( $normalized_slug === $normalized_key ) {
				return $key;
			}
		}

		return null;
	}

	private function register_mapped_item( array $submenu_item, string $mapping_key, array $legacy_pro_mapping ): void {
		$item_slug = $submenu_item[2];

		if ( isset( $legacy_pro_mapping[ $mapping_key ]['label'] ) ) {
			$submenu_item[0] = $legacy_pro_mapping[ $mapping_key ]['label'];
		}

		$position = Menu_Config::get_attribute_mapping()[ $item_slug ]['position'] ?? 100;
		$group_id = $legacy_pro_mapping[ $mapping_key ]['group'];
		$submenu_item[4] = $group_id;

		$legacy_item = new Legacy_Submenu_Item( $submenu_item, Menu_Config::ELEMENTOR_MENU_SLUG, $position );

		$this->menu_data_provider->register_menu( $legacy_item );
	}

	private function register_unmapped_item( array $submenu_item ): void {
		$item_slug = $submenu_item[2];
		$position = Menu_Config::get_attribute_mapping()[ $item_slug ]['position'] ?? 100;
		$submenu_item[4] = Menu_Config::get_attribute_mapping()[ $item_slug ]['icon'] ?? 'tool';

		$legacy_item = new Legacy_Submenu_Item_Not_Mapped( $submenu_item, Menu_Config::ELEMENTOR_MENU_SLUG, $position );

		$this->menu_data_provider->register_menu( $legacy_item );
	}
}
