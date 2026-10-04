<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Custom_Icon_Svg;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Fontello_Converter implements Svg_Converter {
	private static array $file_cache = [];

	public function supports( array $tab ): bool {
		return in_array( Pack_Directory::detect_type( $tab ), [ 'fontello', 'fontastic' ], true );
	}

	public function convert( array $tab, string $icon_value ): string {
		$dir = self::pack_dir( $tab );

		if ( '' === $dir ) {
			return '';
		}

		$font_path = Pack_Directory::find_svg_font( $dir );

		if ( '' === $font_path ) {
			return '';
		}

		$config = self::read_file( $dir . '/config.json' );
		$font = self::read_file( $font_path );

		if ( '' === $font ) {
			return '';
		}

		$prefix = isset( $tab['prefix'] ) && is_string( $tab['prefix'] ) ? $tab['prefix'] : '';
		$icon_name = self::icon_name_from_value( $icon_value, $prefix );

		return Fontello_Glyph_Parser::to_svg( '' !== $config ? $config : '{}', $font, $icon_name, $prefix );
	}

	public static function tab_from_disk( string $library ): ?array {
		$tab = [ 'name' => $library ];
		$dir = self::pack_dir( $tab );

		$type = Pack_Directory::detect_type( $tab );

		if ( ! in_array( $type, [ 'fontello', 'fontastic' ], true ) ) {
			return null;
		}

		$config_path = $dir . '/config.json';
		$config_raw = is_readable( $config_path ) ? file_get_contents( $config_path ) : false;
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
			'custom_icon_type' => $type,
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
		return Pack_Directory::public_urls( $tab );
	}

	public static function pack_dir( array $tab ): string {
		return Pack_Directory::resolve( $tab );
	}

	private static function read_file( string $path ): string {
		if ( '' === $path || ! is_readable( $path ) ) {
			return '';
		}

		$mtime = filemtime( $path );
		$size = filesize( $path );
		$key = $path
			. '|' . ( false === $mtime ? '0' : (string) $mtime )
			. ':' . ( false === $size ? '0' : (string) $size );

		if ( ! array_key_exists( $key, self::$file_cache ) ) {
			$raw = file_get_contents( $path );
			self::$file_cache[ $key ] = is_string( $raw ) ? $raw : '';
		}

		return self::$file_cache[ $key ];
	}

	public static function icon_name_from_value( string $icon_value, string $prefix ): string {
		$parts = preg_split( '/\s+/', trim( $icon_value ) );

		if ( ! is_array( $parts ) || empty( $parts ) ) {
			return $icon_value;
		}

		$last = $parts[ count( $parts ) - 1 ];

		if ( '' !== $prefix && str_starts_with( $last, $prefix ) ) {
			return substr( $last, strlen( $prefix ) );
		}

		return $last;
	}
}
