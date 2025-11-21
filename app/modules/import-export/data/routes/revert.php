<?php
namespace Elementor\App\Modules\ImportExport\Data\Routes;

use Elementor\App\Modules\ImportExport\Module as ImportExportModule;
use Elementor\Plugin;
use Elementor\App\Modules\ImportExport\Data\Response;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Revert extends Base_Route {

	protected function get_route(): string {
		return 'revert';
	}

	protected function get_method(): string {
		return \WP_REST_Server::CREATABLE;
	}

	protected function callback( $request ): \WP_REST_Response {
		/**
		 * @var $module ImportExportModule
		 */
		$module = Plugin::$instance->app->get_component( 'import-export' );

		try {
			$revert_result = $module->revert_last_imported_kit();

			Plugin::$instance->logger->get_logger()->info( 'Kit revert completed via REST API' );

			return Response::success( $revert_result );

		} catch ( \Error | \Exception $e ) {
			Plugin::$instance->logger->get_logger()->error( $e->getMessage(), [
				'meta' => [
					'trace' => $e->getTraceAsString(),
				],
			] );

			$frame = $e->getTrace()[0] ?? [];
			$class = $frame['class'] ?? '';
			if ( $module->is_third_party_class( $class ) ) {
				return Response::error( ImportExportModule::THIRD_PARTY_ERROR, $e->getMessage() );
			}

			return Response::error( 'revert_error', $e->getMessage() );
		}
	}

	protected function get_args(): array {
		return [];
	}
}
