<?php

namespace Elementor\Modules\GlobalClasses\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Runners\Import\Import_Runner_Base;
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
		$classes_included = null !== $this->get_include_type( $data );

		return (
			$classes_included &&
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
		$global_classes_dir = $data['extracted_directory_path'] . '/global-classes';
		$conflict_resolution = $this->get_conflict_resolution( $data );

		$kit = $this->get_kit( $imported_data );

		return Import_Utils::import_classes( $global_classes_dir, [ 'conflict_resolution' => $conflict_resolution ], $kit );
	}

	private function get_conflict_resolution( array $data ): string {
		$include_type = $this->get_include_type( $data );

		switch ( $include_type ) {
			case 'settings':
				return ! empty( $data['customization']['settings']['classesOverrideAll'] )
					? 'override-all'
					: 'merge';
			case 'design-system':
				return $data['customization']['design-system']['conflict_resolution'] ?? 'skip';
			default:
				throw new \Exception( 'Classes should not be imported.' );
		}
	}

	private function get_include_type( array $data ): ?string {
		$is_settings_import = in_array( 'settings', $data['include'] ?? [], true );
		$is_design_system_import = in_array( 'design-system', $data['include'] ?? [], true );

		$include = null;
		if ( $is_settings_import ) {
			$include = 'settings';
		} elseif ( $is_design_system_import ) {
			$include = 'design-system';
		}

		return $include;
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
