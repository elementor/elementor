<?php
namespace Elementor\TemplateLibrary\Classes;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor media collector.
 *
 * Collects media URLs during export and creates a media ZIP file.
 */
class Media_Collector {

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

	public function __construct() {
		add_action( 'elementor/templates/collect_media_url', [ $this, 'collect_media_url' ], 10, 2 );
	}

	/**
	 * Start media collection for export.
	 */
	public function start_collection() {
		$this->collected_media = [];
		$this->temp_dir = \Elementor\Plugin::$instance->uploads_manager->create_unique_dir();
	}

	public function collect_media_url( string $url, array $media_data = [] ) {
		if ( ! $this->is_media_url( $url ) || isset( $this->collected_media[ $url ] ) ) {
			return;
		}

		$local_filename = $this->download_and_save_media( $url );
		if ( $local_filename ) {
			$this->collected_media[ $url ] = [
				'original_url' => $url,
				'filename' => $local_filename,
				'data' => $media_data,
			];
		}
	}

	private function download_and_save_media( string $url ): string|false {
		if ( $this->is_local_url( $url ) ) {
			$local_file_path = $this->get_local_file_path( $url );
			if ( $local_file_path && file_exists( $local_file_path ) ) {
				return $this->copy_local_file( $local_file_path, $url );
			}
		}

		return $this->download_via_http( $url );
	}

	private function is_local_url( string $url ): bool {
		$site_url = get_site_url();
		$home_url = get_home_url();

		return strpos( $url, $site_url ) === 0 || strpos( $url, $home_url ) === 0;
	}

	private function get_local_file_path( string $url ): string|false {
		$site_url = get_site_url();
		$home_url = get_home_url();

		$relative_path = str_replace( [ $site_url, $home_url ], '', $url );
		$relative_path = ltrim( $relative_path, '/' );

		$upload_dir = wp_upload_dir();
		$uploads_path = $upload_dir['basedir'];

		$possible_paths = [
			$uploads_path . '/' . $relative_path,
			ABSPATH . $relative_path,
			$uploads_path . '/' . basename( $url ),
		];

		foreach ( $possible_paths as $path ) {
			if ( file_exists( $path ) ) {
				return $path;
			}
		}

		return false;
	}

	private function copy_local_file( string $source_path, string $original_url ): string|false {
		$original_filename = basename( $original_url );
		$extension = pathinfo( $original_filename, PATHINFO_EXTENSION );
		$name_without_extension = pathinfo( $original_filename, PATHINFO_FILENAME );
		$unique_filename = sanitize_file_name( $name_without_extension . '_' . uniqid() . '.' . $extension );

		$destination_path = $this->temp_dir . '/' . $unique_filename;
		$copied = copy( $source_path, $destination_path );

		return $copied ? $unique_filename : false;
	}

	private function download_via_http( string $url ): string|false {
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

		$original_filename = basename( $url );
		$extension = pathinfo( $original_filename, PATHINFO_EXTENSION );
		$name_without_extension = pathinfo( $original_filename, PATHINFO_FILENAME );
		$unique_filename = sanitize_file_name( $name_without_extension . '_' . uniqid() . '.' . $extension );

		$file_path = $this->temp_dir . '/' . $unique_filename;
		$saved = file_put_contents( $file_path, $file_content );

		return $saved ? $unique_filename : false;
	}

	public function create_media_zip(): array {
		if ( empty( $this->collected_media ) ) {
			return [
				'mapping' => [],
				'zip_path' => null,
			];
		}

		if ( ! class_exists( '\ZipArchive' ) ) {
			return [
				'mapping' => [],
				'zip_path' => null,
			];
		}

		$zip = new \ZipArchive();
		$zip_filename = 'media-' . uniqid() . '.zip';
		$zip_path = $this->temp_dir . $zip_filename;

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

	public function cleanup() {
		if ( $this->temp_dir ) {
			\Elementor\Plugin::$instance->uploads_manager->remove_file_or_dir( $this->temp_dir );
		}
	}

	private function is_media_url( $url ) {
		if ( ! is_string( $url ) || empty( $url ) ) {
			return false;
		}

		if ( strpos( $url, 'data:' ) === 0 ) {
			return false;
		}

		$allowed_mime_types = get_allowed_mime_types();
		$file_extension = strtolower( pathinfo( $url, PATHINFO_EXTENSION ) );

		foreach ( $allowed_mime_types as $pattern => $mime_type ) {
			$pattern_regex = '/^(' . str_replace( '|', '|', $pattern ) . ')$/i';
			if ( preg_match( $pattern_regex, $file_extension ) ) {
				return true;
			}
		}

		return false;
	}
}
