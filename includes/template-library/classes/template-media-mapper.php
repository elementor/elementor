<?php
namespace Elementor\TemplateLibrary\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor template media mapper.
 *
 * Maps original media URLs to local files during template import.
 *
 * @since 1.0.0
 */
class Template_Media_Mapper {

	/**
	 * Current media mapping (URL => filename).
	 *
	 * @var array
	 */
	private static $current_mapping = [];

	/**
	 * Media files directory.
	 *
	 * @var string
	 */
	private static $media_dir = '';

	/**
	 * Set media mapping and directory for current import.
	 *
	 * @param array $mapping Media URL to filename mapping.
	 * @param string $media_dir Directory containing media files.
	 */
	public static function set_mapping( $mapping, $media_dir = '' ) {
		self::$current_mapping = is_array( $mapping ) ? $mapping : [];
		self::$media_dir = $media_dir;
	}

	/**
	 * Get local file path for original URL.
	 *
	 * @param string $original_url Original media URL.
	 * @return string Local file path if mapping exists, original URL otherwise.
	 */
	public static function get_local_file_path( $original_url ) {
		if ( empty( self::$current_mapping ) || empty( $original_url ) ) {
			return $original_url;
		}

		$filename = self::$current_mapping[ $original_url ] ?? null;
		if ( $filename && self::$media_dir ) {
			$file_path = self::$media_dir . '/' . $filename;
			if ( file_exists( $file_path ) ) {
				return $file_path;
			}
		}

		return $original_url;
	}

	/**
	 * Get filename for original URL.
	 *
	 * @param string $original_url Original media URL.
	 * @return string|null Filename if mapping exists, null otherwise.
	 */
	public static function get_filename( $original_url ) {
		return self::$current_mapping[ $original_url ] ?? null;
	}

	/**
	 * Check if URL has a cloud mapping.
	 *
	 * @param string $original_url Original media URL.
	 * @return bool True if mapping exists.
	 */
	public static function has_mapping( $original_url ) {
		return isset( self::$current_mapping[ $original_url ] );
	}

	/**
	 * Get all current mappings.
	 *
	 * @return array Current media mappings.
	 */
	public static function get_all_mappings() {
		return self::$current_mapping;
	}

	/**
	 * Clear current mapping.
	 */
	public static function clear_mapping() {
		self::$current_mapping = [];
	}

	/**
	 * Get mapping statistics.
	 *
	 * @return array Mapping statistics.
	 */
	public static function get_mapping_stats() {
		return [
			'total_mappings' => count( self::$current_mapping ),
			'has_mappings' => ! empty( self::$current_mapping ),
		];
	}
}
