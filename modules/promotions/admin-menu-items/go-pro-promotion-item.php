<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Core\Utils\Promotions\Filtered_Promotions_Manager;
use Elementor\Includes\EditorAssetsAPI;
use Elementor\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Go_Pro_Promotion_Item implements Admin_Menu_Item_With_Page {
	const URL = 'https://go.elementor.com/go-pro-upgrade-one-wp-menu/';
	const SIDE_MENU_TRANSIENT_KEY = 'elementor_side_menu_cdn_data';

	public function get_name() {
		return 'admin_menu_promo';
	}

	public function is_visible() {
		return true;
	}

	public function get_parent_slug() {
		return Settings::PAGE_ID;
	}

	public function get_label() {
		$assets_data = self::get_side_menu_assets_data();

		if ( ! empty( $assets_data['is_active'] ) && ! empty( $assets_data['label'] ) ) {
			$upgrade_text = esc_html( $assets_data['label'] );
		} else {
			$upgrade_text = esc_html__( 'Upgrade', 'elementor' );
		}

		return apply_filters( 'elementor/admin_menu/custom_promotion', [ 'upgrade_text' => $upgrade_text ] )['upgrade_text'] ?? $upgrade_text;
	}

	public function get_page_title() {
		return '';
	}

	public function get_capability() {
		return 'manage_options';
	}

	public static function get_url() {
		$assets_data = self::get_side_menu_assets_data();

		if ( ! empty( $assets_data['is_active'] ) && ! empty( $assets_data['url'] ) ) {
			$url = $assets_data['url'];
		} else {
			$url = self::URL;
		}

		$filtered_url = apply_filters( 'elementor/admin_menu/custom_promotion', [ 'upgrade_url' => $url ] )['upgrade_url'] ?? '';
		$promotion_data = Filtered_Promotions_Manager::get_filtered_promotion_data( [ 'upgrade_url' => $filtered_url ], 'elementor/admin_menu/custom_promotion', 'upgrade_url' );
		return $promotion_data['upgrade_url'];
	}

	public function render() {
		// Redirects from the module on `admin_init`.
		die;
	}

	public static function get_side_menu_assets_data(): array {
		$api = new EditorAssetsAPI( [
			EditorAssetsAPI::ASSETS_DATA_TRANSIENT_KEY => self::SIDE_MENU_TRANSIENT_KEY,
			EditorAssetsAPI::ASSETS_DATA_URL           => EditorAssetsAPI::PRODUCTION_URL . '/editor-promotions/v1/side-menu.json',
			EditorAssetsAPI::ASSETS_DATA_KEY           => 'side-menu',
		] );
		return $api->get_assets_data();
	}
}
