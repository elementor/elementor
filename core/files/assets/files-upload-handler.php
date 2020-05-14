<?php

namespace Elementor\Core\Files\Assets;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Files_Upload_Handler {
	public function __construct() {

	}

	/**
	 * is_elementor_media_upload
	 * @return bool
	 */
	protected function is_elementor_media_upload() {
		return isset( $_POST['uploadTypeCaller'] ) && 'elementor-editor-upload' === $_POST['uploadTypeCaller']; // phpcs:ignore
	}

	/**
	 * file_sanitizer_can_run
	 * @return bool
	 */
	public static function file_sanitizer_can_run() {
		return class_exists( 'DOMDocument' ) && class_exists( 'SimpleXMLElement' );
	}

	/**
	 * @return bool
	 */
	public static function is_unfiltered_files_upload_enabled() {
		return ! ! get_option( 'elementor_unfiltered_files_upload', false );
	}

	public static function is_upload_enabled() {
		static $enabled = null;
		if ( null === $enabled ) {
			$enabled = self::is_unfiltered_files_upload_enabled() && self::file_sanitizer_can_run();
			$enabled = apply_filters( 'elementor/files/svg/enabled', $enabled );
		}
		return $enabled;
	}

	public function support_unfiltered_files_upload( $existing_mimes ) {
		$existing_mimes[ static::FILE_TYPE ] = static::MIME_TYPE;

		return $existing_mimes;
	}

	/**
	 * handle_upload_prefilter
	 * @param $file
	 *
	 * @return mixed
	 */
	public function handle_upload_prefilter( $file ) {
		if ( ! $this->is_elementor_media_upload() || static::MIME_TYPE !== $file['type'] ) {
			return $file;
		}

		$ext = pathinfo( $file['name'], PATHINFO_EXTENSION );
		$display_type = strtoupper( static::FILE_TYPE );

		if ( static::FILE_TYPE !== $ext ) {
			$file['error'] = sprintf( __( "The uploaded %s file is not supported. Please upload a valid $display_type file", 'elementor' ), $ext );
			return $file;
		}

		if ( ! self::is_upload_enabled() ) {
			$file['error'] = __( "$display_type file is not allowed for security reasons", 'elementor' );
			return $file;
		}

		if ( self::file_sanitizer_can_run() && ! $this->sanitize_file( $file['tmp_name'] ) ) {
			$file['error'] = __( "Invalid $display_type Format, file not uploaded for security reasons", 'elementor' );
		}

		return $file;
	}

	/**
	 * check_filetype_and_ext
	 * A workaround for upload validation which relies on a PHP extension (fileinfo)
	 * with inconsistent reporting behaviour.
	 * ref: https://core.trac.wordpress.org/ticket/39550
	 * ref: https://core.trac.wordpress.org/ticket/40175
	 *
	 * @param $data
	 * @param $file
	 * @param $filename
	 * @param $mimes
	 *
	 * @return mixed
	 */
	public function check_filetype_and_ext( $data, $file, $filename, $mimes ) {
		if ( ! empty( $data['ext'] ) && ! empty( $data['type'] ) ) {
			return $data;
		}

		$wp_file_type = wp_check_filetype( $filename, $mimes );
		$file_type = strtolower( static::FILE_TYPE );

		if ( $file_type === $wp_file_type['ext'] ) {
			$data['ext'] = static::FILE_TYPE;
			$data['type'] = static::MIME_TYPE;
		}

		return $data;
	}
}
