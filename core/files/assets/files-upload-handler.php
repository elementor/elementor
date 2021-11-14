<?php

namespace Elementor\Core\Files\Assets;

use Elementor\Core\Files\File_Types\Svg;
use Elementor\Core\Files\Uploads_Manager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Files Upload Handler
 *
 * Deprecated, use Elementor\Core\Files\Uploads_Manager instead.
 *
 * @deprecated 3.5.0
 */
abstract class Files_Upload_Handler {
	const OPTION_KEY = 'elementor_unfiltered_files_upload';

	abstract public function get_mime_type();

	abstract public function get_file_type();

	/**
	 * is_elementor_media_upload
	 * @deprecated 3.5.0
	 * @return bool
	 */
	private function is_elementor_media_upload() {
		return isset( $_POST['uploadTypeCaller'] ) && 'elementor-wp-media-upload' === $_POST['uploadTypeCaller']; // phpcs:ignore
	}

	/**
	 * @return bool
	 */
	final public static function is_enabled() {
		$enabled = ! ! get_option( self::OPTION_KEY ) && Svg::file_sanitizer_can_run();

		/**
		 * @deprecated 3.0.0 Use `elementor/files/allow_unfiltered_upload` filter instead.
		 */
		$enabled = apply_filters( 'elementor/files/svg/enabled', $enabled );

		/**
		 * Allow Unfiltered Files Upload.
		 *
		 * Determines whether to enable unfiltered file uploads.
		 *
		 * @since 3.0.0
		 *
		 * @param bool $enabled Whether upload is enabled or not.
		 */
		$enabled = apply_filters( 'elementor/files/allow_unfiltered_upload', $enabled );

		return $enabled;
	}

	final public function support_unfiltered_files_upload( $existing_mimes ) {
		Plugin::$instance->modules_manager->get_modules( 'dev-tools' )->deprecation->deprecated_function( __METHOD__, '3.5.0', 'Elementor\Plugin::$instance->uploads_manager->support_unfiltered_file_uploads()' );

		return Plugin::$instance->uploads_manager->support_unfiltered_elementor_file_uploads( $existing_mimes );
	}

	/**
	 * handle_upload_prefilter
	 *
	 * @deprcated 3.5.0
	 *
	 * @param $file
	 *
	 * @return mixed
	 */
	public function handle_upload_prefilter( $file ) {
		Plugin::$instance->modules_manager->get_modules( 'dev-tools' )->deprecation->deprecated_function( __METHOD__, '3.5.0', 'Elementor\Plugin::$instance->uploads_manager->handle_elementor_wp_media_upload()' );

		return Plugin::$instance->uploads_manager->handle_elementor_wp_media_upload( $file );
	}

	/**
	 * is_file_should_handled
	 *
	 * @deprcated 3.5.0
	 *
	 * @param $file
	 *
	 * @return bool
	 */
	protected function is_file_should_handled( $file ) {
		Plugin::$instance->modules_manager->get_modules( 'dev-tools' )->deprecation->deprecated_function( __METHOD__, '3.5.0' );

		$ext = pathinfo( $file['name'], PATHINFO_EXTENSION );

		return $this->is_elementor_media_upload() && $this->get_file_type() === $ext;
	}

	/**
	 * file_sanitizer_can_run
	 *
	 * @deprcated 3.5.0
	 *
	 * @return bool
	 */
	public static function file_sanitizer_can_run() {
		Plugin::$instance->modules_manager->get_modules( 'dev-tools' )->deprecation->deprecated_function( __METHOD__, '3.5.0', 'Elementor\Core\Files\File_Types\Svg::file_sanitizer_can_run()' );

		return Svg::file_sanitizer_can_run();
	}

	/**
	 * Check filetype and ext
	 *
	 * A workaround for upload validation which relies on a PHP extension (fileinfo)
	 * with inconsistent reporting behaviour.
	 * ref: https://core.trac.wordpress.org/ticket/39550
	 * ref: https://core.trac.wordpress.org/ticket/40175
	 *
	 * @deprcated 3.5.0
	 *
	 * @param $data
	 * @param $file
	 * @param $filename
	 * @param $mimes
	 *
	 * @return mixed
	 */
	public function check_filetype_and_ext( $data, $file, $filename, $mimes ) {
		Plugin::$instance->modules_manager->get_modules( 'dev-tools' )->deprecation->deprecated_function( __METHOD__, '3.5.0', 'Elementor\Plugin::$instance->uploads_manager->check_filetype_and_ext()' );

		Plugin::$instance->uploads_manager->check_filetype_and_ext( $data, $file, $filename, $mimes );
	}
}
