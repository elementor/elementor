<?php
namespace Elementor\Modules\Promotions;

use Elementor\Core\Base\Document;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Theme_Builder_Promotion {
	const OPTION_KEY = 'elementor_theme_builder_promotion_enabled';

	private static bool $is_registered = false;

	public static function is_enabled(): bool {
		return '1' === get_option( self::OPTION_KEY, '1' );
	}

	public static function register(): void {
		if ( self::$is_registered || ! self::is_enabled() ) {
			return;
		}

		self::$is_registered = true;

		add_filter( 'elementor/documents/ajax_save/return_data', [ __CLASS__, 'add_promotion_payload_to_save_response' ], 10, 2 );
		add_action( 'elementor/editor/before_enqueue_scripts', [ __CLASS__, 'enqueue_modal_script' ] );
	}

	public static function add_promotion_payload_to_save_response( array $return_data, $document ): array {
		if ( ! $document instanceof Document ) {
			return $return_data;
		}

		$return_data['config']['document']['themeBuilderPromotion'] = Theme_Builder_Promotion_Detections::get_promotion_payload( $document );

		return $return_data;
	}

	public static function enqueue_modal_script(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$min_suffix = Utils::is_script_debug() ? '' : '.min';
		$package = 'theme-builder-promotion-modal';

		$assets_config_provider = ( new \Elementor\Core\Utils\Assets_Config_Provider() )
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
}
