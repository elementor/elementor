<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Font_Awesome_7_Icon_Resolver {
	const JSON_BASE_PATH = ELEMENTOR_ASSETS_PATH . 'lib/font-awesome-7/json/';

	const ALLOWED_JSON_FILES = [ 'solid', 'regular', 'brands' ];

	const MAX_JSON_FILE_BYTES = 5 * 1024 * 1024;

	const TUPLE_WIDTH = 0;

	const TUPLE_HEIGHT = 1;

	const TUPLE_ALIASES = 2;

	const TUPLE_PATH = 4;

	const TUPLE_MIN_LENGTH = 5;

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

		$icon_tuple = $icons[ $icon_name ] ?? null;

		if ( ! $icon_tuple ) {
			return null;
		}

		$paths = self::normalize_paths( $icon_tuple[ self::TUPLE_PATH ] );

		if ( empty( $paths ) ) {
			return null;
		}

		return [
			'width' => $icon_tuple[ self::TUPLE_WIDTH ],
			'height' => $icon_tuple[ self::TUPLE_HEIGHT ],
			'paths' => $paths,
		];
	}

	private static function get_icon_name( string $value ): ?string {
		if ( ! preg_match( '/^fa\S*\s+fa-(.+)$/', $value, $matches ) ) {
			return null;
		}

		return $matches[1];
	}

	private static function get_json_file_name( string $library ): ?string {
		if ( ! preg_match( '/^fa-(solid|regular|brands)$/', $library, $matches ) ) {
			return null;
		}

		return $matches[1];
	}

	private static function load_icons( string $file_name ): ?array {
		if ( isset( self::$icons_by_file[ $file_name ] ) ) {
			return self::$icons_by_file[ $file_name ];
		}

		if ( ! in_array( $file_name, self::ALLOWED_JSON_FILES, true ) ) {
			return null;
		}

		$file_path = self::JSON_BASE_PATH . $file_name . '.json';

		if ( ! is_readable( $file_path ) ) {
			return null;
		}

		$file_size = filesize( $file_path );

		if ( false === $file_size || $file_size > self::MAX_JSON_FILE_BYTES ) {
			return null;
		}

		$file_data = json_decode( file_get_contents( $file_path ), true );

		if ( ! is_array( $file_data ) || ! isset( $file_data['icons'] ) || ! is_array( $file_data['icons'] ) ) {
			return null;
		}

		self::$icons_by_file[ $file_name ] = self::index_icons( $file_data['icons'] );

		return self::$icons_by_file[ $file_name ];
	}

	private static function index_icons( array $icons ): array {
		$index = [];

		foreach ( $icons as $name => $icon_tuple ) {
			if ( ! is_string( $name ) || ! self::is_valid_icon_tuple( $icon_tuple ) ) {
				continue;
			}

			$index[ $name ] = $icon_tuple;

			foreach ( $icon_tuple[ self::TUPLE_ALIASES ] as $alias ) {
				if ( is_string( $alias ) && '' !== $alias && ! isset( $index[ $alias ] ) ) {
					$index[ $alias ] = $icon_tuple;
				}
			}
		}

		return $index;
	}

	private static function is_valid_icon_tuple( $icon_tuple ): bool {
		return is_array( $icon_tuple )
			&& count( $icon_tuple ) >= self::TUPLE_MIN_LENGTH
			&& is_numeric( $icon_tuple[ self::TUPLE_WIDTH ] )
			&& is_numeric( $icon_tuple[ self::TUPLE_HEIGHT ] )
			&& is_array( $icon_tuple[ self::TUPLE_ALIASES ] );
	}

	private static function normalize_paths( $path_data ): array {
		if ( is_string( $path_data ) && '' !== $path_data ) {
			return [ $path_data ];
		}

		if ( ! is_array( $path_data ) ) {
			return [];
		}

		return array_values(
			array_filter(
				$path_data,
				static fn( $path ) => is_string( $path ) && '' !== $path
			)
		);
	}
}
