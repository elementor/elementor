<?php

namespace Elementor\Modules\GlobalClasses\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Design_System_Import_Context;
use Elementor\App\Modules\ImportExportCustomization\Runners\Import\Import_Runner_Base;
use Elementor\Modules\GlobalClasses\ImportExportCustomization\Import_Export_Customization;
use Elementor\Modules\GlobalClasses\ImportExportUtils\Import_Utils;
use Elementor\Plugin;
use Elementor\Core\Kits\Documents\Kit;

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
		$global_classes_dir = $data['extracted_directory_path'] . '/' . Import_Export_Customization::DIRECTORY_NAME;
		$import_context = Design_System_Import_Context::from_data( $data );
		$conflict_resolution = $import_context->resolve_conflict_resolution( $data, 'classesOverrideAll' );

		$kit = $this->get_kit( $imported_data );

		return Import_Utils::import_classes( $global_classes_dir, [ 'conflict_resolution' => $conflict_resolution ], $kit );
	}

	private function get_kit( array $imported_data ): Kit {
		$active_kit = Plugin::$instance->kits_manager->get_active_kit();

		$was_new_kit_created = ! empty( $imported_data['site-settings']['imported_kit_id'] );

		if ( ! $was_new_kit_created ) {
			return $active_kit;
		}

		$previous_kit_id = Plugin::$instance->kits_manager->get_previous_id();

		if ( ! $previous_kit_id ) {
			return $active_kit;
		}

		$previous_kit = Plugin::$instance->kits_manager->get_kit( $previous_kit_id );

		if ( ! $previous_kit ) {
			return $active_kit;
		}

		return $previous_kit;
	}
}
