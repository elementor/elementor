<?php

namespace Elementor\Modules\EditorOne\Classes;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Components\Admin_Menu_Structure;
use Elementor\Modules\Promotions\AdminMenuItems\Go_Pro_Promotion_Item;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Subscription_Action {

	/**
	 * One action under Account. A registered Renew / Unlock item wins over the free Upgrade row
	 * so the two never stack. The free row is the sidebar button, including when the One package
	 * hides it for a connected account.
	 */
	public function resolve( array $existing_items ): ?array {
		$registered_action = $this->get_registered_action();

		if ( null !== $registered_action ) {
			return $registered_action;
		}

		return $this->extract_upgrade_item( $existing_items ) ?? $this->create_free_upgrade_item();
	}

	private function extract_upgrade_item( array $existing_items ): ?array {
		$items_by_slug = array_column( $existing_items, null, 2 );

		foreach ( Admin_Menu_Structure::UPGRADE_SLUGS as $upgrade_slug ) {
			if ( isset( $items_by_slug[ $upgrade_slug ] ) ) {
				return $items_by_slug[ $upgrade_slug ];
			}
		}

		return null;
	}

	private function get_registered_action(): ?array {
		$provider = Menu_Data_Provider::instance();
		$selected = null;
		$selected_position = PHP_INT_MAX;

		foreach ( [ $provider->get_level3_items(), $provider->get_level4_items() ] as $groups ) {
			$system_items = $groups[ Menu_Config::SYSTEM_GROUP_ID ] ?? [];

			foreach ( $system_items as $item ) {
				if ( ! $this->is_external_action( $item ) || ! $provider->is_item_accessible( $item ) ) {
					continue;
				}

				$position = $item->get_position();

				if ( $position < $selected_position ) {
					$selected = $item;
					$selected_position = $position;
				}
			}
		}

		if ( null === $selected ) {
			return null;
		}

		$this->detach_page_hook( $selected->get_slug() );

		$label = $selected->get_label();

		return [ $label, $selected->get_capability(), $selected->get_slug(), $label ];
	}

	private function is_external_action( Menu_Item_Interface $item ): bool {
		return str_starts_with( $item->get_slug(), 'https://' ) || str_starts_with( $item->get_slug(), 'http://' );
	}

	private function detach_page_hook( string $slug ): void {
		$hook = get_plugin_page_hook( $slug, Menu_Config::ELEMENTOR_HOME_MENU_SLUG );

		if ( $hook ) {
			remove_all_actions( $hook );
		}
	}

	private function create_free_upgrade_item(): ?array {
		if ( Utils::has_pro() ) {
			return null;
		}

		$promotion = new Go_Pro_Promotion_Item();
		$label = $promotion->get_label();

		return [ $label, $promotion->get_capability(), 'elementor-one-upgrade', $label ];
	}
}
