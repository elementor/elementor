<?php
namespace Elementor\App\Modules\ImportExportCustomization\Data\Routes;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Revert extends Base_Route {

	public function get_route(): string {
		return 'revert';
	}

	public function get_method(): string {
		return 'POST';
	}

	public function callback( $request ): \WP_REST_Response {
		try {
			$module = Plugin::$instance->app->get_component( 'import-export-customization' );

			$module->revert_last_imported_kit();

			Plugin::$instance->logger->get_logger()->info( 'Kit revert completed via REST API' );

			return Response::success([
				'status' => 'success',
				'message' => 'Kit reverted successfully',
			]);

		} catch ( \Error $e ) {
			Plugin::$instance->logger->get_logger()->error( $e->getMessage(), [
				'meta' => [
					'trace' => $e->getTraceAsString(),
				],
			] );

			return Response::error( $e->getMessage(), 'revert_error' );
		}
	}

	public function get_args(): array {
		return [];
	}
}
