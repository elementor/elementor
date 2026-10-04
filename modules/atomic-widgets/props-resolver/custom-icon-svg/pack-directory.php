<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Custom_Icon_Svg;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Pack_Directory {
	/**
	 * @return string[]
	 */
	const SVG_FONT_RELATIVE_PATHS = [
		'fontello' => 'font/fontello.svg',
		'icomoon' => 'fonts/icomoon.svg',
		'fontastic' => 'fonts/fontastic.svg',
	];

	const ALLOWED_TYPES = [ 'fontello', 'icomoon', 'fontastic' ];

	public static function detect_type( array $tab ): string {
		$type = isset( $tab['custom_icon_type'] ) && is_string( $tab['custom_icon_type'] )
			? strtolower( $tab['custom_icon_type'] )
			: '';

		if ( in_array( $type, self::ALLOWED_TYPES, true ) ) {
			return $type;
		}

		if ( '' !== $type ) {
			return '';
		}

		$dir = self::resolve( $tab );

		if ( '' === $dir ) {
			return '';
		}

		if ( is_readable( $dir . '/selection.json' ) ) {
			return 'icomoon';
		}

		if ( is_readable( $dir . '/config.json' ) && self::is_svg_font( $dir . '/font/fontello.svg' ) ) {
			return 'fontello';
		}

		if ( self::is_svg_font( $dir . '/fonts/fontastic.svg' ) ) {
			return 'fontastic';
		}

		return '';
	}

	public static function is_supported( array $tab ): bool {
		return '' !== self::detect_type( $tab );
	}

	public static function resolve( array $tab ): string {
		$candidates = self::candidates( $tab );

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
			if ( '' !== $dir && is_dir( $dir ) ) {
				return $dir;
			}
		}

		return $candidates[0] ?? '';
	}

	public static function find_svg_font( string $dir ): string {
		if ( '' === $dir ) {
			return '';
		}

		foreach ( self::SVG_FONT_RELATIVE_PATHS as $relative ) {
			$path = $dir . '/' . $relative;

			if ( self::is_svg_font( $path ) ) {
				return $path;
			}
		}

		return '';
	}

	public static function public_urls( array $tab ): array {
		$dir = self::resolve( $tab );

		if ( '' === $dir || ! function_exists( 'wp_upload_dir' ) ) {
			return [];
		}

		$uploads = wp_upload_dir();
		$basedir = isset( $uploads['basedir'] ) && is_string( $uploads['basedir'] ) ? rtrim( $uploads['basedir'], '/\\' ) : '';
		$baseurl = isset( $uploads['baseurl'] ) && is_string( $uploads['baseurl'] ) ? rtrim( $uploads['baseurl'], '/' ) : '';

		if ( '' === $basedir || '' === $baseurl || ! str_starts_with( $dir, $basedir ) ) {
			return [];
		}

		$url = $baseurl . str_replace( '\\', '/', substr( $dir, strlen( $basedir ) ) );
		$urls = [];

		if ( isset( $tab['fetchJson'] ) && is_string( $tab['fetchJson'] ) && '' !== $tab['fetchJson'] ) {
			$urls['fetchJson'] = $tab['fetchJson'];
		}

		if ( is_readable( $dir . '/config.json' ) ) {
			$urls['configUrl'] = $url . '/config.json';
		}

		if ( is_readable( $dir . '/selection.json' ) ) {
			$urls['selectionUrl'] = $url . '/selection.json';
		}

		$font = self::find_svg_font( $dir );

		if ( '' !== $font && str_starts_with( $font, $dir ) ) {
			$urls['fontUrl'] = $url . str_replace( '\\', '/', substr( $font, strlen( $dir ) ) );
		}

		return $urls;
	}

	/**
	 * @return string[]
	 */
	private static function candidates( array $tab ): array {
		$dirs = [];
		$name = '';

		if ( isset( $tab['name'] ) && is_scalar( $tab['name'] ) ) {
			$name = (string) $tab['name'];
		}

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

	private static function is_svg_font( string $path ): bool {
		if ( ! is_readable( $path ) ) {
			return false;
		}

		$sample = file_get_contents( $path, false, null, 0, 4096 );

		return is_string( $sample ) && ( str_contains( $sample, '<font' ) || str_contains( $sample, '<glyph' ) );
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
}
