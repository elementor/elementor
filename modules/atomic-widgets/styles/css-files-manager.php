<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

class CSS_Files_Manager {

	/**
	 * Enqueue CSS file with caching support
	 *
	 * @param string   $key     Unique identifier for the CSS file
	 * @param callable $get_css Callback function that returns CSS data
	 * @return bool True if CSS was enqueued, false otherwise
	 */
	public static function enqueue( string $key, callable $get_css ): bool {
		$style = new Style_File( $key );
		$css = $get_css();

		if ( empty( $css['content'] ) ) {
			return false;
		}

		$style->set_content( $css['content'] );

		$bytes_written = self::write_to_file( $style );

		if ( false === $bytes_written ) {
			return false;
		}

		wp_enqueue_style(
			$style->get_handle(),
			$style->get_versioned_url(),
			[],
			null, // Version is handled by get_versioned_url()
			$css['media'] ?? 'all'
		);

		return true;
	}

	/**
	 * Write style content to file
	 *
	 * @param Style_File $style The style file instance
	 * @return bool|int Number of bytes written or false on failure
	 */
	private static function write_to_file( Style_File $style ) {
		return $style->write();
	}

	/**
	 * Delete CSS file
	 *
	 * @param string $key Unique identifier for the CSS file
	 * @return bool True on success, false on failure
	 */
	public static function delete( string $key ): bool {
		$style = new Style_File( $key );

		return $style->delete();
	}

	/**
	 * Check if CSS file exists
	 *
	 * @param string $key Unique identifier for the CSS file
	 * @return bool True if file exists, false otherwise
	 */
	public static function exists( string $key ): bool {
		$style = new Style_File( $key );

		return $style->exists();
	}

	/**
	 * Get CSS file URL
	 *
	 * @param string $key Unique identifier for the CSS file
	 * @return string File URL
	 */
	public static function get_url( string $key ): string {
		$style = new Style_File( $key );

		return $style->get_versioned_url();
	}
}
