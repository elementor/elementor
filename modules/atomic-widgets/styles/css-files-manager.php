<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

class CSS_Files_Manager {
	const DEFAULT_CSS_DIR = 'elementor/css/';
	const FILE_EXTENSION = '.css';
	// Read and write permissions for the owner
	const PERMISSIONS = 0644;

	public function get( string $handle, string $media, callable $get_payload, bool $is_valid_cache ): ?Style_File {
		$filesystem = $this->get_filesystem();
		$path = $this->get_path( $handle );

		if ( $is_valid_cache ) {
			if ( ! $filesystem->exists( $path ) ) {
				return null;
			}

			return Style_File::create(
				$this->sanitize_handle( $handle ),
				$this->get_filesystem_path( $this->get_path( $handle ) ),
				$this->get_url( $handle ),
				$media,
			);
		}

		$bundle = $this->normalize_payload( $get_payload() );

		if ( null === $bundle || '' === $bundle->get_css() ) {
			return null;
		}

		$filesystem_path = $this->get_filesystem_path( $path );

		$is_created = $filesystem->put_contents( $filesystem_path, $bundle->get_css(), self::PERMISSIONS );

		if ( false === $is_created ) {
			return null;
		}

		$this->write_sidecars( $handle, $bundle->get_sidecars(), $filesystem, $path );

		return Style_File::create(
			$this->sanitize_handle( $handle ),
			$filesystem_path,
			$this->get_url( $handle ),
			$media
		);
	}

	/**
	 * @return array<string, array>
	 */
	public function load_sidecar( string $handle, string $extension ): array {
		$filesystem = $this->get_filesystem();
		$path = $this->get_sidecar_path( $handle, $extension );

		if ( ! $filesystem->exists( $path ) ) {
			return [];
		}

		$raw = $filesystem->get_contents( $path );

		if ( false === $raw || '' === $raw ) {
			return [];
		}

		if ( ! is_string( $raw ) ) {
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

		$this->delete_all_sidecars( $handle );
	}

	/**
	 * @param array<string, string> $sidecars
	 */
	private function write_sidecars( string $handle, array $sidecars, \WP_Filesystem_Base $filesystem, string $css_path ): void {
		$this->delete_all_sidecars( $handle );

		foreach ( $sidecars as $extension => $contents ) {
			if ( '' === $contents ) {
				continue;
			}

			$sidecar_path = $this->get_sidecar_path( $handle, $extension );
			$sidecar_fs_path = $this->get_filesystem_path( $sidecar_path );
			$written = $filesystem->put_contents( $sidecar_fs_path, $contents, self::PERMISSIONS );

			if ( false === $written ) {
				$filesystem->delete( $css_path );
				return;
			}
		}
	}

	private function delete_all_sidecars( string $handle ): void {
		$filesystem = $this->get_filesystem();

		foreach ( $this->get_known_sidecar_extensions() as $extension ) {
			$path = $this->get_sidecar_path( $handle, $extension );

			if ( $filesystem->exists( $path ) ) {
				$filesystem->delete( $path );
			}
		}
	}

	/**
	 * @return string[]
	 */
	private function get_known_sidecar_extensions(): array {
		return [
			Dynamic_Styles_Manager::DEFINITIONS_EXTENSION,
			Dynamic_Styles_Manager::LEGACY_PLACEHOLDERS_EXTENSION,
		];
	}

	private function normalize_payload( $payload ): ?Style_Cache_Bundle {
		if ( $payload instanceof Style_Cache_Bundle ) {
			return $payload;
		}

		if ( is_string( $payload ) ) {
			return Style_Cache_Bundle::create( $payload );
		}

		if ( ! is_array( $payload ) ) {
			return null;
		}

		$css = (string) ( $payload['css'] ?? '' );
		$sidecars = [];

		if ( ! empty( $payload['sidecars'] ) && is_array( $payload['sidecars'] ) ) {
			foreach ( $payload['sidecars'] as $extension => $contents ) {
				if ( is_string( $extension ) && is_string( $contents ) ) {
					$sidecars[ $extension ] = $contents;
				}
			}
		}

		$placeholders = $payload['placeholders'] ?? [];

		if ( is_array( $placeholders ) && ! empty( $placeholders ) ) {
			$encoded = wp_json_encode( $placeholders, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );

			if ( false !== $encoded ) {
				$sidecars[ Dynamic_Styles_Manager::DEFINITIONS_EXTENSION ] = $encoded;
			}
		}

		return Style_Cache_Bundle::create( $css, $sidecars );
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

	private function get_sidecar_path( string $handle, string $extension ): string {
		$upload_dir = wp_upload_dir();
		$sanitized_handle = $this->sanitize_handle( $handle );

		return trailingslashit( $upload_dir['basedir'] ) . self::DEFAULT_CSS_DIR . $sanitized_handle . $extension;
	}

	private function sanitize_handle( string $handle ): string {
		return preg_replace( '/[^a-zA-Z0-9_-]/', '', $handle );
	}
}
