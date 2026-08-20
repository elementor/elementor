<?php

namespace Elementor\Modules\DefaultStyles\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Design_System_Import_Context;
use Elementor\App\Modules\ImportExportCustomization\Runners\Import\Import_Runner_Base;
use Elementor\App\Modules\ImportExportCustomization\Utils as ImportExportUtils;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\DefaultStyles\Default_Styles_Repository;
use Elementor\Modules\DefaultStyles\ImportExportCustomization\Import_Export_Customization;
use Elementor\Modules\DefaultStyles\Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import extends Import_Runner_Base {
	public static function get_name(): string {
		return 'default-styles';
	}

	public function should_import( array $data ): bool {
		$import_context = Design_System_Import_Context::from_data( $data );

		return (
			$import_context->is_included() &&
			! empty( $data['extracted_directory_path'] ) &&
			$this->is_feature_active()
		);
	}

	private function is_feature_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( Module::EXPERIMENT_NAME )
			&& Plugin::$instance->experiments->is_feature_active( Atomic_Widgets_Module::EXPERIMENT_NAME );
	}

	public function import( array $data, array $imported_data ): array {
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$default_styles_dir = $data['extracted_directory_path'] . '/' . Import_Export_Customization::DIRECTORY_NAME;

		if ( ! $kit || ! is_dir( $default_styles_dir ) ) {
			return [];
		}

		$repository = Default_Styles_Repository::make( $kit );
		$imported_tags = [];

		foreach ( glob( $default_styles_dir . '/*.json' ) as $file_path ) {
			$tag = basename( $file_path, '.json' );

			if ( ! Default_Styles_Repository::is_allowed_tag( $tag ) ) {
				continue;
			}

			$style_data = ImportExportUtils::read_json_file( $file_path );

			if ( ! $style_data ) {
				continue;
			}

			if ( ! $repository->put( $tag, $style_data ) ) {
				continue;
			}

			$imported_tags[] = $tag;
		}

		return [
			'imported' => $imported_tags,
		];
	}
}
