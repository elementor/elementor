<?php

namespace Elementor\Modules\Promotions;

use Elementor\Includes\EditorAssetsAPI;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Sticky_Panel_Promotion {

	const TRANSIENT_KEY = 'elementor_sticky_panel_promotion_assets_data';

	public static function get_assets_data(): array {
		$api = new EditorAssetsAPI( [
			EditorAssetsAPI::ASSETS_DATA_TRANSIENT_KEY => self::TRANSIENT_KEY,
			EditorAssetsAPI::ASSETS_DATA_URL           => EditorAssetsAPI::PRODUCTION_URL . '/editor-promotions/v1/sticky-panel.json',
			EditorAssetsAPI::ASSETS_DATA_KEY           => 'sticky-panel',
		] );

		return $api->get_assets_data();
	}

	public static function apply_to_promotion( array $promotion_data ): array {
		$assets_data = self::get_assets_data();

		if ( empty( $assets_data['is_active'] ) ) {
			return $promotion_data;
		}

		if ( ! empty( $assets_data['message'] ) ) {
			$promotion_data['message'] = $assets_data['message'];
		}

		if ( ! empty( $assets_data['button_text'] ) ) {
			$promotion_data['button_text'] = $assets_data['button_text'];
		}

		if ( ! empty( $assets_data['url'] ) && self::is_allowed_elementor_url( $assets_data['url'] ) ) {
			$promotion_data['url'] = esc_url( $assets_data['url'] );
		}

		return $promotion_data;
	}

	private static function is_allowed_elementor_url( string $url ): bool {
		$parsed = wp_parse_url( $url );
		$scheme = $parsed['scheme'] ?? '';
		$host   = $parsed['host'] ?? '';

		return 'https' === $scheme && ( 'elementor.com' === $host || str_ends_with( $host, '.elementor.com' ) );
	}
}
