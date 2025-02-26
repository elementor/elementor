<?php

namespace Elementor\Modules\GlobalClasses\ImportExport;

use Elementor\App\Modules\ImportExport\Runners\Import\Import_Runner_Base;
use Elementor\App\Modules\ImportExport\Utils as ImportExportUtils;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Global_Classes_Sanitizer;
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
		return (
			isset( $data['include'] ) &&
			in_array( 'settings', $data['include'], true ) &&
			! empty( $data['site_settings']['settings'] ) &&
			! empty( $data['extracted_directory_path'] )
		);
	}

	public function import( array $data, array $imported_data ) {
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$file_name = Import_Export::FILE_NAME;
		$global_classes = ImportExportUtils::read_json_file( "{$data['extracted_directory_path']}/{$file_name}.json" );

		if ( ! $kit || ! $global_classes ) {
			return [];
		}

		$sanitized_global_classes = Global_Classes_Sanitizer::make()->sanitize( $global_classes );

		Global_Classes_Repository::make()->put(
			$sanitized_global_classes['items'],
			$sanitized_global_classes['order']
		);

		return $sanitized_global_classes;
	}
}
