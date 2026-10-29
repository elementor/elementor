<?php

namespace Elementor\Modules\Components\ImportExportCustomization;

use Elementor\App\Modules\ImportExportCustomization\Processes\Export;
use Elementor\App\Modules\ImportExportCustomization\Processes\Import;
use Elementor\App\Modules\ImportExportCustomization\Processes\Revert;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\ImportExportCustomization\Runners\Export as Export_Runner;
use Elementor\Modules\Components\ImportExportCustomization\Runners\Import as Import_Runner;
use Elementor\Modules\Components\ImportExportCustomization\Runners\Revert as Revert_Runner;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import_Export_Customization {
	const CONTENT_DIRECTORY = 'content/' . Component_Document::TYPE . '/';
	const DEPENDENCIES_FILE_PATH = self::CONTENT_DIRECTORY . 'dependencies';

	public function register_hooks(): void {
		add_action( 'elementor/import-export-customization/export-kit', function ( Export $export ) {
			$export->register( new Export_Runner() );
		} );

		add_action( 'elementor/import-export-customization/import-kit', function ( Import $import ) {
			$import->register( new Import_Runner(), Import::PRIORITY_COMPONENTS );
		} );

		add_action( 'elementor/import-export-customization/revert-kit', function ( Revert $revert ) {
			$revert->register( new Revert_Runner() );
		} );
	}
}
