<?php
namespace Elementor\Modules\Home;

use Elementor\Data\EditorAssets\EditorAssetsAPI;
use Elementor\Modules\Home\Classes\Transformations_Manager;

class API extends EditorAssetsAPI {
	public static function get_home_screen_items( $force_request = false ): array {
		$assets_data = self::get_assets_data( $force_request );

		return self::transform_home_screen_data( $assets_data );
	}

	private static function transform_home_screen_data( $json_data ): array {
		$transformers = new Transformations_Manager( $json_data );

		return $transformers->run_transformations();
	}
}
