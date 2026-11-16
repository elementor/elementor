<?php

namespace Elementor\Modules\EditorOne\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Top_Bar_Locale_Assets {

	private const LOCALES_RELATIVE_DIRECTORY = 'js/locales/elementor-one-assets/';
	private const SCRIPT_HANDLE_PREFIX = 'elementor-one-top-bar-locale-';

	public static function register_script_loader_filter(): void {
		add_filter( 'script_loader_tag', [ self::class, 'filter_locale_json_script_tag' ], 10, 3 );
	}

	public static function filter_locale_json_script_tag( string $tag, string $handle, string $src ): string {
		if ( ! str_starts_with( $handle, self::SCRIPT_HANDLE_PREFIX ) ) {
			return $tag;
		}

		return sprintf(
			'<link rel="prefetch" href="%1$s" as="fetch" crossorigin="anonymous" id="%2$s-prefetch" />',
			esc_url( $src ),
			esc_attr( $handle )
		) . "\n";
	}

	public static function enqueue_for_languages( array $language_codes ): array {
		$language_base_urls = [];

		foreach ( $language_codes as $language_code ) {
			$language_directory = ELEMENTOR_ASSETS_PATH . self::LOCALES_RELATIVE_DIRECTORY . $language_code;

			if ( ! is_dir( $language_directory ) ) {
				continue;
			}

			$language_base_urls[ $language_code ] = ELEMENTOR_ASSETS_URL . self::LOCALES_RELATIVE_DIRECTORY . $language_code . '/';

			$locale_files = glob( $language_directory . '/*.json' );

			if ( ! is_array( $locale_files ) ) {
				continue;
			}

			foreach ( $locale_files as $locale_file_path ) {
				$namespace = basename( $locale_file_path, '.json' );
				$handle = self::SCRIPT_HANDLE_PREFIX . $language_code . '-' . $namespace;
				$url = $language_base_urls[ $language_code ] . $namespace . '.json';

				wp_enqueue_script(
					$handle,
					$url,
					[ 'editor-one-top-bar' ],
					ELEMENTOR_VERSION,
					true
				);
			}
		}

		return $language_base_urls;
	}
}
