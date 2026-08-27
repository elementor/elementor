<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Font_Awesome_7_Icon_Resolver {
	const JSON_BASE_PATH = ELEMENTOR_ASSETS_PATH . 'lib/font-awesome-7/json/';

	private static $icons_by_file = [];

	public static function is_supported_library( string $library ): bool {
		return str_starts_with( $library, 'fa-' );
	}

	public static function resolve( string $value, string $library ): ?array {
		$icon_name = self::get_icon_name( $value );
		$file_name = self::get_json_file_name( $library );

		if ( ! $icon_name || ! $file_name ) {
			return null;
		}

		$icons = self::load_icons( $file_name );

		if ( ! $icons ) {
			return null;
		}

		$icon_tuple = self::find_icon_tuple( $icons, $icon_name );

		if ( ! $icon_tuple ) {
			return null;
		}

		return [
			'width' => $icon_tuple[0],
			'height' => $icon_tuple[1],
			'paths' => self::normalize_paths( $icon_tuple[4] ),
		];
	}

	private static function get_icon_name( string $value ): ?string {
		if ( ! preg_match( '/^fa\S*\s+fa-(.+)$/', $value, $matches ) ) {
			return null;
		}

		return $matches[1];
	}

	private static function get_json_file_name( string $library ): ?string {
		if ( ! self::is_supported_library( $library ) ) {
			return null;
		}

		return str_replace( 'fa-', '', $library );
	}

	private static function load_icons( string $file_name ): ?array {
		if ( isset( self::$icons_by_file[ $file_name ] ) ) {
			return self::$icons_by_file[ $file_name ];
		}

		$file_path = self::JSON_BASE_PATH . $file_name . '.json';

		if ( ! is_readable( $file_path ) ) {
			return null;
		}

		$file_data = json_decode( file_get_contents( $file_path ), true );
		$icons = $file_data['icons'] ?? null;

		if ( ! is_array( $icons ) ) {
			return null;
		}

		self::$icons_by_file[ $file_name ] = $icons;

		return $icons;
	}

	private static function find_icon_tuple( array $icons, string $icon_name ): ?array {
		if ( isset( $icons[ $icon_name ] ) ) {
			return $icons[ $icon_name ];
		}

		foreach ( $icons as $icon_tuple ) {
			if ( ! is_array( $icon_tuple ) || ! isset( $icon_tuple[2] ) || ! is_array( $icon_tuple[2] ) ) {
				continue;
			}

			foreach ( $icon_tuple[2] as $alias ) {
				if ( is_string( $alias ) && $alias === $icon_name ) {
					return $icon_tuple;
				}
			}
		}

		return null;
	}

	private static function normalize_paths( $path_data ): array {
		if ( is_string( $path_data ) && $path_data !== '' ) {
			return [ $path_data ];
		}

		if ( ! is_array( $path_data ) ) {
			return [];
		}

		return array_values(
			array_filter(
				$path_data,
				static fn( $path ) => is_string( $path ) && $path !== ''
			)
		);
	}
}
