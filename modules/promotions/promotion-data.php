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
			Utils::ANIMATED_HEADLINE => self::get_animated_headline_data( $assets_data ),
			Utils::VIDEO_PLAYLIST => self::get_video_playlist_data( $assets_data ),
			Utils::CTA => self::get_cta_button_data( $assets_data ),
			Utils::IMAGE_CAROUSEL => self::get_image_carousel_data( $assets_data ),
			Utils:: TESTIMONIAL_WIDGET => self::get_testimonial_widget_data( $assets_data ),
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

		return self::filter_data( Utils::ANIMATED_HEADLINE, $data );
	}

	private static function get_video_playlist_data( $assets_data ) {
		$data = [
			'image' => esc_url( $assets_data[ Utils::VIDEO_PLAYLIST ] ?? '' ),
			'image_alt' => esc_attr__( 'Upgrade', 'elementor' ),
			'title' => esc_html__( 'Showcase Video Playlists', 'elementor' ),
			'description' => [
				esc_html__( 'Embed videos with full control.', 'elementor' ),
				esc_html__( 'Adjust layout and playback settings.', 'elementor' ),
				esc_html__( 'Seamlessly customize video appearance.', 'elementor' ),
			],
			'upgrade_text' => esc_html__( 'Upgrade Now', 'elementor' ),
			'upgrade_url' => 'https://go.elementor.com/go-pro-video-widget/',
		];

		return self::filter_data( Utils::VIDEO_PLAYLIST, $data );
	}

	private static function get_cta_button_data( $assets_data ) {
		$data = [
			'image' => esc_url( $assets_data[ Utils::CTA ] ?? '' ),
			'image_alt' => esc_attr__( 'Upgrade', 'elementor' ),
			'title' => esc_html__( 'Boost Conversions with CTAs', 'elementor' ),
			'description' => [
				esc_html__( 'Combine text, buttons, and images.', 'elementor' ),
				esc_html__( 'Add hover animations and CSS effects.', 'elementor' ),
				esc_html__( 'Create unique, interactive designs.', 'elementor' ),
			],
			'upgrade_text' => esc_html__( 'Upgrade Now', 'elementor' ),
			'upgrade_url' => 'https://go.elementor.com/go-pro-button-widget/',
		];

		return self::filter_data( Utils::CTA, $data );
	}

	private static function get_image_carousel_data( $assets_data ) {
		$data = [
			'image' => esc_url( $assets_data[ Utils::IMAGE_CAROUSEL ] ?? '' ),
			'image_alt' => esc_attr__( 'Upgrade', 'elementor' ),
			'title' => esc_html__( 'Design Custom Carousels', 'elementor' ),
			'description' => [
				esc_html__( 'Create flexible custom carousels.', 'elementor' ),
				esc_html__( 'Adjust transitions and animations easily.', 'elementor' ),
				esc_html__( 'Showcase multiple items with style.', 'elementor' ),
			],
			'upgrade_text' => esc_html__( 'Upgrade Now', 'elementor' ),
			'upgrade_url' => 'https://go.elementor.com/go-pro-image-carousel-widget/',
		];

		return self::filter_data( Utils::IMAGE_CAROUSEL, $data );
	}

	private static function get_testimonial_widget_data( $assets_data ) {
		$data = [
			'image' => esc_url( $assets_data[ Utils::TESTIMONIAL_WIDGET ] ?? '' ),
			'image_alt' => esc_attr__( 'Upgrade', 'elementor' ),
			'title' => esc_html__( 'Upgrade Your Testimonials', 'elementor' ),
			'description' => [
				esc_html__( 'Display reviews in a rotating carousel.', 'elementor' ),
				esc_html__( 'Boost credibility with dynamic testimonials.', 'elementor' ),
				esc_html__( 'Customize layouts for visual appeal.', 'elementor' ),
			],
			'upgrade_text' => esc_html__( 'Upgrade Now', 'elementor' ),
			'upgrade_url' => 'https://go.elementor.com/go-pro-testimonial-widget/',
		];

		return self::filter_data( Utils::TESTIMONIAL_WIDGET, $data );
	}

	private static function filter_data( $widget_name, $asset_data ) {
		return Filtered_Promotions_Manager::get_filtered_promotion_data( $asset_data, "elementor/widgets/{$widget_name}/custom_promotion", 'upgrade_url' );
	}
}
