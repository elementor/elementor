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
	public static function is_files_upload_enabled() {
		return ! ! get_option( 'elementor_allow_svg', false );
	}

	public static function is_enabled() {
		static $enabled = null;
		if ( null === $enabled ) {
			$enabled = self::is_files_upload_enabled() && self::file_sanitizer_can_run();
			$enabled = apply_filters( 'elementor/files/svg/enabled', $enabled );
		}
		return $enabled;
	}

	/**
	 * wp_handle_upload_prefilter
	 * @param $file
	 *
	 * @return mixed
	 */
	public function handle_upload_prefilter( $file, $mime_type, $file_type ) {
		if ( ! $this->is_elementor_media_upload() || $mime_type !== $file['type'] ) {
			return $file;
		}

		$ext = pathinfo( $file['name'], PATHINFO_EXTENSION );
		$display_type = strtoupper($file_type);

		if ( $file_type !== $ext ) {
			$file['error'] = sprintf( __( "The uploaded %s file is not supported. Please upload a valid $display_type file", 'elementor' ), $ext );
			return $file;
		}

		if ( ! self::is_enabled() ) {
			$file['error'] = __( "$display_type file is not allowed for security reasons", 'elementor' );
			return $file;
		}

		if ( self::file_sanitizer_can_run() && ! $this->sanitize_file( $file['tmp_name'] ) ) {
			$file['error'] = __( "Invalid $display_type Format, file not uploaded for security reasons", 'elementor' );
		}

		return $file;
	}

	/**
	 * wp_check_filetype_and_ext
	 * A workaround for upload validation which relies on a PHP extension (fileinfo)
	 * with inconsistent reporting behaviour.
	 * ref: https://core.trac.wordpress.org/ticket/39550
	 * ref: https://core.trac.wordpress.org/ticket/40175
	 *
	 * @param $data
	 * @param $filename
	 * @param $mimes
	 * @param $mime_type
	 * @param $file_type
	 *
	 * @return mixed
	 */
	public function check_filetype_and_ext( $data, $filename, $file_type, $mimes, $mime_type ) {
		if ( ! empty( $data['ext'] ) && ! empty( $data['type'] ) ) {
			return $data;
		}

		$wp_file_type = wp_check_filetype( $filename, $mimes );
		$file_type = strtolower($file_type);

		if ( $file_type === $wp_file_type['ext'] ) {
			$data['ext'] = $file_type;
			$data['type'] = $mime_type;
		}

		return $data;
	}

	/**
	 * Check if the contents are gzipped
	 * @see http://www.gzip.org/zlib/rfc-gzip.html#member-format
	 *
	 * @param $contents
	 * @return bool
	 */
	protected function is_encoded( $contents ) {
		$needle = "\x1f\x8b\x08";
		if ( function_exists( 'mb_strpos' ) ) {
			return 0 === mb_strpos( $contents, $needle );
		} else {
			return 0 === strpos( $contents, $needle );
		}
	}

	/**
	 * strip_php_tags
	 * @param $string
	 *
	 * @return string
	 */
	protected function strip_php_tags( $string ) {
		$string = preg_replace( '/<\?(=|php)(.+?)\?>/i', '', $string );
		// Remove XML, ASP, etc.
		$string = preg_replace( '/<\?(.*)\?>/Us', '', $string );
		$string = preg_replace( '/<\%(.*)\%>/Us', '', $string );

		if ( ( false !== strpos( $string, '<?' ) ) || ( false !== strpos( $string, '<%' ) ) ) {
			return '';
		}
		return $string;
	}

	/**
	 * strip_comments
	 * @param $string
	 *
	 * @return string
	 */
	protected function strip_comments( $string ) {
		// Remove comments.
		$string = preg_replace( '/<!--(.*)-->/Us', '', $string );
		$string = preg_replace( '/\/\*(.*)\*\//Us', '', $string );
		if ( ( false !== strpos( $string, '<!--' ) ) || ( false !== strpos( $string, '/*' ) ) ) {
			return '';
		}
		return $string;
	}

	/**
	 * set_attachment_id
	 * @param $attachment_id
	 *
	 * @return int
	 */
	public function set_attachment_id( $attachment_id ) {
		$this->attachment_id = $attachment_id;
		return $this->attachment_id;
	}

	/**
	 * get_attachment_id
	 * @return int
	 */
	public function get_attachment_id() {
		return $this->attachment_id;
	}

}
