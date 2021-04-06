<?php
namespace Elementor\Core\Files\File_Types;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Json extends Base {

	/**
	 * Get Mime Types
	 *
	 * Return an array of mime types compatible with this file type
	 *
	 * @since 3.3.0
	 *
	 * @return array
	 */
	public function get_mime_types() {
		return [
			'application/json',
			// For when json files are uploaded as Base64 strings and saved to a temporary file.
			'text/plain',
		];
	}

	/**
	 * Get File Extension
	 *
	 * Returns the file type's file extension
	 *
	 * @since 3.3.0
	 *
	 * @return string - file extension
	 */
	public function get_file_extension() {
		return 'json';
	}
}
