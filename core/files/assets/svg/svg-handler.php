<?php
namespace Elementor\Core\Files\Assets\Svg;

use Elementor\Core\Files\Assets\Files_Upload_Handler;
use Elementor\Core\Files\File_Types\Svg;
use Elementor\Core\Files\Uploads_Manager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * SVG Handler
 *
 * Deprecated, use Elementor\Core\Files\File_Types\Svg instead, accessed by calling:
 * `Plugin::$instance->uploads_manager->get_file_type_handlers( 'svg' );`
 *
 * @deprecated 3.5.0
 */
class Svg_Handler extends Files_Upload_Handler {
	/**
	 * Inline svg attachment meta key
	 */
	const META_KEY = '_elementor_inline_svg';

	const SCRIPT_REGEX = '/(?:\w+script|data):/xi';

	/**
	 * Attachment ID.
	 *
	 * Holds the current attachment ID.
	 *
	 * @var int
	 */
	private $attachment_id;

	public static function get_name() {
		return 'svg-handler';
	}

	/**
	 * get_meta
	 *
	 * @deprecated 3.5.0
	 *
	 * @return mixed
	 */
	protected function get_meta() {
		Plugin::$instance->modules_manager->get_modules( 'dev-tools' )->deprecation->deprecated_function( __METHOD__, '3.5.0' );

		return get_post_meta( $this->attachment_id, self::META_KEY, true );
	}

	/**
	 * update_meta
	 *
	 * @deprecated 3.5.0
	 *
	 * @param $meta
	 */
	protected function update_meta( $meta ) {
		Plugin::$instance->modules_manager->get_modules( 'dev-tools' )->deprecation->deprecated_function( __METHOD__, '3.5.0' );

		update_post_meta( $this->attachment_id, self::META_KEY, $meta );
	}

	/**
	 * delete_meta
	 *
	 * @deprecated 3.5.0
	 */
	protected function delete_meta() {
		Plugin::$instance->modules_manager->get_modules( 'dev-tools' )->deprecation->deprecated_function( __METHOD__, '3.5.0' );

		delete_post_meta( $this->attachment_id, self::META_KEY );
	}

	public function get_mime_type() {
		return 'image/svg+xml';
	}

	public function get_file_type() {
		return 'svg';
	}

	/**
	 * delete_meta_cache
	 *
	 * @deprecated 3.5.0
	 */
	public function delete_meta_cache() {
		Plugin::$instance->modules_manager->get_modules( 'dev-tools' )->deprecation->deprecated_function( __METHOD__, '3.5.0', 'Plugin::$instance->uploads_manager->get_file_type_handlers( \'svg\' )->delete_meta_cache()' );

		/** @var Svg $svg_handler */
		$svg_handler = Plugin::$instance->uploads_manager->get_file_type_handlers( 'svg' );

		$svg_handler->delete_meta_cache();
	}

	/**
	 * get_inline_svg
	 *
	 * @deprecated 3.5.0
	 *
	 * @param $attachment_id
	 *
	 * @return bool|mixed|string
	 */
	public static function get_inline_svg( $attachment_id ) {
		Plugin::$instance->modules_manager->get_modules( 'dev-tools' )->deprecation->deprecated_function( __METHOD__, '3.5.0', 'Elementor\Core\Files\File_Types\Svg::get_inline_svg()' );

		return Svg::get_inline_svg( $attachment_id );
	}

	/**
	 * sanitize_svg
	 *
	 * @deprecated 3.5.0
	 *
	 * @param $filename
	 *
	 * @return bool
	 */
	public function sanitize_svg( $filename ) {
		Plugin::$instance->modules_manager->get_modules( 'dev-tools' )->deprecation->deprecated_function( __METHOD__, '3.5.0', 'Plugin::$instance->uploads_manager->get_file_type_handlers( \'svg\' )->delete_meta_cache()->sanitize_svg()' );

		/** @var Svg $svg_handler */
		$svg_handler = Plugin::$instance->uploads_manager->get_file_type_handlers( 'svg' );

		return $svg_handler->sanitize_svg( $filename );
	}

	/**
	 * sanitizer
	 *
	 * @deprecated 3.5.0
	 *
	 * @param $content
	 *
	 * @return bool|string
	 */
	public function sanitizer( $content ) {
		Plugin::$instance->modules_manager->get_modules( 'dev-tools' )->deprecation->deprecated_function( __METHOD__, '3.5.0', 'Plugin::$instance->uploads_manager->get_file_type_handlers( \'svg\' )->sanitizer()' );

		/** @var Svg $svg_handler */
		$svg_handler = Plugin::$instance->uploads_manager->get_file_type_handlers( 'svg' );

		return $svg_handler->sanitizer( $content );
	}

	/**
	 * wp_prepare_attachment_for_js
	 *
	 * @deprecated 3.5.0
	 *
	 * @param $attachment_data
	 * @param $attachment
	 * @param $meta
	 *
	 * @return mixed
	 */
	public function wp_prepare_attachment_for_js( $attachment_data, $attachment, $meta ) {
		Plugin::$instance->modules_manager->get_modules( 'dev-tools' )->deprecation->deprecated_function( __METHOD__, '3.5.0', 'Plugin::$instance->uploads_manager->get_file_type_handlers( \'svg\' )->wp_prepare_attachment_for_js()' );

		/** @var Svg $svg_handler */
		$svg_handler = Plugin::$instance->uploads_manager->get_file_type_handlers( 'svg' );

		return $svg_handler->wp_prepare_attachment_for_js( $attachment_data, $attachment, $meta );
	}

	/**
	 * set_attachment_id
	 *
	 * @deprecated 3.5.0
	 *
	 * @param $attachment_id
	 *
	 * @return int
	 */
	public function set_attachment_id( $attachment_id ) {
		Plugin::$instance->modules_manager->get_modules( 'dev-tools' )->deprecation->deprecated_function( __METHOD__, '3.5.0' );

		$this->attachment_id = $attachment_id;
		return $this->attachment_id;
	}

	/**
	 * get_attachment_id
	 *
	 * @deprecated 3.5.0
	 *
	 * @return int
	 */
	public function get_attachment_id() {
		Plugin::$instance->modules_manager->get_modules( 'dev-tools' )->deprecation->deprecated_function( __METHOD__, '3.5.0' );

		return $this->attachment_id;
	}

	/**
	 * set_svg_meta_data
	 *
	 * @deprecated 3.5.0
	 *
	 * @return mixed
	 */
	public function set_svg_meta_data( $data, $id ) {
		Plugin::$instance->modules_manager->get_modules( 'dev-tools' )->deprecation->deprecated_function( __METHOD__, '3.5.0', 'Plugin::$instance->uploads_manager->get_file_type_handlers( \'svg\' )->set_svg_meta_data()' );

		/** @var Svg $svg_handler */
		$svg_handler = Plugin::$instance->uploads_manager->get_file_type_handlers( 'svg' );

		return $svg_handler->set_svg_meta_data( $data, $id );
	}

	/**
	 * handle_upload_prefilter
	 *
	 * @deprecated 3.5.0
	 *
	 * @param $file
	 *
	 * @return mixed
	 */
	public function handle_upload_prefilter( $file ) {
		Plugin::$instance->modules_manager->get_modules( 'dev-tools' )->deprecation->deprecated_function( __METHOD__, '3.5.0', 'Elementor\Plugin::$instance->uploads_manager->handle_elementor_wp_media_upload()' );

		return Plugin::$instance->uploads_manager->handle_elementor_wp_media_upload( $file );
	}
}
