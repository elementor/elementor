<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Custom_Icon_Svg;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Icomoon_Converter implements Svg_Converter {
	const DEFAULT_VIEWBOX = 1024;

	public function supports( array $tab ): bool {
		$type = isset( $tab['custom_icon_type'] ) && is_string( $tab['custom_icon_type'] )
			? strtolower( $tab['custom_icon_type'] )
			: '';

		if ( 'icomoon' === $type ) {
			return true;
		}

		$dir = self::pack_dir( $tab );

		return '' !== $dir && is_readable( $dir . '/selection.json' );
	}

	public function convert( array $tab, string $icon_value ): string {
		$dir = self::pack_dir( $tab );

		if ( '' === $dir ) {
			return '';
		}

		$selection_path = $dir . '/selection.json';

		if ( is_readable( $selection_path ) ) {
			$raw = file_get_contents( $selection_path );
			$prefix = isset( $tab['prefix'] ) && is_string( $tab['prefix'] ) ? $tab['prefix'] : '';
			$icon_name = Fontello_Converter::icon_name_from_value( $icon_value, $prefix );

			return is_string( $raw ) ? self::svg_from_selection( $raw, $icon_name, $prefix ) : '';
		}

		return '';
	}

	public static function tab_from_disk( string $library ): ?array {
		$tab = [ 'name' => $library ];
		$dir = self::pack_dir( $tab );

		if ( '' === $dir || ! is_readable( $dir . '/selection.json' ) ) {
			return null;
		}

		$raw = file_get_contents( $dir . '/selection.json' );
		$data = is_string( $raw ) ? json_decode( $raw, true ) : null;
		$prefix = '';
		$names = [];

		if ( is_array( $data ) ) {
			$prefix = self::prefix_from_selection( $data );
			$names = self::names_from_selection( $data );
		}

		return [
			'name' => $library,
			'prefix' => $prefix,
			'displayPrefix' => '',
			'icons' => $names,
			'custom_icon_type' => 'icomoon',
		];
	}

	public static function pack_urls( array $tab ): array {
		$dir = self::pack_dir( $tab );

		if ( '' === $dir || ! is_readable( $dir . '/selection.json' ) || ! function_exists( 'wp_upload_dir' ) ) {
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
			'selectionUrl' => $url . '/selection.json',
			'fontUrl' => is_readable( $dir . '/fonts/icomoon.svg' ) ? $url . '/fonts/icomoon.svg' : '',
		];
	}

	public static function pack_dir( array $tab ): string {
		return Fontello_Converter::pack_dir( $tab );
	}

	public static function svg_from_selection( string $json, string $icon_name, string $prefix ): string {
		$data = json_decode( $json, true );

		if ( ! is_array( $data ) || empty( $data['icons'] ) || ! is_array( $data['icons'] ) ) {
			return '';
		}

		$candidates = [ $icon_name ];

		if ( '' !== $prefix && str_starts_with( $icon_name, $prefix ) ) {
			$candidates[] = substr( $icon_name, strlen( $prefix ) );
		}

		foreach ( $data['icons'] as $icon ) {
			if ( ! is_array( $icon ) ) {
				continue;
			}

			$name = self::icon_entry_name( $icon );

			if ( '' === $name || ! in_array( $name, $candidates, true ) ) {
				continue;
			}

			$paths = $icon['icon']['paths'] ?? [];

			if ( ! is_array( $paths ) || empty( $paths ) ) {
				return '';
			}

			$path_markup = '';

			foreach ( $paths as $d ) {
				if ( ! is_string( $d ) || '' === $d ) {
					continue;
				}

				$path_markup .= '<path d="' . htmlspecialchars( $d, ENT_QUOTES, 'UTF-8' ) . '" fill="currentColor"></path>';
			}

			if ( '' === $path_markup ) {
				return '';
			}

			$size = self::DEFAULT_VIEWBOX;

			if ( isset( $icon['icon']['width'] ) && is_numeric( $icon['icon']['width'] ) && (int) $icon['icon']['width'] > 0 ) {
				$size = (int) $icon['icon']['width'];
			}

			return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' . $size . ' ' . $size . '" fill="currentColor" width="100%" height="100%">'
				. $path_markup
				. '</svg>';
		}

		return '';
	}

	public static function names_from_selection( array $data ): array {
		if ( empty( $data['icons'] ) || ! is_array( $data['icons'] ) ) {
			return [];
		}

		$names = [];

		foreach ( $data['icons'] as $icon ) {
			if ( ! is_array( $icon ) ) {
				continue;
			}

			$name = self::icon_entry_name( $icon );

			if ( '' !== $name ) {
				$names[] = $name;
			}
		}

		return $names;
	}

	private static function icon_entry_name( array $icon ): string {
		if ( isset( $icon['properties']['name'] ) && is_string( $icon['properties']['name'] ) ) {
			return $icon['properties']['name'];
		}

		if ( isset( $icon['icon']['tags'][0] ) && is_string( $icon['icon']['tags'][0] ) ) {
			return $icon['icon']['tags'][0];
		}

		return '';
	}

	private static function prefix_from_selection( array $data ): string {
		$prefix = $data['preferences']['fontPref']['prefix'] ?? '';

		return is_string( $prefix ) ? $prefix : '';
	}
}
