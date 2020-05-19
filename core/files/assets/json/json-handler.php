<?php
namespace Elementor\Core\Files\Assets\Json;

use Elementor\Core\Files\Assets\Files_Upload_Handler;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Json_Handler extends Files_Upload_Handler {
	public static function get_name() {
		return 'json-handler';
	}

	public function get_mime_type() {
		return 'application/json';
	}

	public function get_file_type() {
		return 'json';
	}
}
