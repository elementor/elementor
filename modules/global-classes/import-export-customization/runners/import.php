<?php

namespace Elementor\Modules\GlobalClasses\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Design_System_Import_Context;
use Elementor\App\Modules\ImportExportCustomization\Runners\Import\Import_Runner_Base;
use Elementor\Modules\GlobalClasses\ImportExportCustomization\Import_Export_Customization;
use Elementor\Modules\GlobalClasses\ImportExportUtils\Import_Utils;
use Elementor\Plugin;
use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\ImportExportUtils\Legacy_Import_Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import extends Import_Runner_Base {
	public static function get_name(): string {
		return 'global-classes';
	}

	public function should_import( array $data ): bool {
		$import_context = Design_System_Import_Context::from_data( $data );
		$is_included = $import_context->is_included();
		$has_directory = ! empty( $data['extracted_directory_path'] );
		$classes_enabled = $this->is_classes_enabled( $data );
		$result = $is_included && $has_directory && $classes_enabled;

		// #region agent log
		$log_payload = [
			'sessionId'    => 'a2248d',
			'location'     => 'import-export-customization/runners/import.php:should_import',
			'message'      => 'Customization ImportRunner::should_import called',
			'hypothesisId' => 'A',
			'data'         => [
				'is_included'     => $is_included,
				'has_directory'   => $has_directory,
				'classes_enabled' => $classes_enabled,
				'result'          => $result,
			],
			'timestamp'    => round( microtime( true ) * 1000 ),
		];
		file_put_contents(
			'/Users/ronros/Local Sites/multi-local-site-1/app/public/wp-content/plugins/.cursor/debug-a2248d.log',
			json_encode( $log_payload ) . "\n",
			FILE_APPEND
		);
		// #endregion

		return $result;
	}

	private function is_classes_enabled( array $data ): bool {
		if ( isset( $data['customization']['settings']['classes'] ) ) {
			return (bool) $data['customization']['settings']['classes'];
		}

		return true;
	}

	public function import( array $data, array $imported_data ): array {
		$import_context = Design_System_Import_Context::from_data( $data );
		$conflict_resolution = $import_context->resolve_conflict_resolution( $data, 'classesOverrideAll' );
		$is_legacy = $this->is_legacy_import_format( $data );

		// #region agent log
		$log_payload = [
			'sessionId'    => 'a2248d',
			'location'     => 'import-export-customization/runners/import.php:import',
			'message'      => 'Customization ImportRunner::import entry',
			'hypothesisId' => 'B',
			'data'         => [
				'is_legacy'           => $is_legacy,
				'conflict_resolution' => $conflict_resolution,
				'elementor_version'   => $data['manifest']['elementor_version'] ?? null,
				'extracted_path'      => $data['extracted_directory_path'] ?? null,
			],
			'timestamp'    => round( microtime( true ) * 1000 ),
		];
		file_put_contents(
			'/Users/ronros/Local Sites/multi-local-site-1/app/public/wp-content/plugins/.cursor/debug-a2248d.log',
			json_encode( $log_payload ) . "\n",
			FILE_APPEND
		);
		// #endregion

		if ( $is_legacy ) {
			$global_classes_file = $data['extracted_directory_path'] . '/' . Import_Export_Customization::FILE_NAME . '.json';
			return Legacy_Import_Utils::import_classes( $global_classes_file, $conflict_resolution );
		}

		$global_classes_dir = $data['extracted_directory_path'] . '/' . Import_Export_Customization::DIRECTORY_NAME;
		return Import_Utils::import_classes( $global_classes_dir, [ 'conflict_resolution' => $conflict_resolution ] );
	}

	protected function is_legacy_import_format( array $data ): bool {
		$manifest = $data['manifest'];
		$elementor_version = $manifest['elementor_version'];

		return version_compare( $elementor_version, '4.1.0-beta1', '<' );
	}
}
