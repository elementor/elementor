<?php
namespace Elementor\Core\App\Modules\ImportExport;

use Elementor\Core\App\Modules\ImportExport\Directories\Root;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Import extends Iterator {

	private $files_base_dir;

	final public function run() {
		$wp_upload_dir = wp_upload_dir();

		$this->files_base_dir = $wp_upload_dir['basedir'] . '/elementor/tmp/kit/';

		$zip = new \ZipArchive();

		$zip->open( $_FILES['e_import_file']['tmp_name'] );

		$zip->extractTo( $this->files_base_dir );

		$settings = $this->read_json_file( 'manifest' );

		$root_directory = new Root( $this );

		$import_result = $root_directory->run_import( $settings );

		$this->remove_dir( $this->files_base_dir );

		return $import_result;
	}

	final public function read_json_file( $name ) {
		$name = $this->files_base_dir . $this->get_archive_file_path( $name . '.json' );

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

		rmdir( $dir );
	}
}
