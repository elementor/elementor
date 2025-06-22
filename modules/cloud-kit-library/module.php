<?php
namespace Elementor\Modules\CloudKitLibrary;

use Elementor\Modules\CloudKitLibrary\Data\Controller as Cloud_Kits_Controller;
use Elementor\Core\Utils\Exceptions;
use Elementor\Plugin;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\CloudKitLibrary\Connect\Cloud_Kits;
use Elementor\Core\Common\Modules\Connect\Module as ConnectModule;
use Elementor\App\Modules\ImportExport\Module as ImportExport_Module;
use Elementor\App\Modules\KitLibrary\Connect\Kit_Library as Kit_Library_Api;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	public function get_name(): string {
		return 'cloud-kit-library';
	}

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/connect/apps/register', function ( ConnectModule $connect_module ) {
			$connect_module->register_app( 'cloud-kits', Cloud_Kits::get_class_name() );
		} );

		if ( Plugin::$instance->experiments->is_feature_active( 'cloud-library' ) ) {
			add_filter( 'elementor/export/kit/export-result', [ $this, 'handle_export_kit_result' ], 10, 5 );
			add_filter( 'elementor/import/kit/result/cloud', [ $this, 'handle_import_kit_from_cloud' ], 10, 1 );
			add_filter( 'elementor/import/kit_thumbnail', [ $this, 'handle_import_kit_thumbnail' ], 10, 3 );

			add_action( 'elementor/kit_library/registered', function () {
				Plugin::$instance->data_manager_v2->register_controller( new Cloud_Kits_Controller() );
			} );
		}
	}

	public function handle_import_kit_thumbnail( $thumbnail, $kit_id, $referrer ) {
		if ( ImportExport_Module::REFERRER_KIT_LIBRARY === $referrer ) {

			if ( empty( $kit_id ) ) {
				return '';
			}

			$api = new Kit_Library_Api();
			$kit = $api->get_by_id( $kit_id );

			if ( is_wp_error( $kit ) ) {
				return '';
			}

			return $kit->thumbnail;
		}

		if ( ImportExport_Module::REFERRER_CLOUD === $referrer ) {
			if ( empty( $kit_id ) ) {
				return '';
			}

			$kit = self::get_app()->get_kit( [ 'id' => $kit_id ] );

			if ( is_wp_error( $kit ) ) {
				return '';
			}

			return $kit['thumbnailUrl'] ?? '';
		}

		return $thumbnail;
	}

	public function handle_export_kit_result( $result, $source, $export, $settings, $file ) {
		if ( ImportExport_Module::EXPORT_SOURCE_CLOUD !== $source ) {
			return $result;
		}

		unset( $result['file'] );

		$raw_screen_shot = base64_decode( substr( $settings['screenShotBlob'], strlen( 'data:image/png;base64,' ) ) );
		$title = $export['manifest']['title'];
		$description = $export['manifest']['description'];

		$kit = self::get_app()->create_kit(
			$title,
			$description,
			$file,
			$raw_screen_shot,
			$settings['include'],
		);

		if ( is_wp_error( $kit ) ) {
			return $kit;
		}

		$result['kit'] = $kit;

		return $result;
	}

	public function handle_import_kit_from_cloud( $args ) {
		$kit = self::get_app()->get_kit( [
			'id' => $args['kit_id'],
		] );

		if ( is_wp_error( $kit ) ) {
			return $kit;
		}

		if ( empty( $kit['downloadUrl'] ) ) {
			throw new \Error( ImportExport_Module::KIT_LIBRARY_ERROR_KEY ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		return [
			'file_name' => self::get_remote_kit_zip( $kit['downloadUrl'] ),
			'referrer' => ImportExport_Module::REFERRER_CLOUD,
			'file_url' => $kit['downloadUrl'],
			'kit' => $kit,
		];
	}

	public static function get_remote_kit_zip( $url ) {
		$remote_zip_request = wp_safe_remote_get( $url );

		if ( is_wp_error( $remote_zip_request ) ) {
			Plugin::$instance->logger->get_logger()->error( $remote_zip_request->get_error_message() );
			throw new \Error( ImportExport_Module::KIT_LIBRARY_ERROR_KEY ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		if ( 200 !== $remote_zip_request['response']['code'] ) {
			Plugin::$instance->logger->get_logger()->error( $remote_zip_request['response']['message'] );
			throw new \Error( ImportExport_Module::KIT_LIBRARY_ERROR_KEY ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		return Plugin::$instance->uploads_manager->create_temp_file( $remote_zip_request['body'], 'kit.zip' );
	}

	public static function get_app(): Cloud_Kits {
		$cloud_kits_app = Plugin::$instance->common->get_component( 'connect' )->get_app( 'cloud-kits' );

		if ( ! $cloud_kits_app ) {
			$error_message = esc_html__( 'Cloud-Kits is not instantiated.', 'elementor' );

			throw new \Exception( $error_message, Exceptions::FORBIDDEN ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		return $cloud_kits_app;
	}
}
