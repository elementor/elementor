<?php
namespace Elementor\Core\App\Modules\ImportExport;

use Elementor\Core\App\Modules\ImportExport\Directories\Root;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Import extends Iterator {

	final public function run() {
		$extraction_result = Plugin::$instance->uploads_manager->extract_and_validate_zip( $this->get_settings( 'file_name' ), [ 'json', 'xml' ] );

		$this->temp_dir = $extraction_result['temp_extraction_directory'];

		$settings = $this->read_json_file( 'manifest' );

		$root_directory = new Root( $this );

		$import_result = $root_directory->run_import( $settings );

		Plugin::$instance->uploads_manager->remove_file_or_dir( $this->temp_dir );

		return $import_result;
	}

	final public function read_json_file( $name ) {
		$name = $this->get_archive_file_full_path( $name . '.json' );

		return json_decode( file_get_contents( $name ), true );
	}
}
