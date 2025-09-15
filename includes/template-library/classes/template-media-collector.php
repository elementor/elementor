<?php
namespace Elementor\TemplateLibrary\Classes;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor template media collector.
 *
 * Collects media URLs during template export and creates a media ZIP file.
 *
 * @since 1.0.0
 */
class Template_Media_Collector {

	/**
	 * Collected media URLs and their local filenames.
	 *
	 * @var array
	 */
	private $collected_media = [];

	/**
	 * Temporary directory for media files.
	 *
	 * @var string
	 */
	private $temp_dir = '';

	/**
	 * Constructor.
	 */
	public function __construct() {
		// Hook into media collection action
		add_action( 'elementor/template_library/collect_media_url', [ $this, 'collect_media_url' ], 10, 2 );
	}

	/**
	 * Start media collection for export.
	 */
	public function start_collection() {
		$this->collected_media = [];
		$this->temp_dir = \Elementor\Plugin::$instance->uploads_manager->create_unique_dir();
	}

	/**
	 * Collect a media URL during export.
	 *
	 * @param string $url Media URL.
	 * @param array $media_data Additional media data.
	 */
	public function collect_media_url( $url, $media_data = [] ) {
		if ( ! $this->is_media_url( $url ) || isset( $this->collected_media[ $url ] ) ) {
			return;
		}

		// Download and save media file
		$local_filename = $this->download_and_save_media( $url );
		if ( $local_filename ) {
			$this->collected_media[ $url ] = [
				'original_url' => $url,
				'filename' => $local_filename,
				'data' => $media_data,
			];
		}
	}

	/**
	 * Download and save media file locally.
	 *
	 * @param string $url Media URL.
	 * @return string|false Local filename on success, false on failure.
	 */
	private function download_and_save_media( $url ) {
		// Download file content
		$response = wp_safe_remote_get( $url, [
			'timeout' => 30,
			'user-agent' => 'Elementor Template Exporter',
		] );

		if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
			return false;
		}

		$file_content = wp_remote_retrieve_body( $response );
		if ( empty( $file_content ) ) {
			return false;
		}

		// Generate unique filename
		$original_filename = basename( $url );
		$extension = pathinfo( $original_filename, PATHINFO_EXTENSION );
		$name_without_extension = pathinfo( $original_filename, PATHINFO_FILENAME );
		$unique_filename = sanitize_file_name( $name_without_extension . '_' . uniqid() . '.' . $extension );

		// Save to temp directory
		$file_path = $this->temp_dir . '/' . $unique_filename;
		$saved = file_put_contents( $file_path, $file_content );

		return $saved ? $unique_filename : false;
	}

	/**
	 * Create media ZIP file and return mapping.
	 *
	 * @return array Media mapping and ZIP file info.
	 */
	public function create_media_zip() {
		if ( empty( $this->collected_media ) ) {
			return [
				'mapping' => [],
				'zip_path' => null,
			];
		}

		// Create ZIP file
		if ( ! class_exists( '\ZipArchive' ) ) {
			return [
				'mapping' => [],
				'zip_path' => null,
			];
		}

		$zip = new \ZipArchive();
		$zip_filename = 'template-media-' . uniqid() . '.zip';
		$zip_path = $this->temp_dir . '/' . $zip_filename;

		if ( $zip->open( $zip_path, \ZipArchive::CREATE ) !== true ) {
			return [
				'mapping' => [],
				'zip_path' => null,
			];
		}

		$mapping = [];
		foreach ( $this->collected_media as $url => $media_info ) {
			$file_path = $this->temp_dir . '/' . $media_info['filename'];
			if ( file_exists( $file_path ) ) {
				$zip->addFile( $file_path, $media_info['filename'] );
				$mapping[ $url ] = $media_info['filename'];
			}
		}

		$zip->close();

		return [
			'mapping' => $mapping,
			'zip_path' => $zip_path,
		];
	}

	/**
	 * Clean up temporary files.
	 */
	public function cleanup() {
		if ( $this->temp_dir ) {
			\Elementor\Plugin::$instance->uploads_manager->remove_file_or_dir( $this->temp_dir );
		}
	}

	/**
	 * Check if URL is a media URL.
	 *
	 * @param string $url URL to check.
	 * @return bool True if it's a media URL.
	 */
	private function is_media_url( $url ) {
		if ( ! is_string( $url ) || empty( $url ) ) {
			return false;
		}

		// Skip data URLs, external URLs without media extensions, etc.
		if ( strpos( $url, 'data:' ) === 0 ) {
			return false;
		}

		// Check for common media file extensions
		$media_extensions = [
			'jpg',
			'jpeg',
			'png',
			'gif',
			'webp',
			'svg',
			'bmp',
			'tiff',
			'mp4',
			'webm',
			'ogg',
			'avi',
			'mov',
			'wmv',
			'flv',
			'mp3',
			'wav',
			'wma',
			'aac',
			'pdf',
			'doc',
			'docx',
			'xls',
			'xlsx',
			'ppt',
			'pptx',
			'zip',
			'rar',
		];

		$extension = strtolower( pathinfo( $url, PATHINFO_EXTENSION ) );
		return in_array( $extension, $media_extensions, true );
	}

	/**
	 * Get collected URLs.
	 *
	 * @return array Collected URLs.
	 */
	public function get_collected_urls() {
		return array_unique( $this->collected_urls );
	}
}
