<?php
namespace Elementor\App\Modules\ImportExportCustomization\Data\Routes;

use Elementor\Plugin;
use Elementor\App\Modules\ImportExportCustomization\Data\Response;
use Elementor\Utils as ElementorUtils;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Export extends Base_Route {

	protected function get_route(): string {
		return 'export';
	}

	protected function get_method(): string {
		return \WP_REST_Server::CREATABLE;
	}

	protected function callback( $request ): \WP_REST_Response {
		try {
			$settings = [
				'include' => $request->get_param( 'include' ),
				'kitInfo' => $request->get_param( 'kitInfo' ),
				'screenShotBlob' => $request->get_param( 'screenShotBlob' ),
				'customization' => $request->get_param( 'customization' ),
				'plugins' => $request->get_param( 'plugins' ),
				'selectedCustomPostTypes' => $request->get_param( 'selectedCustomPostTypes' ),
			];

			$settings = array_filter( $settings );

			$source = $settings['kitInfo']['source'];

			$module = Plugin::$instance->app->get_component( 'import-export-customization' );

			$export = $module->export_kit( $settings );

			$file_name = $export['file_name'];
			$file = ElementorUtils::file_get_contents( $file_name );

			if ( ! $file ) {
				throw new \Error( 'Could not read the exported file.' );
			}

			Plugin::$instance->uploads_manager->remove_file_or_dir( dirname( $file_name ) );

			$result = apply_filters(
				'elementor/export/kit/export-result',
				[
					'manifest' => $export['manifest'],
					'file' => base64_encode( $file ),
				],
				$source,
				$export,
				$settings,
				$file,
			);

			if ( is_wp_error( $result ) ) {
				throw new \Error( $result->get_error_message() );
			}

			return Response::success( $result );

		} catch ( \Error | \Exception $e ) {
			Plugin::$instance->logger->get_logger()->error( $e->getMessage(), [
				'meta' => [
					'trace' => $e->getTraceAsString(),
				],
			] );

			return Response::error( 'export_error', $e->getMessage() );
		}
	}

	protected function get_args(): array {
		return [
			'include' => [
				'type' => 'array',
				'description' => 'Content types to include in export',
				'required' => false,
				'default' => [ 'templates', 'content', 'settings', 'plugins' ],
			],
			'kitInfo' => [
				'type' => 'object',
				'description' => 'Kit information',
				'required' => false,
				'default' => [
					'title' => 'Elementor Website Template',
					'description' => '',
					'source' => 'local',
				],
			],
			'screenShotBlob' => [
				'type' => [ 'string', 'null' ],
				'description' => 'Base64 encoded screenshot for cloud exports',
				'required' => false,
				'default' => null,
			],
			'customization' => [
				'type' => 'object',
				'description' => 'Customization settings for selective export',
				'required' => false,
				'default' => null,
				'properties' => [
					'settings' => [
						'type' => [ 'object', 'null' ],
						'description' => 'Site settings customization',
					],
					'templates' => [
						'type' => [ 'object', 'null' ],
						'description' => 'Templates customization',
					],
					'content' => [
						'type' => [ 'object', 'null' ],
						'description' => 'Content customization',
					],
					'plugins' => [
						'type' => [ 'object', 'null' ],
						'description' => 'Plugins customization',
					],
				],
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
