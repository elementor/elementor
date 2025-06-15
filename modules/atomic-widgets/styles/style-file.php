<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Style_File {
	const DEFAULT_CSS_DIR = 'elementor/css/atomic-widgets/';
	const FILE_EXTENSION = '.css';
	const PERMISSIONS = 0644;

	private string $handle;
	private string $content = '';
	private string $path;
	private string $url;
	private static $wp_upload_dir;
	private \WP_Filesystem_Base $filesystem;

	private function __construct( string $handle ) {
		$this->filesystem = self::get_filesystem();
		$this->handle = $this->sanitize_handle( $handle );
		$this->init_file_paths();
	}

	public function get_handle(): string {
		return $this->handle;
	}

	public function get_content(): string {
		return $this->content;
	}

	public function append( string $content ): self {
		$this->content .= $content;

		return $this;
	}

	public function set_content( string $content ): self {
		$this->content = $content;

		return $this;
	}

	public function write() {
		if ( empty( $this->content ) ) {
			return false;
		}

		$this->ensure_directory_exists( $this->filesystem );
		$filesystem_path = $this->get_filesystem_path();

		return $this->filesystem->put_contents( $filesystem_path, $this->content, self::PERMISSIONS );
	}

	public function delete(): bool {
		$filesystem_path = $this->get_filesystem_path();

		if ( $this->filesystem->exists( $filesystem_path ) ) {
			return $this->filesystem->delete( $filesystem_path );
		}

		return true;
	}

	public function exists(): bool {
		$filesystem_path = $this->get_filesystem_path();

		return $this->filesystem->exists( $filesystem_path );
	}

	public function get_modification_time() {
		$filesystem_path = $this->get_filesystem_path();

		return $this->filesystem->mtime( $filesystem_path );
	}

	public function get_versioned_url(): string {
		$modification_time = $this->get_modification_time();
		$version = $modification_time ?: time();

		return add_query_arg( 'ver', $version, $this->url );
	}

	public static function create( string $handle ): self {
		return new self( $handle );
	}

	private static function get_wp_upload_dir(): array {
		if ( empty( self::$wp_upload_dir ) ) {
			self::$wp_upload_dir = wp_upload_dir( null, false );
		}

		return self::$wp_upload_dir;
	}

	public static function get_filesystem() {
		global $wp_filesystem;

		if ( empty( $wp_filesystem ) ) {
			require_once ABSPATH . '/wp-admin/includes/file.php';
			WP_Filesystem();
		}

		return $wp_filesystem;
	}

	private function get_filesystem_path(): string {
		return str_replace( ABSPATH, $this->filesystem->abspath(), $this->path );
	}

	private function init_file_paths(): void {
		$upload_dir = self::get_wp_upload_dir();
		$filename = $this->handle . self::FILE_EXTENSION;

		$this->path = trailingslashit( $upload_dir['basedir'] ) . self::DEFAULT_CSS_DIR . $filename;
		$this->url = trailingslashit( $upload_dir['baseurl'] ) . self::DEFAULT_CSS_DIR . $filename;
	}

	private function sanitize_handle( string $handle ): string {
		$handle = preg_replace( '/\.[^.]+$/', '', $handle );

		return sanitize_file_name( $handle );
	}

	private function ensure_directory_exists( $filesystem ): void {
		$filesystem_path = $this->get_filesystem_path();
		$directory = dirname( $filesystem_path );

		if ( ! $filesystem->is_dir( $directory ) ) {
			$filesystem->mkdir( $directory, self::PERMISSIONS );
		}
	}
}
