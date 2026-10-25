<?php

namespace Elementor\Modules\Promotions;

use Elementor\Core\Utils\Promotions\Filtered_Promotions_Manager;
use Elementor\Includes\EditorAssetsAPI;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Theme_Builder_Promotion {

	const DEFAULT_UPGRADE_URL = 'https://go.elementor.com/go-pro-theme-builder/';
	const TRANSIENT_KEY = 'elementor_theme_builder_promotion_assets_data';

	public static function get_assets_data(): array {
		$api = new EditorAssetsAPI( [
			EditorAssetsAPI::ASSETS_DATA_TRANSIENT_KEY => self::TRANSIENT_KEY,
			EditorAssetsAPI::ASSETS_DATA_URL           => EditorAssetsAPI::PRODUCTION_URL . '/editor-promotions/v1/theme-builder.json',
			EditorAssetsAPI::ASSETS_DATA_KEY           => 'theme-builder',
		] );

		return $api->get_assets_data();
	}

	public static function get_app_promotion_config(): array {
		$assets_data = self::get_assets_data();
		$upgrade_url = self::DEFAULT_UPGRADE_URL;

		if ( ! empty( $assets_data['is_active'] ) && ! empty( $assets_data['url'] ) && self::is_allowed_elementor_url( $assets_data['url'] ) ) {
			$upgrade_url = $assets_data['url'];
		}

		$config = [
			'upgrade_url' => $upgrade_url,
		];

		if ( ! empty( $assets_data['is_active'] ) && ! empty( $assets_data['button_text'] ) ) {
			$config['button_text'] = $assets_data['button_text'];
		}

		return Filtered_Promotions_Manager::get_filtered_promotion_data(
			$config,
			'elementor/site-editor/promotion',
			'upgrade_url'
		);
	}

	private static function is_allowed_elementor_url( string $url ): bool {
		$parsed = wp_parse_url( $url );
		$scheme = $parsed['scheme'] ?? '';
		$host   = $parsed['host'] ?? '';

		return 'https' === $scheme && ( 'elementor.com' === $host || str_ends_with( $host, '.elementor.com' ) );
	}
}
