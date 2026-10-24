<?php

namespace Elementor\Modules\GlobalClasses\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Design_System_Import_Context;
use Elementor\App\Modules\ImportExportCustomization\Kit_Context;
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

		return (
			$import_context->is_included() &&
			! empty( $data['extracted_directory_path'] ) &&
			$this->is_classes_enabled( $data )
		);
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

		if ( $this->is_legacy_import_format( $data ) ) {
			$global_classes_file = $data['extracted_directory_path'] . '/' . Import_Export_Customization::FILE_NAME . '.json';
			$result = Legacy_Import_Utils::import_classes( $global_classes_file, $conflict_resolution );
			$this->store_context_mappings( $data, $result );

			return $result;
		}

		$global_classes_dir = $data['extracted_directory_path'] . '/' . Import_Export_Customization::DIRECTORY_NAME;
		$result = Import_Utils::import_classes( $global_classes_dir, [ 'conflict_resolution' => $conflict_resolution ] );
		$this->store_context_mappings( $data, $result );

		return $result;
	}

	protected function is_legacy_import_format( array $data ): bool {
		$manifest = $data['manifest'];
		$elementor_version = $manifest['elementor_version'];

		return version_compare( $elementor_version, '4.1.0-beta1', '<' );
	}

	private function store_context_mappings( array $data, array $result ): void {
		if ( ! isset( $data['context'] ) || ! ( $data['context'] instanceof Kit_Context ) ) {
			return;
		}

		$group = $data['context']->group( Kit_Context::GROUP_GLOBAL_CLASSES );

		foreach ( [ 'created', 'renamed', 'replaced' ] as $bucket ) {
			foreach ( $result[ $bucket ] ?? [] as $entry ) {
				if ( empty( $entry['import_entry']['id'] ) ) {
					continue;
				}

				$group->put(
					$entry['import_entry']['id'],
					$entry['result_entry']['id'] ?? $entry['import_entry']['id']
				);
			}
		}
	}
}
