<?php

namespace Elementor\Modules\ImportExportDesignSystem;

use Elementor\Core\Utils\Api\Error_Builder;
use Elementor\Core\Utils\Api\Response_Builder;
use Elementor\Modules\ImportExportDesignSystem\Processes\Export;
use Elementor\Modules\ImportExportDesignSystem\Processes\Import;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import_Export_Design_System_REST_API {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'import-export-design-system';

	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	private function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/export', [
			[
				'methods' => 'POST',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->export( $request ) ),
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/import', [
			[
				'methods' => 'POST',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->import( $request ) ),
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
				'args' => [
					'conflictResolution' => [
						'type' => 'string',
						'required' => true,
						'enum' => [ 'skip', 'replace' ],
					],
				],
			],
		] );
	}

	private function export( \WP_REST_Request $request ) {
		$export = new Export();

		$result = $export->run();

		if ( is_wp_error( $result ) ) {
			return Error_Builder::make( $result->get_error_code() )
				->set_status( 400 )
				->set_message( $result->get_error_message() )
				->build();
		}

		return Response_Builder::make( $result )->build();
	}

	private function import( \WP_REST_Request $request ) {
		$file = $request->get_file_params()['e_import_file'] ?? null;
		$conflict_resolution = $request->get_param( 'conflictResolution' );

		if ( ! $file || empty( $file['tmp_name'] ) ) {
			return Error_Builder::make( 'missing-file' )
				->set_status( 400 )
				->set_message( __( 'No file was uploaded.', 'elementor' ) )
				->build();
		}

		$import = new Import( $file['tmp_name'], $conflict_resolution );

		$result = $import->run();

		if ( is_wp_error( $result ) ) {
			return Error_Builder::make( $result->get_error_code() )
				->set_status( 400 )
				->set_message( $result->get_error_message() )
				->build();
		}

		return Response_Builder::make( $result )->build();
	}

	private function route_wrapper( callable $cb ) {
		try {
			$response = $cb();
		} catch ( \Exception $e ) {
			return Error_Builder::make( 'unexpected_error' )
				->set_message( __( 'Something went wrong', 'elementor' ) )
				->build();
		}

		return $response;
	}
}
