<?php

namespace Elementor\Core\Files\Assets;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Files_Upload_Handler {
	public function __construct() {
		add_filter( 'upload_mimes', [ $this, 'support_unfiltered_files_upload' ] );
		add_filter( 'wp_handle_upload_prefilter', [ $this, 'handle_upload_prefilter' ] );
		add_filter( 'wp_check_filetype_and_ext', [ $this, 'check_filetype_and_ext' ], 10, 4 );
	}

	/**
	 * is_elementor_media_upload
	 * @return bool
	 */
	final private function is_elementor_media_upload() {
		return isset( $_POST['uploadTypeCaller'] ) && 'elementor-editor-upload' === $_POST['uploadTypeCaller']; // phpcs:ignore
	}

	/**
	 * @return bool
	 */
	public function is_unfiltered_files_upload_enabled() {
		return ! ! get_option( 'elementor_unfiltered_files_upload', false );
	}

	final public function support_unfiltered_files_upload( $existing_mimes ) {
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
		if ( ! $this->is_file_should_handled( $file ) ) {
			return $file;
		}

		$ext = pathinfo( $file['name'], PATHINFO_EXTENSION );
		$display_type = strtoupper( static::FILE_TYPE );

		if ( static::FILE_TYPE !== $ext ) {
			$file['error'] = sprintf( __( 'The uploaded %1$s file is not supported. Please upload a valid %2$s file', 'elementor' ), $ext, $display_type );
			return $file;
		}

		if ( ! self::is_enabled() ) {
			$file['error'] = sprintf( __( '%1$s file is not allowed for security reasons', 'elementor' ), $display_type );
			return $file;
		}

		return $file;
	}

	protected function is_file_should_handled( $file ) {
		return $this->is_elementor_media_upload() && static::MIME_TYPE === $file['type'];
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
	final private function check_filetype_and_ext( $data, $file, $filename, $mimes ) {
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
