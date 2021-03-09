<?php
namespace Elementor\Core\App\Modules\ImportExport;

use Elementor\Core\App\Modules\ImportExport\Directories\Root;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Import extends Iterator {

	final public function run() {
		$zip = new \ZipArchive();

		$zip->open( $this->get_settings( 'file_name' ) );

		$temp_dir = $this->get_temp_dir();

		$zip->extractTo( $temp_dir );

		$settings = $this->read_json_file( 'manifest' );

		$root_directory = new Root( $this );

		$import_result = $root_directory->run_import( $settings );

		$this->remove_dir( $temp_dir );

		return $import_result;
	}

	final public function read_json_file( $name ) {
		$name = $this->get_temp_dir() . $this->get_archive_file_path( $name . '.json' );

		return json_decode( file_get_contents( $name ), true );
	}

	private function remove_dir( $dir ) {
		$dir_iterator = new \RecursiveDirectoryIterator( $dir, \RecursiveDirectoryIterator::SKIP_DOTS );

		foreach ( new \RecursiveIteratorIterator( $dir_iterator, \RecursiveIteratorIterator::CHILD_FIRST ) as $name => $item ) {
			if ( is_dir( $name ) ) {
				rmdir( $name );
			} else {
				unlink( $name );
			}
		}

		return rmdir( $dir );
	}
}
