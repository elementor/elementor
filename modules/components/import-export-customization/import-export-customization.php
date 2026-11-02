<?php

namespace Elementor\Modules\Components\ImportExportCustomization;

use Elementor\App\Modules\ImportExportCustomization\Processes\Import;
use Elementor\Modules\Components\ImportExportCustomization\Runners\Import as Import_Runner;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import_Export_Customization {
	public function register_hooks(): void {
		add_action( 'elementor/import-export-customization/import-kit', function ( Import $import ) {
			$import->register( new Import_Runner(), Import::PRIORITY_COMPONENTS );
		} );
	}
}
