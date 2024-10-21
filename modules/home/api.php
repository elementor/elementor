<?php
namespace Elementor\Modules\Home;

use Elementor\Includes\ApiRequests\EditorAssets;
use Elementor\Modules\Home\Classes\Transformations_Manager;

class API {
    protected EditorAssets $editorAssets;

    public function __construct( EditorAssets $editorAssets ) {
        $this->editorAssets = $editorAssets;
    }

	public function get_home_screen_items( $force_request = false ): array {
		$assets_data = $this->editorAssets->get_assets_data( $force_request );

		return $this->transform_home_screen_data( $assets_data );
	}

	private function transform_home_screen_data( $json_data ): array {
		$transformers = new Transformations_Manager( $json_data );

		return $transformers->run_transformations();
	}
}
