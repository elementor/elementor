<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Style_File {
	const DEFAULT_CSS_DIR = 'elementor/css/atomic-widgets/';
	const FILE_EXTENSION = '.css';

	 /**
	 * File handle/key identifier
	 *
	 * @var string
	 */
	private $handle;

	/**
	 * File content
	 *
	 * @var string
	 */
	private $content = '';

	/**
	 * File path
	 *
	 * @var string
	 */
	private $path;

	/**
	 * File URL
	 *
	 * @var string
	 */
	private $url;

	/**
	 * WordPress upload directory info
	 *
	 * @var array
	 */
	private static $wp_upload_dir;

	/**
	 * Constructor
	 *
	 * @param string $handle Unique identifier for the CSS file
	 */
	public function __construct( string $handle ) {
		$this->handle = $this->sanitize_handle( $handle );
		$this->init_file_paths();
	}

	/**
	 * Get file handle
	 *
	 * @return string
	 */
	public function get_handle(): string {
		return $this->handle;
	}

	/**
	 * Get file path
	 *
	 * @return string
	 */
	public function get_path(): string {
		return $this->path;
	}

	/**
	 * Get file URL
	 *
	 * @return string
	 */
	public function get_src(): string {
		return $this->url;
	}

	/**
	 * Get file content
	 *
	 * @return string
	 */
	public function get_content(): string {
		return $this->content;
	}

	/**
	 * Append content to the file
	 *
	 * @param string $content CSS content to append
	 * @return self
	 */
	public function append( string $content ): self {
		$this->content .= $content;
		return $this;
	}

	/**
	 * Set file content (replaces existing content)
	 *
	 * @param string $content CSS content to set
	 * @return self
	 */
	public function set_content( string $content ): self {
		$this->content = $content;
		return $this;
	}

	/**
	 * Write content to file using WordPress Filesystem API
	 *
	 * @return bool|int Number of bytes written or false on failure
	 */
	public function write() {
		if ( empty( $this->content ) ) {
			return false;
		}

		$filesystem = $this->get_filesystem();

		$this->ensure_directory_exists( $filesystem );

		// Convert absolute path to filesystem path
		$filesystem_path = $this->get_filesystem_path();

		return $filesystem->put_contents( $filesystem_path, $this->content, FS_CHMOD_FILE );
	}

	/**
	 * Delete the file using WordPress Filesystem API
	 *
	 * @return bool True on success, false on failure
	 */
	public function delete(): bool {
		$filesystem = $this->get_filesystem();

		$filesystem_path = $this->get_filesystem_path();

		if ( $filesystem->exists( $filesystem_path ) ) {
			return $filesystem->delete( $filesystem_path );
		}

		return true;
	}

	/**
	 * Check if file exists using WordPress Filesystem API
	 *
	 * @return bool
	 */
	public function exists(): bool {
		$filesystem = $this->get_filesystem();

		$filesystem_path = $this->get_filesystem_path();
		return $filesystem->exists( $filesystem_path );
	}

	/**
	 * Get file modification time
	 *
	 * @return int|false Unix timestamp or false on failure
	 */
	public function get_modification_time() {
		$filesystem = $this->get_filesystem();

		$filesystem_path = $this->get_filesystem_path();
		return $filesystem->mtime( $filesystem_path );
	}

	/**
	 * Get file URL with version parameter
	 *
	 * @return string
	 */
	public function get_versioned_url(): string {
		$modification_time = $this->get_modification_time();
		$version = $modification_time ?: time();

		return add_query_arg( 'ver', $version, $this->url );
	}

	/**
	 * Create a new Style_File instance
	 *
	 * @param string $handle File handle
	 * @return self
	 */
	public static function create( string $handle ): self {
		return new self( $handle );
	}

	/**
	 * Get WordPress upload directory info
	 *
	 * @return array
	 */
	private static function get_wp_upload_dir(): array {
		if ( empty( self::$wp_upload_dir ) ) {
			self::$wp_upload_dir = wp_upload_dir( null, false );
		}

		return self::$wp_upload_dir;
	}

	/**
	 * Initialize WordPress Filesystem API
	 *
	 * @return \WP_Filesystem_Base
	 */
	public static function get_filesystem() {
		global $wp_filesystem;

		if ( empty( $wp_filesystem ) ) {
			require_once ABSPATH . '/wp-admin/includes/file.php';

			WP_Filesystem();
		}

		return $wp_filesystem;
	}

	/**
	 * Convert absolute path to filesystem-relative path
	 *
	 * @return string
	 */
	private function get_filesystem_path(): string {
		$filesystem = $this->get_filesystem();

		// Convert absolute path to filesystem path
		return str_replace( ABSPATH, $filesystem->abspath(), $this->path );
	}

	/**
	 * Initialize file paths
	 */
	private function init_file_paths(): void {
		$upload_dir = self::get_wp_upload_dir();
		$filename = $this->handle . self::FILE_EXTENSION;

		$this->path = trailingslashit( $upload_dir['basedir'] ) . self::DEFAULT_CSS_DIR . $filename;
		$this->url = trailingslashit( $upload_dir['baseurl'] ) . self::DEFAULT_CSS_DIR . $filename;
	}

	/**
	 * Sanitize file handle
	 *
	 * @param string $handle
	 * @return string
	 */
	private function sanitize_handle( string $handle ): string {
		// Remove any file extension if provided
		$handle = preg_replace( '/\.' . preg_quote( ltrim( self::FILE_EXTENSION, '.' ), '/' ) . '$/', '', $handle );

		// Sanitize for filesystem
		return sanitize_file_name( $handle );
	}

	/**
	 * Ensure directory exists using WordPress Filesystem API
	 *
	 * @param \WP_Filesystem_Base $filesystem
	 */
	private function ensure_directory_exists( $filesystem ): void {
		$filesystem_path = $this->get_filesystem_path();
		$directory = dirname( $filesystem_path );

		if ( ! $filesystem->is_dir( $directory ) ) {
			$filesystem->mkdir( $directory, FS_CHMOD_DIR );
		}
	}
}
