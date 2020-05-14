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

	/**
	 * Json_Handler constructor.
	 */
	public function __construct() {
		parent::__construct();

		add_filter( 'upload_mimes', [ $this, 'support_unfiltered_files_upload' ] );
		add_filter( 'wp_handle_upload_prefilter', [ $this, 'handle_upload_prefilter' ] );
		add_filter( 'wp_check_filetype_and_ext', [ $this, 'check_filetype_and_ext' ], 10, 4 );
	}
}
