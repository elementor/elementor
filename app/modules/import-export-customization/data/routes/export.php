<?php
namespace Elementor\App\Modules\ImportExportCustomization\Data\Routes;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Export extends Base_Route {

	public function get_route(): string {
		return 'export';
	}

	public function get_method(): string {
		return 'POST';
	}

	public function callback( $request ): \WP_REST_Response {
		try {
			$settings = [
				'include' => $request->get_param( 'include' ) ?: [],
				'kitInfo' => $request->get_param( 'kitInfo' ) ?: [],
				'plugins' => $request->get_param( 'plugins' ) ?: [],
				'selectedCustomPostTypes' => $request->get_param( 'selectedCustomPostTypes' ) ?: [],
			];

			$settings = array_filter( $settings );

			$module = Plugin::$instance->app->get_component( 'import-export-customization' );

			$export_result = $module->export_kit( $settings );

			Plugin::$instance->logger->get_logger()->info( 'Kit export completed via REST API' );

			return Response::success( $export_result );

		} catch ( \Error | \Exception $e ) {
			Plugin::$instance->logger->get_logger()->error( $e->getMessage(), [
				'meta' => [
					'trace' => $e->getTraceAsString(),
				],
			] );

			return Response::error( 'export_error', $e->getMessage() );
		}
	}

	public function get_args(): array {
		return [
			'include' => [
				'type' => 'array',
				'description' => 'Content types to include in export',
				'required' => false,
				'default' => [],
			],
			'kitInfo' => [
				'type' => 'object',
				'description' => 'Kit information',
				'required' => false,
				'default' => [],
			],
			'plugins' => [
				'type' => 'array',
				'description' => 'Selected plugins to export',
				'required' => false,
				'default' => [],
			],
			'selectedCustomPostTypes' => [
				'type' => 'array',
				'description' => 'Selected custom post types',
				'required' => false,
				'default' => [],
			],
		];
	}
}
