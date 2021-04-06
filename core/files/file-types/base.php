<?php
namespace Elementor\Core\Files\File_Types;

use Elementor\Core\Base\Base_Object;
use Elementor\Core\Utils\Exceptions;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor File Types Base.
 *
 * The File Types Base class provides base methods used by all file type handler classes.
 * These methods are used in file upl
 *
 * @since 3.3.0
 */
abstract class Base extends Base_Object {

	/**
	 * Get Allowed Mime Types
	 *
	 * Returns an array of the mime types allowed for upload
	 *
	 * @since 3.3.0
	 *
	 * @return array mime types
	 */
	abstract public function get_mime_types();

	/**
	 * Get File Extension
	 *
	 * Returns the file type's file extension
	 *
	 * @since 3.3.0
	 *
	 * @return string - file extension
	 */
	abstract public function get_file_extension();

	/**
	 * Validate File
	 *
	 * This method give file types the chance to run file-type-specific validations before returning the file for upload.
	 *
	 * @since 3.3.0
	 *
	 * @param $file
	 * @return bool|\WP_Error
	 */
	public function validate_file( $file ) {
		return true;
	}
}
