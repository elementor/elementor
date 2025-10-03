<?php
namespace Elementor\App\Modules\Onboarding;

use Elementor\Includes\EditorAssetsAPI;

class API {
	protected EditorAssetsAPI $editor_assets_api;

	public function __construct( EditorAssetsAPI $editor_assets_api ) {
		$this->editor_assets_api = $editor_assets_api;
	}

	public function get_onboarding_data( $force_request = false ): array {
		$assets_data = $this->editor_assets_api->get_assets_data( $force_request );

		$assets_data = apply_filters( 'elementor/onboarding/assets_data', $assets_data );

		return $this->extract_onboarding_config( $assets_data );
	}

	private function extract_onboarding_config( array $json_data ): array {
		if ( empty( $json_data ) || ! is_array( $json_data ) ) {
			return [];
		}

		$first_item = $json_data[0] ?? [];

		return $first_item['AbTesting'] ?? [];
	}

	public function is_step2_ab_testing_active( $force_request = false ): bool {
		$onboarding_data = $this->get_onboarding_data( $force_request );

		return $onboarding_data['step2AbTestingActive'] ?? false;
	}
}
