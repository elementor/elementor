<?php
namespace Elementor\Modules\Promotions;

use Elementor\Core\Utils\Promotions\Filtered_Promotions_Manager;
use Elementor\Data\EditorAssets\EditorAssetsAPI;
use Elementor\Utils;

class PromotionData extends EditorAssetsAPI {
	public static function config( $key ): string {
		$config = [
			'ASSETS_DATA_URL' => 'https://assets.elementor.com/free-to-pro-upsell/v1/free-to-pro-upsell.json',
			'ASSETS_DATA_TRANSIENT_KEY' => '_elementor_free_to_pro_upsell',
			'ASSETS_DATA_KEY' => 'free-to-pro-upsell',
		];

		return $config[ $key ] ?? '';
	}

	public static function get_promotion_data( $force_request = false ): array {
		$assets_data = self::transform_assets_data( $force_request );

		return [
			'animated_headline' => self::get_animated_headline_data( $assets_data ),
		];
	}

	private static function transform_assets_data( $force_request = false ) {
		$assets_data = static::get_assets_data( $force_request );
		$transformed_data = [];

		foreach ( $assets_data as $asset ) {
			$transformed_data[ $asset['id'] ] = $asset['imageSrc'];
		}

		return $transformed_data;
	}

	private static function get_animated_headline_data( $assets_data ) {
		$header_description = 'Get access to more features, widgets, and templates with Elementor Pro.';
		$header_description .= '<ul>';
		$header_description .= '<li>First bullet point.</li>';
		$header_description .= '<li>Second bullet point</li>';
		$header_description .= '<li>Third bullet point.</li>';
		$header_description .= '</ul>';

		$data = [
			'image' => esc_url( $assets_data['animated-headline'] ) ?? '',
			'image_alt' => esc_attr__( 'Upgrade', 'elementor' ),
			'title' => esc_html__( 'Unlock Elementor Pro', 'elementor' ),
			'description' => esc_html__( $header_description , 'elementor' ),
			'upgrade_text' => esc_html__( 'Upgrade Now', 'elementor' ),
			'upgrade_url' => 'https://elementor.com/pro/',
		];

		return self::filter_data( 'heading', $data );
	}

	private static function filter_data( $filter_name, $asset_data ) {
		return Filtered_Promotions_Manager::get_filtered_promotion_data( $asset_data, "elementor/widgets/{ $filter_name }/custom_promotion", 'upgrade_url' );
	}
}
