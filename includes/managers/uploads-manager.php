<?php
namespace Elementor;

use Elementor\Core\Base\Base_Object;
use Elementor\Core\Files\File_Types\Base as File_Type_Base;
use Elementor\Core\Files\File_Types\Json;
use Elementor\Core\Files\File_Types\Zip;
use Elementor\Core\Utils\Exceptions;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor uploads manager.
 *
 * Elementor uploads manager handler class is responsible for handling file uploads that are not done with WP Media.
 *
 * @since 3.2.0
 */
class Uploads_Manager extends Base_Object {

	const UNFILTERED_FILE_UPLOADS_KEY = 'elementor_unfiltered_files_upload';
	const INVALID_FILE_CONTENT = 'Invalid Content In File';

	/**
	 * @var File_Type_Base[]
	 */
	private $file_type_handlers = [];

	private $allowed_mime_types;
	private $are_unfiltered_files_enabled;

	/**
	 * Register File Types
	 *
	 * To Add a new file type to Elementor, with its own handling logic, you need to add it to the $file_types array here.
	 *
	 * @since 3.2.0
	 */
	public function register_file_types() {
		// All file types that have handlers should be included here.
		$file_types = [
			'json' => new Json(),
			'zip' => new Zip(),
		];

		foreach ( $file_types as $file_type => $file_handler ) {
			$this->file_type_handlers[ $file_type ] = $file_handler;

			// Add the mime type to the allowed mimes list only if unfiltered files upload is enabled.
			if ( $this->are_unfiltered_uploads_enabled() ) {
				$this->add_mime_type_to_allowed_mimes_list( $file_type );
			}
		}
	}

	/**
	 * Extract and Validate Zip
	 *
	 * This method accepts a $file array (which minimally should include a 'tmp_name')
	 *
	 * @param array $file_path
	 * @return array|\WP_Error
	 */
	public function extract_and_validate_zip( $file_path ) {
		$validation_result = [];

		/** @var Zip $handler - File Type */
		$handler = $this->file_type_handlers['zip'];

		// Returns an array of file paths.
		$extracted = $handler->extract( $file_path );

		// If there are no extracted file names, no files passed the extraction validation.
		if ( empty( $extracted['files'] ) ) {
			// TODO: Decide what to do if no files passed the extraction validation
			return new \WP_Error( 'file_error', self::INVALID_FILE_CONTENT );
		}

		foreach ( $extracted['files'] as $extracted_file ) {
			// Each file is an array with a 'name' (file path) and 'type' (mime type) properties.
			$validation_result[] = $this->validate_file( $extracted_file );
		}

		return $validation_result;
	}

	/**
	 * @param array|null $file (If it is a $file array, it must include the 'name' and 'type' properties)
	 * @return array|\WP_Error
	 */
	public function handle_elementor_upload( $file = null ) {
		// If a file is passed to this method.
		if ( $file ) {
			// If $file['fileData'] is set, it signals that the passed file is a Base64 string that needs to be saved
			// to a file.
			if ( isset( $file['fileData'] ) ) {
				$file = $this->save_base64_to_tmp_file( $file );

				if ( is_wp_error( $file ) ) {
					return $file;
				}
			}

			$validation_result = $this->validate_file( $file );
		} else {
			$validation_result = [];

			// If no files are passed to this method, check the $_FILES global,
			foreach ( $_FILES as $file ) {
				$validation_result[] = $this->validate_file( $file );
			}
		}

		return $validation_result;
	}

	/**
	 * Runs on the 'wp_handle_upload_prefilter' filter.
	 *
	 * @param $file
	 * @return mixed
	 */
	public function handle_elementor_wp_media_upload( $file ) {
		// If it isn't a file uploaded by Elementor, we do not intervene.
		if ( ! $this->is_elementor_wp_media_upload() ) {
			return $file;
		}

		$result = $this->validate_file( $file );

		if ( is_wp_error( $result ) ) {
			$file['error'] = $result->get_error_message();
		}

		return $file;
	}

	/**
	 * Get File Type Handler
	 *
	 * Initialize the proper file type handler according to the file extension
	 * and assign it to the file type handlers array.
	 *
	 * @param string $file_extension - file extension
	 * @return \WP_Error|File_Type_Base
	 * @since 3.2.0
	 */
	public function get_file_type_handlers( $file_extension ) {
		return self::get_items( $this->file_type_handlers, $file_extension );
	}

	/**
	 * Create Temp File
	 *
	 * @since 3.2.0
	 *
	 * @param string $file_content
	 * @return string $temp_filename
	 */
	public function create_temp_file( $file_content ) {
		// Get the directory for temporary Elementor uploads.
		$temp_path = $this->get_temp_dir();
		// Create a random temporary file name.
		$temp_filename = $temp_path . uniqid() . '.tmp';

		// Save the contents to a temporary file.
		file_put_contents( $temp_filename, $file_content ); // phpcs:ignore

		return $temp_filename;
	}

	/**
	 * Get Temp Directory
	 *
	 * Get the temporary files directory path. If the directory does not exist, this method creates it.
	 *
	 * @since 3.2.0
	 *
	 * @return string $temp_dir
	 */
	public function get_temp_dir() {
		$wp_upload_dir = wp_upload_dir();
		$tmp_dir = $wp_upload_dir['basedir'] . '/elementor/tmp';

		if ( ! file_exists( $tmp_dir ) && ! is_dir( $tmp_dir ) ) {
			wp_mkdir_p( $tmp_dir );
		}

		return $tmp_dir;
	}

	/**
	 * Are Unfiltered Uploads Enabled
	 *
	 * Checks if the user allowed uploading unfiltered files.
	 *
	 * @return bool
	 * @since 3.2.0
	 */
	private function are_unfiltered_uploads_enabled() {
		if ( ! $this->are_unfiltered_files_enabled ) {
			$this->are_unfiltered_files_enabled = ! ! get_option( self::UNFILTERED_FILE_UPLOADS_KEY );
		}

		return $this->are_unfiltered_files_enabled;
	}

	/**
	 * Add Mime Type To Allowed Mimes List
	 *
	 * @param string $file_type
	 * @since 3.2.0
	 */
	private function add_mime_type_to_allowed_mimes_list( $file_type ) {
		$file_handler = $this->file_type_handlers[ $file_type ];

		$mime_types = $file_handler->get_mime_types();

		$file_extension = $file_handler->get_file_extension();

		$this->allowed_mime_types[ $file_extension ] = $mime_types;
	}

	/**
	 * Save Base64 as File
	 *
	 * Saves a Base64 string as a .tmp file in Elementor's temporary files directory.
	 *
	 * @param $file
	 * @return array
	 */
	private function save_base64_to_tmp_file( $file ) {
		$file_content = base64_decode( $file['fileData'] ); // phpcs:ignore

		// If the decode fails
		if ( ! $file_content ) {
			return \WP_Error( 'file_error', self::INVALID_FILE_CONTENT );
		}

		$temp_filename = $this->create_temp_file( $file_content );

		return [
			'name' => $file['fileName'],
			'tmp_name' => $temp_filename,
			'type' => mime_content_type( $temp_filename ),
		];
	}

	/**
	 * is_elementor_wp_media_upload
	 * @return bool
	 */
	private function is_elementor_wp_media_upload() {
		return isset( $_POST['elementor_wp_media_upload'] ); // phpcs:ignore
	}

	/**
	 * Validate File
	 *
	 * @param array $file (the array must include the 'name' and 'type' properties)
	 * @return array|\WP_Error
	 *
	 * @since 3.2.0
	 */
	private function validate_file( array $file ) {
		// Get the file's extension (Not to be trusted, will be checked for matching mime types).
		$file_extension = pathinfo( $file['name'], PATHINFO_EXTENSION );
		$file_allowed_mime_types = $this->get_allowed_mime_types( $file_extension );

		// Check if the file type is in the allowed mime types list. If it is a non-standard mime type (not enabled by
		// default in WordPress) and unfiltered file uploads are not enabled, it will not be in the allowed mime types
		// list.
		if ( ! $file_allowed_mime_types || ! in_array( $file['type'], $file_allowed_mime_types, true ) ) {
			return new \WP_Error( Exceptions::FORBIDDEN, 'Uploading this file type is not allowed.' );
		}

		$file_type_handler = $this->get_file_type_handlers( $file_extension );

		// If Elementor does not have a handler for this file type, don't block it.
		if ( ! $file_type_handler ) {
			return $file;
		}

		// Here is each file type handler's chance to run its own specific validations
		return $file_type_handler->validate_file( $file );
	}

	/**
	 * Get Allowed Mime Types
	 *
	 * Get the allowed mime types for a certain file extension.
	 *
	 * @since 3.2.0
	 *
	 * @param string|null $file_extension
	 * @return string $temp_dir
	 */
	private function get_allowed_mime_types( $file_extension = null ) {
		if ( ! $this->allowed_mime_types ) {
			$this->allowed_mime_types = get_allowed_mime_types();
		}

		return self::get_items( $this->allowed_mime_types, $file_extension );
	}

	public function __construct() {
		$this->register_file_types();

		add_filter( 'wp_handle_upload_prefilter', [ $this, 'handle_elementor_wp_media_upload' ] );
	}
}
