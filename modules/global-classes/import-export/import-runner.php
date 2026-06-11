<?php

namespace Elementor\Modules\GlobalClasses\ImportExport;

use Elementor\App\Modules\ImportExport\Runners\Import\Import_Runner_Base;
use Elementor\App\Modules\ImportExport\Utils as ImportExportUtils;
use Elementor\Modules\GlobalClasses\Global_Classes_Parser;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Import_Runner extends Import_Runner_Base {
	public static function get_name(): string {
		return 'global-classes';
	}

	public function should_import( array $data ) {
		// Same as the site-settings runner.
		$has_include        = isset( $data['include'] );
		$has_settings       = $has_include && in_array( 'settings', $data['include'], true );
		$has_site_settings  = ! empty( $data['site_settings']['settings'] );
		$has_directory      = ! empty( $data['extracted_directory_path'] );
		$result             = $has_settings && $has_site_settings && $has_directory;

		// #region agent log
		$log_payload = [
			'sessionId'   => 'a2248d',
			'location'    => 'import-runner.php:should_import',
			'message'     => 'ImportRunner::should_import called',
			'hypothesisId' => 'A',
			'data'        => [
				'has_include'       => $has_include,
				'has_settings'      => $has_settings,
				'has_site_settings' => $has_site_settings,
				'has_directory'     => $has_directory,
				'result'            => $result,
				'include'           => $data['include'] ?? null,
				'directory'         => $data['extracted_directory_path'] ?? null,
			],
			'timestamp'   => round( microtime( true ) * 1000 ),
		];
		file_put_contents(
			'/Users/ronros/Local Sites/multi-local-site-1/app/public/wp-content/plugins/.cursor/debug-a2248d.log',
			json_encode( $log_payload ) . "\n",
			FILE_APPEND
		);
		// #endregion

		return $result;
	}

	public function import( array $data, array $imported_data ) {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$file_name = Import_Export::FILE_NAME;
		$json_path = "{$data['extracted_directory_path']}/{$file_name}.json";
		$global_classes = ImportExportUtils::read_json_file( $json_path );

		// #region agent log
		$log_payload = [
			'sessionId'    => 'a2248d',
			'location'     => 'import-runner.php:import',
			'message'      => 'ImportRunner::import entry',
			'hypothesisId' => 'B',
			'data'         => [
				'kit_id'          => $kit ? $kit->get_id() : null,
				'json_path'       => $json_path,
				'file_exists'     => file_exists( $json_path ),
				'global_classes'  => $global_classes ? array_keys( $global_classes ) : null,
				'classes_count'   => ! empty( $global_classes['items'] ) ? count( $global_classes['items'] ) : 0,
				'order_count'     => ! empty( $global_classes['order'] ) ? count( $global_classes['order'] ) : 0,
			],
			'timestamp'    => round( microtime( true ) * 1000 ),
		];
		file_put_contents(
			'/Users/ronros/Local Sites/multi-local-site-1/app/public/wp-content/plugins/.cursor/debug-a2248d.log',
			json_encode( $log_payload ) . "\n",
			FILE_APPEND
		);
		// #endregion

		if ( ! $kit || ! $global_classes ) {
			// #region agent log
			$bail_payload = [
				'sessionId'    => 'a2248d',
				'location'     => 'import-runner.php:import:bail',
				'message'      => 'ImportRunner::import - early return: no kit or no classes',
				'hypothesisId' => 'B',
				'data'         => [ 'kit' => (bool) $kit, 'global_classes' => (bool) $global_classes ],
				'timestamp'    => round( microtime( true ) * 1000 ),
			];
			file_put_contents(
				'/Users/ronros/Local Sites/multi-local-site-1/app/public/wp-content/plugins/.cursor/debug-a2248d.log',
				json_encode( $bail_payload ) . "\n",
				FILE_APPEND
			);
			// #endregion
			return [];
		}

		$global_classes['order'] = Global_Classes_Parser::sanitize_order(
			$global_classes['items'] ?? [],
			$global_classes['order'] ?? []
		);

		$global_classes_result = Global_Classes_Parser::make()->parse( $global_classes );

		// #region agent log
		$parse_payload = [
			'sessionId'    => 'a2248d',
			'location'     => 'import-runner.php:import:parse',
			'message'      => 'ImportRunner::import - parse result',
			'hypothesisId' => 'C',
			'data'         => [
				'is_valid' => $global_classes_result->is_valid(),
				'errors'   => $global_classes_result->is_valid() ? null : $global_classes_result->errors()->to_string(),
			],
			'timestamp'    => round( microtime( true ) * 1000 ),
		];
		file_put_contents(
			'/Users/ronros/Local Sites/multi-local-site-1/app/public/wp-content/plugins/.cursor/debug-a2248d.log',
			json_encode( $parse_payload ) . "\n",
			FILE_APPEND
		);
		// #endregion

		if ( ! $global_classes_result->is_valid() ) {
			return [];
		}

		$global_classes = $global_classes_result->unwrap();

		Global_Classes_Repository::make( $kit )->put(
			$global_classes['items'],
			$global_classes['order']
		);

		// #region agent log
		$put_payload = [
			'sessionId'    => 'a2248d',
			'location'     => 'import-runner.php:import:put',
			'message'      => 'ImportRunner::import - put completed',
			'hypothesisId' => 'E',
			'data'         => [
				'items_count' => count( $global_classes['items'] ),
				'order_count' => count( $global_classes['order'] ),
			],
			'timestamp'    => round( microtime( true ) * 1000 ),
		];
		file_put_contents(
			'/Users/ronros/Local Sites/multi-local-site-1/app/public/wp-content/plugins/.cursor/debug-a2248d.log',
			json_encode( $put_payload ) . "\n",
			FILE_APPEND
		);
		// #endregion

		return $global_classes;
	}
}
