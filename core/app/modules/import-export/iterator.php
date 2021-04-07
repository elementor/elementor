<?php
namespace Elementor\Core\App\Modules\ImportExport;

use Elementor\Core\Base\Base_Object;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Iterator extends Base_Object {

	private $current_archive_path = '';

	private $temp_dir;

	abstract public function run();

	protected function get_archive_file_path( $file_name ) {
		return $this->get_current_archive_path() . $file_name;
	}

	protected function get_temp_dir() {
		if ( ! $this->temp_dir ) {
			$wp_upload_dir = wp_upload_dir();

			$this->temp_dir = implode( DIRECTORY_SEPARATOR, [ $wp_upload_dir['basedir'], 'elementor', 'tmp', 'kit' ] ) . DIRECTORY_SEPARATOR;

			if ( ! is_dir( $this->temp_dir ) ) {
				wp_mkdir_p( $this->temp_dir );
			}
		}

		return $this->temp_dir;
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

	public function __construct( array $settings ) {
		if ( ! class_exists( '\ZipArchive' ) ) {
			throw new \Error( 'ZipArchive module is not installed on the server. You must install this module to perform the process.' );
		}

		$this->set_settings( $settings );
	}
}
