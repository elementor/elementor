<?php
namespace Elementor\Modules\Promotions;

use Elementor\Core\Base\Document;
use Elementor\Plugin;
use Elementor\Utils;
use Elementor\Includes\EditorAssetsAPI;
use Elementor\Core\Utils\Assets_Config_Provider;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Theme_Builder_Promotion {
	const OPTION_KEY = 'elementor_theme_builder_promotion_enabled';
	const PROMO_PROP = 'themeBuilderPromotion';

	private static function is_enabled(): bool {
		return '1' === get_option( self::OPTION_KEY, '1' );
	}

	public static function register(): void {
		if ( ! self::is_enabled() ) {
			return;
		}

		add_filter( 'elementor/document/config', [ __CLASS__, 'add_document_config' ], 10, 2 );
		add_action( 'elementor/editor/before_enqueue_scripts', [ __CLASS__, 'enqueue_modal_script' ] );
	}

	public static function add_document_config( array $additional_config, int $post_id ): array {
		if ( ! current_user_can( 'manage_options' ) ) {
			return $additional_config;
		}

		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document instanceof Document ) {
			return $additional_config;
		}

		$additional_config[ self::PROMO_PROP ] = Theme_Builder_Promotion_Detections::get_promotion_payload( $document );

		if ( ! empty( $additional_config[ self::PROMO_PROP ] ) ) {
			$assets_data = self::get_scenario_data( $additional_config[ self::PROMO_PROP ]['scenario'] );

			if ( ! self::is_valid_scenario_data( $assets_data ) ) {
				unset( $additional_config[ self::PROMO_PROP ] );

				return $additional_config;
			}

			$additional_config[ self::PROMO_PROP ]['assets'] = $assets_data;
		}

		return $additional_config;
	}

	public static function enqueue_modal_script(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$document = Plugin::$instance->documents->get_doc_or_auto_save( Plugin::$instance->editor->get_post_id() );

		if ( ! $document instanceof Document ) {
			return;
		}

		$promotion_payload = Theme_Builder_Promotion_Detections::get_promotion_payload( $document );

		if ( empty( $promotion_payload['introductionKey'] ) || empty( $promotion_payload['scenario'] ) ) {
			return;
		}

		$min_suffix = Utils::is_script_debug() ? '' : '.min';
		$package = 'theme-builder-promotion-modal';

		$assets_config_provider = ( new Assets_Config_Provider() )
			->set_path_resolver( function ( $name ) {
				return ELEMENTOR_ASSETS_PATH . "js/packages/{$name}/{$name}.asset.php";
			} );

		$config = $assets_config_provider->load( $package )->get( $package );

		if ( ! $config ) {
			return;
		}

		wp_register_script(
			$config['handle'],
			ELEMENTOR_ASSETS_URL . "js/packages/{$package}/{$package}{$min_suffix}.js",
			$config['deps'],
			ELEMENTOR_VERSION,
			true
		);

		wp_enqueue_script( $config['handle'] );
		wp_set_script_translations( $config['handle'], 'elementor' );
	}

	private static function get_api_config(): array {
		return [
			EditorAssetsAPI::ASSETS_DATA_URL => 'https://assets.elementor.com/theme-builder-promo/v1/theme-builder-promo.json',
			EditorAssetsAPI::ASSETS_DATA_TRANSIENT_KEY => '_theme_builder_promo_data',
			EditorAssetsAPI::ASSETS_DATA_KEY => 'theme-builder-promo',
		];
	}

	private static function get_scenario_data( string $scenario ): array {
		$editor_assets_api = new EditorAssetsAPI( self::get_api_config() );
		$assets_data = $editor_assets_api->get_assets_data( true );
		return $assets_data[ $scenario ];
	}

	private static function is_valid_scenario_data( array $scenario_data ): bool {
		return ! empty( $scenario_data['title'] ) && ! empty( $scenario_data['body'] ) && ! empty( $scenario_data['imageUrl'] );
	}
}
