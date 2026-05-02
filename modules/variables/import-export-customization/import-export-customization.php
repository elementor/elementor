<?php

namespace Elementor\Modules\Variables\ImportExportCustomization;

use Elementor\App\Modules\ImportExportCustomization\Processes\Export;
use Elementor\App\Modules\ImportExportCustomization\Processes\Import;
use Elementor\Modules\Variables\ImportExportCustomization\Runners\Export as Export_Runner;
use Elementor\Modules\Variables\ImportExportCustomization\Runners\Import as Import_Runner;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import_Export_Customization {
	const FILE_NAME = 'global-variables';

	public function register_hooks() {
		add_action( 'elementor/import-export-customization/export-kit', function ( Export $export ) {
			$export->register( new Export_Runner() );
		} );

		add_action( 'elementor/import-export-customization/import-kit', function ( Import $import ) {
			$import->register( new Import_Runner() );
		} );
	}
}
