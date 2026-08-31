<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Styles\CacheValidity\Cache_Validity;

class CSS_Files_Manager {
	const DEFAULT_CSS_DIR = 'elementor/css/';
	const FILE_EXTENSION = '.css';
	// Read and write permissions for the owner
	const PERMISSIONS = 0644;

	private Cache_Validity $cache_validity;

	public function __construct( ?Cache_Validity $cache_validity = null ) {
		$this->cache_validity = $cache_validity ?? new Cache_Validity();
	}

	/**
	 * Return the CSS file to enqueue for the given cache path, generating it on demand.
	 *
	 * The `should_exist` meta flag distinguishes an intentionally empty file from one
	 * that went missing after being generated, and cache is regenerated whenever it's
	 * invalid or the expected file can't be found on disk.
	 *
	 * @param string        $handle
	 * @param string        $media
	 * @param callable      $get_css
	 * @param array<string> $cache_path Cache-validity leaf path.
	 * @return Style_File|null
	 */
	public function get( string $handle, string $media, callable $get_css, array $cache_path ): ?Style_File {
		$path = $this->get_path( $handle );
		$is_cache_valid = $this->cache_validity->is_valid( $cache_path );
		$should_exist = $this->get_should_exist_meta( $cache_path );

		if ( $is_cache_valid ) {
			if ( false === $should_exist ) {
				return null;
			}

			if ( $this->has_non_empty_file( $path ) ) {
				return $this->create_style_file( $handle, $path, $media );
			}
		}

		$css = $get_css();

		if ( empty( $css ) ) {
			// Nothing to serve for this path; purge any stale file and record the state
			// so we don't try to regenerate on every subsequent request.
			$this->delete_if_exists( $path );
			$this->cache_validity->validate( $cache_path, [ 'should_exist' => false ] );

			return null;
		}

		$filesystem_path = $this->get_filesystem_path( $path );

		if ( ! $this->write_atomically( $filesystem_path, $css ) ) {
			// Hard write failure: leave the cache invalid so the next request retries.
			return null;
		}

		$this->cache_validity->validate( $cache_path, [ 'should_exist' => true ] );

		return $this->create_style_file( $handle, $path, $media );
	}

	public function delete( string $handle ): void {
		$this->delete_if_exists( $this->get_path( $handle ) );
	}

	private function get_should_exist_meta( array $cache_path ): ?bool {
		$meta = $this->cache_validity->get_meta( $cache_path );

		if ( ! is_array( $meta ) || ! array_key_exists( 'should_exist', $meta ) ) {
			return null;
		}

		return (bool) $meta['should_exist'];
	}

	private function create_style_file( string $handle, string $path, string $media ): Style_File {
		return Style_File::create(
			$this->sanitize_handle( $handle ),
			$this->get_filesystem_path( $path ),
			$this->get_url( $handle ),
			$media
		);
	}

	private function has_non_empty_file( string $path ): bool {
		$filesystem = $this->get_filesystem();

		if ( ! $filesystem->exists( $path ) ) {
			return false;
		}

		$size = $filesystem->size( $path );

		// `size()` may return false on filesystems that don't support it; treat that as
		// "we don't know" and fall back to trusting the existence check.
		if ( false === $size ) {
			return true;
		}

		return $size > 0;
	}

	private function delete_if_exists( string $path ): void {
		$filesystem = $this->get_filesystem();

		if ( ! $filesystem->exists( $path ) ) {
			return;
		}

		$filesystem->delete( $path );
	}

	/**
	 * Write to a temp file first and then move it into place. The move step is atomic on
	 * POSIX filesystems, so the public URL cannot serve a partial or zero-byte asset while a
	 * concurrent render is in progress. If the atomic move is not supported by the current
	 * filesystem adapter, fall back to a direct write.
	 */
	private function write_atomically( string $filesystem_path, string $css ): bool {
		$filesystem = $this->get_filesystem();

		$tmp_path = $filesystem_path . '.tmp-' . wp_generate_password( 8, false, false );

		$is_written = $filesystem->put_contents( $tmp_path, $css, self::PERMISSIONS );

		if ( false === $is_written ) {
			return false;
		}

		if ( ! method_exists( $filesystem, 'move' ) || ! $filesystem->move( $tmp_path, $filesystem_path, true ) ) {
			$fallback = $filesystem->put_contents( $filesystem_path, $css, self::PERMISSIONS );

			if ( $filesystem->exists( $tmp_path ) ) {
				$filesystem->delete( $tmp_path );
			}

			return false !== $fallback;
		}

		return true;
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

	private function sanitize_handle( string $handle ): string {
		return preg_replace( '/[^a-zA-Z0-9_-]/', '', $handle );
	}
}
