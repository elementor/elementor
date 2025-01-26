<?php
namespace Elementor\Modules\Home;

use Elementor\Includes\EditorAssetsAPI;
use Elementor\Modules\Home\Classes\Transformations_Manager;
use Elementor\Core\Utils\Promotions\Filtered_Promotions_Manager;

class API {
	protected EditorAssetsAPI $editor_assets_api;

	public function __construct( EditorAssetsAPI $editor_assets_api ) {
		$this->editor_assets_api = $editor_assets_api;
	}

	public function get_home_screen_items( $force_request = false ): array {
		$assets_data = $this->editor_assets_api->get_assets_data( $force_request );
//		var_dump( $assets_data );

		$assets_data = apply_filters('replace_homescreen_json_data', $assets_data);
//		var_dump( $assets_data );
//		die();

		return $this->transform_home_screen_data( $assets_data );
	}

	private function transform_home_screen_data( $json_data ): array {
		$transformers = new Transformations_Manager( $json_data );

		return $transformers->run_transformations();
	}
}
