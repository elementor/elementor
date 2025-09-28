<?php
namespace Elementor\App\Modules\ImportExportCustomization\Data\Routes;

use Elementor\Plugin;
use Elementor\App\Modules\ImportExportCustomization\Data\Response;
use Elementor\App\Modules\ImportExportCustomization\Module as ImportExportCustomizationModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Process_Media extends Base_Route {

	protected function get_route(): string {
		return 'process-media';
	}

	protected function get_method(): string {
		return \WP_REST_Server::CREATABLE;
	}

	protected function callback( $request ): \WP_REST_Response {
		/**
		 * @var $module ImportExportCustomizationModule
		 */
		$module = Plugin::$instance->app->get_component( 'import-export-customization' );

		try {
			$media_urls = $request->get_param( 'media_urls' );

			if ( empty( $media_urls ) || ! is_array( $media_urls ) ) {
				throw new \Error( 'Invalid media URLs provided' );
			}

			$media_collector = new \Elementor\TemplateLibrary\Classes\Media_Collector();
			$result = $media_collector->process_media_collection( $media_urls );

			$media_collector->cleanup();

			return Response::success( $result );

		} catch ( \Error | \Exception $e ) {
			Plugin::$instance->logger->get_logger()->error( $e->getMessage(), [
				'meta' => [
					'trace' => $e->getTraceAsString(),
				],
			] );

			if ( $module->is_third_party_class( $e->getTrace()[0]['class'] ) ) {
				return Response::error( ImportExportCustomizationModule::THIRD_PARTY_ERROR, $e->getMessage() );
			}

			return Response::error( $e->getMessage(), 'media_processing_error' );
		}
	}

	protected function get_args(): array {
		return [
			'media_urls' => [
				'type' => 'array',
				'description' => 'Array of media URLs to process',
				'required' => true,
				'items' => [
					'type' => 'string',
				],
			],
		];
	}
}
