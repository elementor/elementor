<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

class CSS_Files_Manager {
	const DEFAULT_CSS_DIR = 'elementor/css/';
	const FILE_EXTENSION = '.css';
	const PLACEHOLDERS_EXTENSION = '.placeholders.json';
	// Read and write permissions for the owner
	const PERMISSIONS = 0644;

	public function get( string $handle, string $media, callable $get_payload, bool $is_valid_cache ): ?Style_File {
		$filesystem = $this->get_filesystem();
		$path = $this->get_path( $handle );

		if ( $is_valid_cache ) {
			if ( ! $filesystem->exists( $path ) ) {
				return null;
			}

			// Return the existing file
			return Style_File::create(
				$this->sanitize_handle( $handle ),
				$this->get_filesystem_path( $this->get_path( $handle ) ),
				$this->get_url( $handle ),
				$media,
			);
		}

		$payload = $get_payload();

		if ( is_string( $payload ) ) {
			$css = $payload;
			$placeholders = [];
		} elseif ( is_array( $payload ) ) {
			$css = (string) ( $payload['css'] ?? '' );
			$placeholders = $payload['placeholders'] ?? [];
			if ( ! is_array( $placeholders ) ) {
				$placeholders = [];
			}
		} else {
			return null;
		}

		if ( '' === $css ) {
			return null;
		}

		$filesystem_path = $this->get_filesystem_path( $path );

		$is_created = $filesystem->put_contents( $filesystem_path, $css, self::PERMISSIONS );

		if ( false === $is_created ) {
			return null;
		}

		if ( ! empty( $placeholders ) ) {
			$placeholders_path = $this->get_placeholders_path( $handle );
			$placeholders_fs_path = $this->get_filesystem_path( $placeholders_path );
			$encoded = wp_json_encode( $placeholders, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );

			if ( false === $encoded ) {
				$filesystem->delete( $path );
				return null;
			}

			$placeholders_written = $filesystem->put_contents( $placeholders_fs_path, $encoded, self::PERMISSIONS );

			if ( false === $placeholders_written ) {
				$filesystem->delete( $path );
				return null;
			}
		} else {
			$this->delete_placeholders_file( $handle );
		}

		return Style_File::create(
			$this->sanitize_handle( $handle ),
			$filesystem_path,
			$this->get_url( $handle ),
			$media
		);
	}

	public function load_dynamic_placeholders( string $handle ): array {
		$filesystem = $this->get_filesystem();
		$path = $this->get_placeholders_path( $handle );

		if ( ! $filesystem->exists( $path ) ) {
			return [];
		}

		$raw = $filesystem->get_contents( $path );

		if ( false === $raw || '' === $raw ) {
			return [];
		}

		$decoded = json_decode( $raw, true );

		return is_array( $decoded ) ? $decoded : [];
	}

	public function delete( string $handle ): void {
		$filesystem = $this->get_filesystem();
		$path = $this->get_path( $handle );

		if ( $filesystem->exists( $path ) ) {
			$filesystem->delete( $path );
		}

		$this->delete_placeholders_file( $handle );
	}

	private function delete_placeholders_file( string $handle ): void {
		$filesystem = $this->get_filesystem();
		$path = $this->get_placeholders_path( $handle );

		if ( $filesystem->exists( $path ) ) {
			$filesystem->delete( $path );
		}
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

	private function get_url( string $handle ): string {
		$upload_dir = wp_upload_dir();
		$sanitized_handle = $this->sanitize_handle( $handle );
		$handle = $sanitized_handle . self::FILE_EXTENSION;

		return trailingslashit( $upload_dir['baseurl'] ) . self::DEFAULT_CSS_DIR . $handle;
	}

	private function get_path( string $handle ): string {
		$upload_dir = wp_upload_dir();
		$sanitized_handle = $this->sanitize_handle( $handle );
		$handle = $sanitized_handle . self::FILE_EXTENSION;

		return trailingslashit( $upload_dir['basedir'] ) . self::DEFAULT_CSS_DIR . $handle;
	}

	private function get_placeholders_path( string $handle ): string {
		$upload_dir = wp_upload_dir();
		$sanitized_handle = $this->sanitize_handle( $handle );

		return trailingslashit( $upload_dir['basedir'] ) . self::DEFAULT_CSS_DIR . $sanitized_handle . self::PLACEHOLDERS_EXTENSION;
	}

	private function sanitize_handle( string $handle ): string {
		return preg_replace( '/[^a-zA-Z0-9_-]/', '', $handle );
	}
}
