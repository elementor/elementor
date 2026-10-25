<?php

namespace Elementor\Modules\Promotions;

use Elementor\Core\Utils\Promotions\Filtered_Promotions_Manager;
use Elementor\Includes\EditorAssetsAPI;
use Elementor\Utils;

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

	public static function get_app_promotion_settings_for_config(): array {
		if ( Utils::has_pro() ) {
			return [
				'upgrade_url' => self::DEFAULT_UPGRADE_URL,
			];
		}

		return self::get_app_promotion_config();
	}

	public static function get_app_promotion_config(): array {
		$assets_data = self::get_assets_data();
		$upgrade_url = self::DEFAULT_UPGRADE_URL;

		if ( ! empty( $assets_data['is_active'] ) ) {
			$cdn_url = Promotion_Cdn_Url_Validator::read_string_field( $assets_data, 'url' );
			$sanitized_url = Promotion_Cdn_Url_Validator::sanitize_promotion_url( $cdn_url );
			if ( '' !== $sanitized_url ) {
				$upgrade_url = $sanitized_url;
			}
		}

		$config = [
			'upgrade_url' => $upgrade_url,
		];

		if ( ! empty( $assets_data['is_active'] ) ) {
			$button_text = Promotion_Cdn_Url_Validator::read_string_field( $assets_data, 'button_text' );
			if ( '' !== $button_text ) {
				$config['button_text'] = $button_text;
			}
		}

		$config = Filtered_Promotions_Manager::get_filtered_promotion_data(
			$config,
			'elementor/site-editor/promotion',
			'upgrade_url'
		);

		if ( ! empty( $config['upgrade_url'] ) ) {
			$config['upgrade_url'] = esc_url_raw( wp_specialchars_decode( $config['upgrade_url'] ) );
		}

		return $config;
	}
}
