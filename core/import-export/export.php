<?php
namespace Elementor\Core\Import_Export;

use Elementor\Core\Base\Base_Object;
use Elementor\Core\Import_Export\Directories\Root;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Export extends Base_Object {

	/**
	 * @var \ZipArchive
	 */
	private $zip_archive;

	private $current_archive_path = '';

	private function get_archive_file_path( $file_name ) {
		return $this->get_current_archive_path() . $file_name;
	}

	private function init_zip_archive() {
		$zip_archive = new \ZipArchive();

		$zip_archive->open( $this->get_archive_file_name(), \ZipArchive::CREATE | \ZipArchive::OVERWRITE );

		$this->zip_archive = $zip_archive;
	}

	private function get_archive_relative_file_name() {
		return 'kit.zip';
	}

	private function get_archive_file_name() {
		return __DIR__ . DIRECTORY_SEPARATOR . $this->get_archive_relative_file_name();
	}

	protected function get_init_settings() {
		return $_GET[ Manager::EXPORT_TRIGGER_KEY ];
	}

	public function get_current_archive_path() {
		return $this->current_archive_path;
	}

	public function set_current_archive_path( $path ) {
		if ( $path ) {
			$path .= DIRECTORY_SEPARATOR;
		}

		$this->current_archive_path = $path;
	}

	public function add_json_file( $name, $content, $json_flags = null ) {
		$this->zip_archive->addFromString( $this->get_archive_file_path( $name . '.json' ), json_encode( $content, $json_flags ) );
	}

	public function run() {
		$this->init_zip_archive();

		$root_directory = new Root( $this );

		$manifest_data = $root_directory->run_export();

		$this->set_current_archive_path( '' );

		$this->add_json_file( 'manifest', $manifest_data, JSON_PRETTY_PRINT );

		$this->zip_archive->close();

		$file_name = $this->get_archive_file_name();

		header( 'Content-type: application/zip' );

		header( 'Content-Disposition: attachment; filename=' . $this->get_archive_relative_file_name() );

		header( 'Content-length: ' . filesize( $file_name ));

		readfile( $file_name );

		unlink( $file_name );

		die;
	}
}
