<?php
namespace Elementor\Core\Files\Assets\Json;

use Elementor\Core\Files\Assets\Files_Upload_Handler;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Json_Handler extends Files_Upload_Handler {
	/**
	 * Inline svg attachment meta key
	 */
	const META_KEY = '_elementor_inline_svg';
	const MIME_TYPE = 'application/json';
	const FILE_TYPE = 'json';
	const SCRIPT_REGEX = '/(?:\w+script|data):/xi';

	/**
	 * @var \DOMDocument
	 */
	private $svg_dom = null;

	/**
	 * Attachment ID.
	 *
	 * Holds the current attachment ID.
	 *
	 * @var int
	 */
	private $attachment_id;

	public static function get_name() {
		return 'json-handler';
	}

	/**
	 * get_meta
	 * @return mixed
	 */
	protected function get_meta() {
		return get_post_meta( $this->attachment_id, self::META_KEY, true );
	}

	/**
	 * update_meta
	 * @param $meta
	 */
	protected function update_meta( $meta ) {
		update_post_meta( $this->attachment_id, self::META_KEY, $meta );
	}

	/**
	 * delete_meta
	 */
	protected function delete_meta() {
		delete_post_meta( $this->attachment_id, self::META_KEY );
	}

	/**
	 * delete_meta_cache
	 */
	public function delete_meta_cache() {
		delete_post_meta_by_key( self::META_KEY );
	}

	/**
	 * read_from_file
	 * @return bool|string
	 */
	public function read_from_file() {
		return file_get_contents( get_attached_file( $this->attachment_id ) );
	}

	/**
	 * get_inline_svg
	 * @param $attachment_id
	 *
	 * @return bool|mixed|string
	 */
	public static function get_inline_svg( $attachment_id ) {
		$svg = get_post_meta( $attachment_id, self::META_KEY, true );

		if ( ! empty( $svg ) ) {
			return $svg;
		}

		$attachment_file = get_attached_file( $attachment_id );

		if ( ! $attachment_file ) {
			return '';
		}

		$svg = file_get_contents( $attachment_file );

		if ( ! empty( $svg ) ) {
			update_post_meta( $attachment_id, self::META_KEY, $svg );
		}

		return $svg;
	}

	public function upload_mimes( $allowed_types ) {
		if ( $this->is_elementor_media_upload() ) {
			$allowed_types['json'] = self::MIME_TYPE;
		}
		return $allowed_types;
	}

	public function wp_handle_upload_prefilter( $file ) {
		return $this->handle_upload_prefilter( $file, self::MIME_TYPE, self::FILE_TYPE );
	}

	/**
	 * wp_check_filetype_and_ext
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
	public function wp_check_filetype_and_ext( $data, $file, $filename, $mimes ) {
		return $this->check_filetype_and_ext( $data, $filename, self::FILE_TYPE, $mimes, self::MIME_TYPE );
	}

	/**
	 * decode_svg
	 * @param $content
	 *
	 * @return string
	 */
	private function decode_svg( $content ) {
		return gzdecode( $content );
	}

	/**
	 * encode_svg
	 * @param $content
	 *
	 * @return string
	 */
	private function encode_svg( $content ) {
		return gzencode( $content );
	}

	/**
	 * sanitize_file
	 * @param $filename
	 *
	 * @return bool
	 */
	public function sanitize_file( $filename ) {


		return true;
	}

	/**
	 * is_allowed_tag
	 * @param $element
	 *
	 * @return bool
	 */
	private function is_allowed_tag( $element ) {
		static $allowed_tags = false;
		if ( false === $allowed_tags ) {
			$allowed_tags = $this->get_allowed_elements();
		}

		$tag_name = $element->tagName; // phpcs:ignore -- php DomDocument

		if ( ! in_array( strtolower( $tag_name ), $allowed_tags ) ) {
			$this->remove_element( $element );
			return false;
		}

		return true;
	}

	private function remove_element( $element ) {
		$element->parentNode->removeChild( $element ); // phpcs:ignore -- php DomDocument
	}


	/**
	 * is_remote_value
	 * @param $value
	 *
	 * @return string
	 */
	private function is_remote_value( $value ) {
		$value = trim( preg_replace( '/[^ -~]/xu', '', $value ) );
		$wrapped_in_url = preg_match( '~^url\(\s*[\'"]\s*(.*)\s*[\'"]\s*\)$~xi', $value, $match );
		if ( ! $wrapped_in_url ) {
			return false;
		}

		$value = trim( $match[1], '\'"' );
		return preg_match( '~^((https?|ftp|file):)?//~xi', $value );
	}


	/**
	 * sanitizer
	 * @param $content
	 *
	 * @return bool|string
	 */
	public function sanitizer( $content ) {


		return $content;
	}

	/**
	 * wp_prepare_attachment_for_js
	 * @param $attachment_data
	 * @param $attachment
	 * @param $meta
	 *
	 * @return mixed
	 */
	public function wp_prepare_attachment_for_js( $attachment_data, $attachment, $meta ) {
		if ( 'image' !== $attachment_data['type'] || 'svg+xml' !== $attachment_data['subtype'] || ! class_exists( 'SimpleXMLElement' ) ) {
			return $attachment_data;
		}

		$svg = self::get_inline_svg( $attachment->ID );

		if ( ! $svg ) {
			return $attachment_data;
		}

		try {
			$svg = new \SimpleXMLElement( $svg );
		} catch ( \Exception $e ) {
			return $attachment_data;
		}

		$src = $attachment_data['url'];
		$width = (int) $svg['width'];
		$height = (int) $svg['height'];

		// Media Gallery
		$attachment_data['image'] = compact( 'src', 'width', 'height' );
		$attachment_data['thumb'] = compact( 'src', 'width', 'height' );

		// Single Details of Image
		$attachment_data['sizes']['full'] = [
			'height' => $height,
			'width' => $width,
			'url' => $src,
			'orientation' => $height > $width ? 'portrait' : 'landscape',
		];
		return $attachment_data;
	}

	/**
	 * Svg_Handler constructor.
	 */
	public function __construct() {
		parent::__construct();

		add_filter( 'upload_mimes', [ $this, 'upload_mimes' ] );
		add_filter( 'wp_handle_upload_prefilter', [ $this, 'wp_handle_upload_prefilter' ] );
		add_filter( 'wp_check_filetype_and_ext', [ $this, 'wp_check_filetype_and_ext' ], 10, 4 );
		add_filter( 'wp_prepare_attachment_for_js', [ $this, 'wp_prepare_attachment_for_js' ], 10, 3 );
		add_action( 'elementor/core/files/clear_cache', [ $this, 'delete_meta_cache' ] );
	}
}
