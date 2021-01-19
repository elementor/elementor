<?php
namespace Elementor\Core\App\Modules\ImportExport;

use Elementor\Core\Base\Base_Object;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Iterator extends Base_Object {

	private $current_archive_path = '';

	abstract protected function run();

	public function __construct() {
		return $this->run();
	}

	protected function get_archive_file_path( $file_name ) {
		return $this->get_current_archive_path() . $file_name;
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
}
