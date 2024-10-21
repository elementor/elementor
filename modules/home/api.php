<?php
namespace Elementor\Modules\Home;

use Elementor\Includes\EditorAssetsApi;
use Elementor\Modules\Home\Classes\Transformations_Manager;

class API {
    protected EditorAssetsApi $editorAssetsApi;

    public function __construct( EditorAssetsApi $editorAssetsApi ) {
        $this->editorAssetsApi = $editorAssetsApi;
    }

	public function get_home_screen_items( $force_request = false ): array {
		$assets_data = $this->editorAssetsApi->get_assets_data( $force_request );

		return $this->transform_home_screen_data( $assets_data );
	}

	private function transform_home_screen_data( $json_data ): array {
		$transformers = new Transformations_Manager( $json_data );

		return $transformers->run_transformations();
	}
}
