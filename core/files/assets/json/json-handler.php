<?php
namespace Elementor\Core\Files\Assets\Json;

use Elementor\Core\Files\Assets\Files_Upload_Handler;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Json_Handler extends Files_Upload_Handler {
	const MIME_TYPE = 'application/json';
	const FILE_TYPE = 'json';

	public static function get_name() {
		return 'json-handler';
	}
}
