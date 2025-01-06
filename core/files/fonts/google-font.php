<?php
namespace Elementor\Core\Files\Fonts;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Google_Font {

	const FOLDER_BASE = 'elementor/google-fonts';

	const FOLDER_CSS = 'css';

	const FOLDER_FONTS = 'fonts';

	const AVAILABLE_FOLDERS = [
		self::FOLDER_CSS,
		self::FOLDER_FONTS,
	];

	const UA_STRING = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';

	private static array $folders = [];

	public static function enqueue( string $font_name ): bool {
		if ( static::enqueue_style( $font_name ) ) {
			return true;
		}

		if ( ! static::fetch_font_data( $font_name ) ) {
			static::enqueue_from_cdn( $font_name );
			return false;
		}

		return static::enqueue_style( $font_name );
	}

	private static function sanitize_font_name( string $font_name ): string {
		return sanitize_key( $font_name );

	}

	private static function enqueue_style( string $font_name ): bool {
		$sanitize_font_name = static::sanitize_font_name( $font_name );

		$font_data = static::get_font_data( $sanitize_font_name );

		if ( empty( $font_data['url'] ) ) {
			return false;
		}

		wp_enqueue_style(
			'elementor-gf-local-' . $sanitize_font_name,
			$font_data['url'],
			[],
			$font_data['version']
		);

		return true;
	}

	private static function get_font_data( string $font_name ) {
		$local_google_fonts = static::get_local_google_fonts();

		return $local_google_fonts[ $font_name ] ?? null;
	}

	private static function get_local_google_fonts(): array {
		return (array) get_option( '_elementor_local_google_fonts', [] );
	}

	private static function set_local_google_fonts( string $font_name, array $font_data ): void {
		$local_google_fonts = static::get_local_google_fonts();

		$local_google_fonts[ $font_name ] = $font_data;

		update_option( '_elementor_local_google_fonts', $local_google_fonts );
	}

	private static function fetch_font_data( string $font_name ): bool {
		$sanitize_font_name = static::sanitize_font_name( $font_name );

		$fonts_folder = static::get_folder( static::FOLDER_FONTS );
		$css_folder = static::get_folder( static::FOLDER_CSS );

		if ( empty( $fonts_folder ) || empty( $css_folder ) ) {
			return false;
		}

		$css_content = static::get_css_content( $font_name );

		if ( empty( $css_content ) ) {
			return false;
		}

		$font_data = [
			'url' => $css_folder['url'] . $sanitize_font_name . '.css',
			'version' => time(),
		];

		$css_folder_path = $css_folder['path'] . $sanitize_font_name . '.css';

		$is_font_file_saved = file_put_contents( $css_folder_path, $css_content );

		if ( ! $is_font_file_saved ) {
			return false;
		}

		static::set_local_google_fonts( $sanitize_font_name, $font_data );

		return true;
	}

	private static function get_folder( string $folder ): array {
		$folders = static::get_folders();

		return $folders[ $folder ] ?? [];
	}

	private static function get_folders(): array {
		static::init_folders();

		return static::$folders;
	}

	private static function init_folders(): void {
		if ( ! empty( static::$folders ) ) {
			return;
		}

		static::$folders = [];

		$upload_dir = wp_upload_dir();

		foreach ( static::AVAILABLE_FOLDERS as $folder ) {
			$folder_path = $upload_dir['basedir'] . '/' . static::FOLDER_BASE . '/' . $folder;
			$folder_url = $upload_dir['baseurl'] . '/' . static::FOLDER_BASE . '/' . $folder;

			if ( ! file_exists( $folder_path ) ) {
				wp_mkdir_p( $folder_path );
			}

			static::$folders[ $folder ] = [
				'path' => trailingslashit( $folder_path ),
				'url' => trailingslashit( $folder_url ),
			];
		}
	}

	private static function get_css_content( string $font_name ): string {
		$css_content = static::get_raw_css_content( $font_name );

		if ( empty( $css_content ) ) {
			return '';
		}

		return static::download_fonts( $font_name, $css_content );
	}

	private static function get_raw_css_content( string $font_name ): string {
		$font_url = static::get_google_fonts_remote_url( [ $font_name ] );

		$css_content_response = wp_remote_get( $font_url, [
			'headers' => [
				'User-Agent' => static::UA_STRING,
			],
		] );

		if ( is_wp_error( $css_content_response ) || 200 !== (int) wp_remote_retrieve_response_code( $css_content_response ) ) {
			return '';
		}

		return wp_remote_retrieve_body( $css_content_response );
	}

	private static function get_google_fonts_remote_url( array $fonts ): string {
		return Plugin::$instance->frontend->get_stable_google_fonts_url( $fonts );
	}

	private static function download_fonts( string $font_name, string $css_content ): string {
		preg_match_all( '/url\(([^)]+)\)/', $css_content, $font_urls );

		if ( ! function_exists( 'download_url' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}

		if ( ! empty( $font_urls[1] ) ) {
			$font_urls = $font_urls[1];

			$fonts_folder = static::get_folder( static::FOLDER_FONTS );
			$sanitize_font_name = static::sanitize_font_name( $font_name );

			foreach ( $font_urls as $current_font_url ) {
				$current_font_url = trim( $current_font_url, '\'"' );

				$tmp_font_file = download_url( $current_font_url );
				if ( is_wp_error( $tmp_font_file ) ) {
					@unlink( $tmp_font_file );

					return '';
				}

				$current_font_basename = $sanitize_font_name . '-' . strtolower( sanitize_file_name( basename( $current_font_url ) ) );

				$dest_file = $fonts_folder['path'] . $current_font_basename;
				$dest_file_url = $fonts_folder['url'] . $current_font_basename;

				// Use copy and unlink because rename breaks streams.
				// phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
				$is_font_file_saved = @copy( $tmp_font_file, $dest_file );
				@unlink( $tmp_font_file );

				if ( ! $is_font_file_saved ) {
					return '';
				}

				$css_content = str_replace( $current_font_url, $dest_file_url, $css_content );
			}
		}

		return $css_content;
	}

	private static function enqueue_from_cdn( string $font_name ): void {
		$font_url = static::get_google_fonts_remote_url( [ $font_name ] );

		$sanitize_font_name = static::sanitize_font_name( $font_name );

		// phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
		wp_enqueue_style(
			'elementor-gf-' . $sanitize_font_name,
			$font_url,
			[],
			null
		);
	}

	public static function clear_cache() {
		$folders = static::get_folders();

		foreach ( $folders as $folder ) {
			$path = $folder['path'] . '*';

			foreach ( glob( $path ) as $file_path ) {
				unlink( $file_path );
			}
		}

		delete_option( '_elementor_local_google_fonts' );
	}
}
