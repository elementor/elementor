<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

class CSS_Files_Manager {
	const DEFAULT_CSS_DIR = 'elementor/css/';
	const FILE_EXTENSION = '.css';
	const PERMISSIONS = 0644;

	public function get( string $filename, callable $get_css ): Style_File {
		// TODO: Check if the file is cached and return it if so.
		$css = $get_css();

		$path = $this->get_path( $filename );
		$filesystem_path = $this->get_filesystem_path( $path );

		$filesystem = $this->get_filesystem();
		$is_created = $filesystem->put_contents( $filesystem_path, $css['content'], self::PERMISSIONS );

		if ( false === $is_created ) {
			throw new \Exception( 'Could not write the file: ' . $filesystem_path );
		}

		return Style_File::create(
			$this->sanitize_filename( $filename ),
			$filesystem_path,
			$this->get_url( $filename )
		);
	}

	private function get_filesystem(): \WP_Filesystem_Base {
		global $wp_filesystem;

		if ( empty( $wp_filesystem ) ) {
			require_once ABSPATH . '/wp-admin/includes/file.php';
			WP_Filesystem();
		}

		return $wp_filesystem;
	}

	private function get_filesystem_path( $path ): string {
				$filesystem = $this->get_filesystem();

		return str_replace( ABSPATH, $filesystem->abspath(), $path );
	}

	private function get_url( string $filename ): string {
		$upload_dir = wp_upload_dir();
		$sanitized_handle = $this->sanitize_filename( $filename );
		$filename = $sanitized_handle . self::FILE_EXTENSION;

		return trailingslashit( $upload_dir['baseurl'] ) . self::DEFAULT_CSS_DIR . $filename;
	}

	private function get_path( string $filename ): string {
		$upload_dir = wp_upload_dir();
		$sanitized_handle = $this->sanitize_filename( $filename );
		$filename = $sanitized_handle . self::FILE_EXTENSION;

		return trailingslashit( $upload_dir['basedir'] ) . self::DEFAULT_CSS_DIR . $filename;
	}

	private function sanitize_filename( string $filename ): string {
		$filename = preg_replace( '/\.[^.]+$/', '', $filename );

		return sanitize_file_name( $filename );
	}
}
