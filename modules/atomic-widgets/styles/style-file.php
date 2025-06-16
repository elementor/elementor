<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Style_File {
	const FILE_EXTENSION = '.css';

	private string $filename;
	private string $directory_path;

	public function __construct( string $filename, string $directory_path ) {
		$this->filename = $filename;
		$this->directory_path = $directory_path;
	}

	public static function make( string $filename, string $directory_path ): self {
		return new self( $filename, $directory_path );
	}

	public function get_filename(): string {
		return $this->sanitize_filename( $this->filename );
	}

	public function get_url(): string {
		$upload_dir = wp_upload_dir();
		$sanitized_handle = $this->sanitize_filename( $this->filename );
		$filename = $sanitized_handle . self::FILE_EXTENSION;

		return trailingslashit( $upload_dir['baseurl'] ) . $this->directory_path . $filename;
	}

	public function get_path(): string {
		$upload_dir = wp_upload_dir();
		$sanitized_handle = $this->sanitize_filename( $this->filename );
		$filename = $sanitized_handle . self::FILE_EXTENSION;

		return trailingslashit( $upload_dir['basedir'] ) . $this->directory_path . $filename;
	}

	private function sanitize_filename( string $filename ): string {
		$filename = preg_replace( '/\.[^.]+$/', '', $filename );

		return sanitize_file_name( $filename );
	}
}
