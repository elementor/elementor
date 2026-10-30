<?php

namespace Elementor\Modules\ProSetupPromotion;

use Elementor\Includes\EditorAssetsAPI;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_Assets {

	const TRANSIENT_KEY = 'elementor_pro_setup_panel_promotion_assets_data';

	public static function get_assets_data(): array {
		$api = new EditorAssetsAPI( [
			EditorAssetsAPI::ASSETS_DATA_TRANSIENT_KEY => self::TRANSIENT_KEY,
			EditorAssetsAPI::ASSETS_DATA_URL => EditorAssetsAPI::PRODUCTION_URL . '/editor-promotions/v1/pro-setup-panel.json',
			EditorAssetsAPI::ASSETS_DATA_KEY => 'pro-setup-panel',
		] );

		$assets = $api->get_assets_data();

		return apply_filters( 'elementor/pro_setup_promotion/editor_assets', $assets );
	}

	public static function is_enabled(): bool {
		$assets = self::get_assets_data();

		return ! empty( $assets['is_active'] );
	}
}
