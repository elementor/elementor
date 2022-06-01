<?php
namespace Elementor\Core\App\Modules\ImportExport;

use Elementor\Core\Base\Base_Object;
use Elementor\Modules\System_Info\Reporters\Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Iterator extends Base_Object {
	const ZIP_ARCHIVE_MODULE_NOT_INSTALLED_KEY = 'zip-archive-module-not-installed';

	const NO_WRITE_PERMISSIONS_KEY = 'no-write-permissions';

	protected $temp_dir;

	private $current_archive_path = '';

	abstract public function run();

	protected function get_archive_file_path( $file_name ) {
		return $this->get_current_archive_path() . $file_name;
	}

	public function get_archive_file_full_path( $file_name ) {
		return $this->temp_dir . $this->get_archive_file_path( $file_name );
	}

	public function get_current_archive_path() {
		return $this->current_archive_path;
	}

	public function set_current_archive_path( $path ) {
		if ( $path ) {
			$path .= '/';
		}

		$this->current_archive_path = $path;
	}

	public function __construct( array $settings ) {
		if ( ! class_exists( '\ZipArchive' ) ) {
			throw new \Error( self::ZIP_ARCHIVE_MODULE_NOT_INSTALLED_KEY );
		}

		$server = new Server();

		$server_write_permissions = $server->get_write_permissions();

		if ( $server_write_permissions['warning'] ) {
			throw new \Error( self::NO_WRITE_PERMISSIONS_KEY );
		}

		$this->set_settings( $settings );
	}
}
