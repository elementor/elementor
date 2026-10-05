<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Custom_Icon_Svg;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Icomoon_Converter implements Svg_Converter {
	const DEFAULT_VIEWBOX = 1024;

	public function supports( array $tab ): bool {
		return 'icomoon' === Pack_Directory::detect_type( $tab );
	}

	public function convert( array $tab, string $icon_value ): string {
		$dir = self::pack_dir( $tab );

		if ( '' === $dir ) {
			return '';
		}

		$prefix = isset( $tab['prefix'] ) && is_string( $tab['prefix'] ) ? $tab['prefix'] : '';
		$icon_name = Fontello_Converter::icon_name_from_value( $icon_value, $prefix );
		$selection_path = $dir . '/selection.json';

		if ( is_readable( $selection_path ) ) {
			$raw = file_get_contents( $selection_path );
			$from_selection = is_string( $raw ) ? self::svg_from_selection( $raw, $icon_name, $prefix ) : '';

			if ( '' !== $from_selection ) {
				return $from_selection;
			}
		}

		$font_path = Pack_Directory::find_svg_font( $dir );

		if ( '' === $font_path ) {
			return '';
		}

		$font = file_get_contents( $font_path );
		$config_path = $dir . '/config.json';
		$config = is_readable( $config_path ) ? file_get_contents( $config_path ) : '{}';

		if ( ! is_string( $font ) ) {
			return '';
		}

		return Fontello_Glyph_Parser::to_svg( is_string( $config ) ? $config : '{}', $font, $icon_name, $prefix );
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
		return Pack_Directory::public_urls( $tab );
	}

	public static function pack_dir( array $tab ): string {
		return Pack_Directory::resolve( $tab );
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
