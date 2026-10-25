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

	public static function apply_to_promotion( $promotion_data ) {
		if ( ! is_array( $promotion_data ) ) {
			return $promotion_data;
		}

		$assets_data = self::get_assets_data();

		if ( empty( $assets_data['is_active'] ) ) {
			return $promotion_data;
		}

		$message = Promotion_Cdn_Url_Validator::read_string_field( $assets_data, 'message' );
		if ( '' !== $message ) {
			$promotion_data['message'] = $message;
		}

		$button_text = Promotion_Cdn_Url_Validator::read_string_field( $assets_data, 'button_text' );
		if ( '' !== $button_text ) {
			$promotion_data['button_text'] = $button_text;
		}

		$url = Promotion_Cdn_Url_Validator::read_string_field( $assets_data, 'url' );
		$sanitized_url = Promotion_Cdn_Url_Validator::sanitize_promotion_url( $url );
		if ( '' !== $sanitized_url ) {
			$promotion_data['url'] = $sanitized_url;
		}

		return $promotion_data;
	}
}
