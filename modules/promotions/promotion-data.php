<?php
namespace Elementor\Modules\Promotions;

use Elementor\Core\Utils\Promotions\Filtered_Promotions_Manager;
use Elementor\Includes\EditorAssetsAPI;
use Elementor\Utils;

class PromotionData {
	protected EditorAssetsAPI $editor_assets_api;

	public function __construct( EditorAssetsAPI $editor_assets_api ) {
		$this->editor_assets_api = $editor_assets_api;
	}

	public function get_promotion_data( $force_request = false ): array {
		$assets_data = $this->transform_assets_data( $force_request );

		return [
			Utils::ANIMATED_HEADLINE => $this->get_animated_headline_data( $assets_data ),
		];
	}

	private function transform_assets_data( $force_request = false ) {
		$assets_data = $this->editor_assets_api->get_assets_data( $force_request );
		$transformed_data = [];

		foreach ( $assets_data as $asset ) {
			$transformed_data[ $asset['id'] ] = $asset['imageSrc'];
		}

		return $transformed_data;
	}

	private function get_animated_headline_data( $assets_data ) {
		$data = [
			'image' => esc_url( $assets_data[ Utils::ANIMATED_HEADLINE ] ?? '' ),
			'image_alt' => esc_attr__( 'Upgrade', 'elementor' ),
			'title' => esc_html__( 'Bring Headlines to Life', 'elementor' ),
			'description' => [
				esc_html__( 'Highlight key messages dynamically.', 'elementor' ),
				esc_html__( 'Apply rotating effects to text.', 'elementor' ),
				esc_html__( 'Fully customize your headlines.', 'elementor' ),
			],
			'upgrade_text' => esc_html__( 'Upgrade Now', 'elementor' ),
			'upgrade_url' => 'https://go.elementor.com/go-pro-heading-widget/',
		];

		return $this->filter_data( Utils::ANIMATED_HEADLINE, $data );
	}

	private function filter_data( $widget_name, $asset_data ): array {
		return Filtered_Promotions_Manager::get_filtered_promotion_data( $asset_data, "elementor/widgets/{$widget_name}/custom_promotion", 'upgrade_url' );
	}
}
