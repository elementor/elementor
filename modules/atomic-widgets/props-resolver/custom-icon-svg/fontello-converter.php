<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Custom_Icon_Svg;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Fontello_Converter implements Svg_Converter {
	public function supports( array $tab ): bool {
		$type = isset( $tab['custom_icon_type'] ) && is_string( $tab['custom_icon_type'] )
			? strtolower( $tab['custom_icon_type'] )
			: '';

		if ( 'fontello' === $type ) {
			return true;
		}

		$dir = self::pack_dir( $tab );

		return '' !== $dir
			&& is_readable( $dir . '/config.json' )
			&& is_readable( $dir . '/font/fontello.svg' );
	}

	public function convert( array $tab, string $icon_value ): string {
		$dir = self::pack_dir( $tab );

		if ( '' === $dir ) {
			return '';
		}

		$config_path = $dir . '/config.json';
		$font_path = $dir . '/font/fontello.svg';

		if ( ! is_readable( $config_path ) || ! is_readable( $font_path ) ) {
			return '';
		}

		$config = file_get_contents( $config_path );
		$font = file_get_contents( $font_path );

		if ( ! is_string( $config ) || ! is_string( $font ) ) {
			return '';
		}

		$prefix = isset( $tab['prefix'] ) && is_string( $tab['prefix'] ) ? $tab['prefix'] : '';
		$icon_name = self::icon_name_from_value( $icon_value, $prefix );

		return Fontello_Glyph_Parser::to_svg( $config, $font, $icon_name, $prefix );
	}

	public static function tab_from_disk( string $library ): ?array {
		$tab = [ 'name' => $library ];
		$dir = self::pack_dir( $tab );

		if ( '' === $dir || ! self::is_fontello_pack( $dir ) ) {
			return null;
		}

		$config_raw = file_get_contents( $dir . '/config.json' );
		$config = is_string( $config_raw ) ? json_decode( $config_raw, true ) : null;
		$prefix = '';
		$names = [];

		if ( is_array( $config ) ) {
			if ( isset( $config['css_prefix_text'] ) && is_string( $config['css_prefix_text'] ) ) {
				$prefix = $config['css_prefix_text'];
			}

			$names = self::names_from_config( $config );
		}

		return [
			'name' => $library,
			'prefix' => $prefix,
			'displayPrefix' => '',
			'icons' => $names,
			'custom_icon_type' => 'fontello',
		];
	}

	public static function names_from_config( array $config ): array {
		if ( empty( $config['glyphs'] ) || ! is_array( $config['glyphs'] ) ) {
			return [];
		}

		$names = [];

		foreach ( $config['glyphs'] as $glyph ) {
			if ( ! is_array( $glyph ) || empty( $glyph['css'] ) || ! is_string( $glyph['css'] ) ) {
				continue;
			}

			$names[] = $glyph['css'];
		}

		return $names;
	}

	public static function pack_urls( array $tab ): array {
		$dir = self::pack_dir( $tab );

		if ( '' === $dir || ! self::is_fontello_pack( $dir ) || ! function_exists( 'wp_upload_dir' ) ) {
			return [];
		}

		$uploads = wp_upload_dir();
		$basedir = isset( $uploads['basedir'] ) && is_string( $uploads['basedir'] ) ? rtrim( $uploads['basedir'], '/\\' ) : '';
		$baseurl = isset( $uploads['baseurl'] ) && is_string( $uploads['baseurl'] ) ? rtrim( $uploads['baseurl'], '/' ) : '';

		if ( '' === $basedir || '' === $baseurl || ! str_starts_with( $dir, $basedir ) ) {
			return [];
		}

		$url = $baseurl . str_replace( '\\', '/', substr( $dir, strlen( $basedir ) ) );

		return [
			'configUrl' => $url . '/config.json',
			'fontUrl' => $url . '/font/fontello.svg',
		];
	}

	public static function pack_dir( array $tab ): string {
		$candidates = self::pack_dir_candidates( $tab );

		if ( function_exists( 'apply_filters' ) ) {
			$filtered = apply_filters(
				'elementor/atomic-widgets/custom-icon-library-dir',
				$candidates[0] ?? '',
				$tab
			);

			if ( is_string( $filtered ) && '' !== $filtered ) {
				array_unshift( $candidates, rtrim( $filtered, '/\\' ) );
			}
		}

		foreach ( array_unique( $candidates ) as $dir ) {
			if ( '' !== $dir && self::is_fontello_pack( $dir ) ) {
				return $dir;
			}
		}

		return $candidates[0] ?? '';
	}

	private static function pack_dir_candidates( array $tab ): array {
		$dirs = [];
		$name = self::tab_name( $tab );
		$base = self::uploads_base();
		$uploads_root = $base ? rtrim( $base, '/\\' ) . '/elementor/custom-icons/' : '';

		if ( '' !== $name && '' !== $uploads_root ) {
			$dirs[] = $uploads_root . $name;
		}

		$from_json = self::dir_from_url( isset( $tab['fetchJson'] ) && is_string( $tab['fetchJson'] ) ? $tab['fetchJson'] : '' );

		if ( '' !== $from_json ) {
			$dirs[] = $from_json;
		}

		return $dirs;
	}

	private static function tab_name( array $tab ): string {
		if ( ! isset( $tab['name'] ) || ! is_scalar( $tab['name'] ) ) {
			return '';
		}

		return (string) $tab['name'];
	}

	private static function is_fontello_pack( string $dir ): bool {
		return is_readable( $dir . '/config.json' ) && is_readable( $dir . '/font/fontello.svg' );
	}

	private static function dir_from_url( string $url ): string {
		if ( '' === $url || ! function_exists( 'wp_upload_dir' ) ) {
			return '';
		}

		$uploads = wp_upload_dir();
		$baseurl = isset( $uploads['baseurl'] ) && is_string( $uploads['baseurl'] ) ? $uploads['baseurl'] : '';
		$basedir = isset( $uploads['basedir'] ) && is_string( $uploads['basedir'] ) ? $uploads['basedir'] : '';

		if ( '' === $baseurl || '' === $basedir || ! str_starts_with( $url, $baseurl ) ) {
			return '';
		}

		$relative = substr( $url, strlen( $baseurl ) );
		$path = rtrim( $basedir, '/\\' ) . $relative;

		return rtrim( dirname( $path ), '/\\' );
	}

	private static function uploads_base(): string {
		if ( ! function_exists( 'wp_upload_dir' ) ) {
			return '';
		}

		$uploads = wp_upload_dir();

		return isset( $uploads['basedir'] ) && is_string( $uploads['basedir'] ) ? $uploads['basedir'] : '';
	}

	private static function icon_name_from_value( string $icon_value, string $prefix ): string {
		$parts = preg_split( '/\s+/', trim( $icon_value ) ) ?: [];
		$last = $parts[ count( $parts ) - 1 ] ?? $icon_value;

		if ( '' !== $prefix && str_starts_with( $last, $prefix ) ) {
			return substr( $last, strlen( $prefix ) );
		}

		return $last;
	}
}
