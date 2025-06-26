<?php
namespace Elementor\App\Modules\ImportExportCustomization\Data\Routes;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Upload extends Base_Route {
	protected function get_route(): string {
		return 'upload';
	}

	protected function get_method(): string {
		return \WP_REST_Server::CREATABLE;
	}

	protected function callback( $request ): \WP_REST_Response {
		try {
			$file_url = $request->get_param( 'file_url' );
			$kit_id = $request->get_param( 'kit_id' );
			$source = $request->get_param( 'source' );
			$module = Plugin::$instance->app->get_component( 'import-export-customization' );

			$is_import_from_library = ! empty( $file_url );

			if ( $is_import_from_library ) {
				if ( ! filter_var( $file_url, FILTER_VALIDATE_URL ) || 0 !== strpos( $file_url, 'http' ) ) {
					return Response::error( 'Invalid kit library URL.', 'invalid_kit_library_url' );
				}

				$import_result = apply_filters( 'elementor/import/kit/result', [ 'file_url' => $file_url ] );
			} elseif ( ! empty( $source ) ) {
				$import_result = apply_filters( 'elementor/import/kit/result/' . $source, [
					'kit_id' => $kit_id,
					'source' => $source,
				] );
			} else {
				$files = $request->get_file_params();
				$file = $files['e_import_file'] ?? null;

				if ( empty( $file ) || empty( $file['tmp_name'] ) ) {
					return Response::error( 'No file uploaded or upload error occurred.', 'no_file_uploaded' );
				}

				$import_result = [
					'file_name' => $file['tmp_name'],
					'referrer' => $module::REFERRER_LOCAL,
				];
			}

			Plugin::$instance->logger->get_logger()->info( 'Uploading Kit via REST API: ', [
				'meta' => [
					'kit_id' => $kit_id,
					'referrer' => $import_result['referrer'] ?? 'unknown',
				],
			] );

			if ( is_wp_error( $import_result ) ) {
				return Response::error( $import_result->get_error_message(), 'upload_error' );
			}

			$uploaded_kit = $module->upload_kit( $import_result['file_name'], $import_result['referrer'], $kit_id );

			$result = [
				'session' => $uploaded_kit['session'],
				'manifest' => $uploaded_kit['manifest'],
			];

			if ( ! empty( $import_result['file_url'] ) ) {
				$result['file_url'] = $import_result['file_url'];
			}

			if ( ! empty( $import_result['kit'] ) ) {
				$result['uploaded_kit'] = $import_result['kit'];
			}

			if ( ! empty( $uploaded_kit['conflicts'] ) ) {
				$result['conflicts'] = $uploaded_kit['conflicts'];
			}

			// Clean up temporary files
			if ( $is_import_from_library || ! empty( $source ) ) {
				Plugin::$instance->uploads_manager->remove_file_or_dir( dirname( $import_result['file_name'] ) );
			}

			return Response::success( $result );

		} catch ( \Error $e ) {
			Plugin::$instance->logger->get_logger()->error( $e->getMessage(), [
				'meta' => [
					'trace' => $e->getTraceAsString(),
				],
			] );

			return Response::error( $e->getMessage(), 'upload_error' );
		}
	}

	protected function get_args(): array {
		return [
			'file_url' => [
				'type' => 'string',
				'description' => 'File URL for upload action',
				'required' => false,
				'validate_callback' => function ( $value ) {
					if ( empty( $value ) ) {
						return true;
					}
					return filter_var( $value, FILTER_VALIDATE_URL );
				},
			],
			'kit_id' => [
				'type' => 'string',
				'description' => 'Kit ID for upload action',
				'required' => false,
			],
			'source' => [
				'type' => 'string',
				'description' => 'Source for upload action',
				'required' => false,
			],
		];
	}
}
