<?php

namespace Elementor\Modules\GlobalClasses\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Runners\Import\Import_Runner_Base;
use Elementor\Modules\GlobalClasses\ImportExportUtils\Import_Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import extends Import_Runner_Base {
	public static function get_name(): string {
		return 'global-classes';
	}

	public function should_import( array $data ): bool {
		$is_settings_import = in_array( 'settings', $data['include'] ?? [], true );
		$is_design_system_import = in_array( 'design-system', $data['include'] ?? [], true );

		return (
			( $is_settings_import || $is_design_system_import ) &&
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
		$conflict_resolution = $data['customization']['design-system']['conflict_resolution'] ?? 'skip';

		return Import_Utils::import_classes( $data['extracted_directory_path'] . '/global-classes', [ 'conflict_resolution' => $conflict_resolution ] );
	}
}
