<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Custom_Icon_Svg;

use Elementor\Core\Page_Assets\Data_Managers\Font_Icon_Svg\Manager as Font_Icon_Svg_Data_Manager;
use Elementor\Core\Utils\Svg\Svg_Sanitizer;
use Elementor\Icons_Manager;
use Elementor\Modules\AtomicWidgets\PropsResolver\Font_Awesome_7_Icon_Resolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Resolver {
	const CACHE_GROUP = 'elementor_custom_icon_svg';

	const MAX_LIBRARY_ICONS = 250;

	private static array $memory = [];

	public static function reset_memory(): void {
		self::$memory = [];
	}

	public static function resolve( array $icon ): string {
		if ( ! Availability::is_enabled() ) {
			return '';
		}

		$library = isset( $icon['library'] ) && is_string( $icon['library'] ) ? $icon['library'] : '';
		$value = isset( $icon['value'] ) && is_string( $icon['value'] ) ? $icon['value'] : '';

		if ( '' === $library || '' === $value ) {
			return '';
		}

		if ( Font_Awesome_7_Icon_Resolver::is_supported_library( $library ) ) {
			return '';
		}

		if ( Font_Icon_Svg_Data_Manager::get_font_family( $library ) ) {
			return '';
		}

		$tab = self::tab_for_library( $library );

		if ( ! $tab || ! Pack_Directory::is_supported( $tab ) ) {
			return '';
		}

		$cache_key = self::cache_key( $library, $value, $tab );

		$cached = self::cache_get( $cache_key );

		if ( is_string( $cached ) ) {
			return $cached;
		}

		$converter = Converter_Registry::for_tab( $tab );
		$markup = $converter ? $converter->convert( $tab, $value ) : '';
		$markup = self::sanitize( $markup );

		self::cache_set( $cache_key, $markup );

		return $markup;
	}

	public static function resolve_library( string $library ): array {
		if ( ! Availability::is_enabled() ) {
			return [];
		}

		$tab = self::tab_for_library( $library );

		if ( ! $tab || ! Pack_Directory::is_supported( $tab ) ) {
			return [];
		}

		$names = array_slice( self::icon_names( $tab ), 0, self::MAX_LIBRARY_ICONS );
		$prefix = isset( $tab['prefix'] ) && is_string( $tab['prefix'] ) ? $tab['prefix'] : '';
		$display_prefix = isset( $tab['displayPrefix'] ) && is_string( $tab['displayPrefix'] ) && '' !== $tab['displayPrefix']
			? $tab['displayPrefix']
			: rtrim( $prefix, '-' );

		$result = [];

		foreach ( $names as $name ) {
			$value = trim( $display_prefix . ' ' . $prefix . $name );
			$markup = self::resolve( [
				'library' => $library,
				'value' => $value,
			] );

			if ( '' !== $markup ) {
				$result[ $value ] = $markup;
			}
		}

		return $result;
	}

	private static function sanitize( string $markup ): string {
		if ( '' === $markup || ! class_exists( Svg_Sanitizer::class ) ) {
			return $markup;
		}

		$sanitized = ( new Svg_Sanitizer() )->sanitize( $markup );

		return is_string( $sanitized ) ? $sanitized : '';
	}

	private static function tab_for_library( string $library ): ?array {
		$tab = self::get_tab( $library );

		if ( ! $tab ) {
			return null;
		}

		$from_disk = Icomoon_Converter::tab_from_disk( $library ) ?? Fontello_Converter::tab_from_disk( $library );

		if ( ! $from_disk ) {
			return $tab;
		}

		if ( empty( $tab['prefix'] ) && ! empty( $from_disk['prefix'] ) ) {
			$tab['prefix'] = $from_disk['prefix'];
		}

		if ( empty( $tab['icons'] ) && ! empty( $from_disk['icons'] ) ) {
			$tab['icons'] = $from_disk['icons'];
		}

		if ( empty( $tab['custom_icon_type'] ) && ! empty( $from_disk['custom_icon_type'] ) ) {
			$tab['custom_icon_type'] = $from_disk['custom_icon_type'];
		}

		return $tab;
	}

	private static function get_tab( string $library ): ?array {
		if ( ! class_exists( Icons_Manager::class ) ) {
			return null;
		}

		foreach ( Icons_Manager::get_icon_manager_tabs() as $name => $tab ) {
			if ( ! is_array( $tab ) ) {
				continue;
			}

			$tab_name = isset( $tab['name'] ) && is_scalar( $tab['name'] ) ? (string) $tab['name'] : '';

			if ( (string) $name === $library || $tab_name === $library ) {
				return $tab;
			}
		}

		return null;
	}

	private static function icon_names( array $tab ): array {
		$names = [];

		if ( ! empty( $tab['icons'] ) && is_array( $tab['icons'] ) ) {
			foreach ( $tab['icons'] as $key => $entry ) {
				if ( is_string( $entry ) && '' !== $entry ) {
					$names[] = $entry;
					continue;
				}

				if ( is_string( $key ) && '' !== $key && ! is_numeric( $key ) ) {
					$names[] = $key;
				}
			}
		}

		if ( ! empty( $names ) ) {
			return $names;
		}

		$dir = Pack_Directory::resolve( $tab );

		if ( '' === $dir ) {
			return [];
		}

		$fetch_json = isset( $tab['fetchJson'] ) && is_string( $tab['fetchJson'] ) ? $tab['fetchJson'] : '';

		if ( '' !== $fetch_json ) {
			$fetch_path = wp_parse_url( $fetch_json, PHP_URL_PATH );
			$from_fetch = self::names_from_json_file( $dir . '/' . basename( is_string( $fetch_path ) ? $fetch_path : '' ) );

			if ( ! empty( $from_fetch ) ) {
				return $from_fetch;
			}
		}

		$from_config = self::names_from_json_file( $dir . '/config.json' );

		if ( ! empty( $from_config ) ) {
			return $from_config;
		}

		$selection_path = $dir . '/selection.json';

		if ( is_readable( $selection_path ) ) {
			$raw = file_get_contents( $selection_path );
			$data = is_string( $raw ) ? json_decode( $raw, true ) : null;

			return is_array( $data ) ? Icomoon_Converter::names_from_selection( $data ) : [];
		}

		return [];
	}

	private static function names_from_json_file( string $path ): array {
		if ( '' === $path || ! is_readable( $path ) ) {
			return [];
		}

		$raw = file_get_contents( $path );
		$data = is_string( $raw ) ? json_decode( $raw, true ) : null;

		if ( ! is_array( $data ) ) {
			return [];
		}

		if ( ! empty( $data['icons'] ) && is_array( $data['icons'] ) ) {
			$names = [];

			foreach ( $data['icons'] as $entry ) {
				if ( is_string( $entry ) && '' !== $entry ) {
					$names[] = $entry;
				}
			}

			if ( ! empty( $names ) ) {
				return $names;
			}
		}

		return Fontello_Converter::names_from_config( $data );
	}

	private static function cache_key( string $library, string $value, array $tab ): string {
		$ver = isset( $tab['ver'] ) && ( is_string( $tab['ver'] ) || is_numeric( $tab['ver'] ) ) ? (string) $tab['ver'] : '';
		$dir = Pack_Directory::resolve( $tab );
		$signature = $dir;
		$stamp_paths = [
			$dir . '/config.json',
			$dir . '/selection.json',
		];
		$font = Pack_Directory::find_svg_font( $dir );

		if ( '' !== $font ) {
			$stamp_paths[] = $font;
		}

		foreach ( $stamp_paths as $path ) {
			if ( is_readable( $path ) ) {
				$signature .= '|' . filemtime( $path );
			}
		}

		return md5( $library . "\0" . $value . "\0" . $ver . "\0" . $signature );
	}

	private static function cache_get( string $key ): ?string {
		if ( array_key_exists( $key, self::$memory ) ) {
			return self::$memory[ $key ];
		}

		if ( function_exists( 'wp_cache_get' ) ) {
			$cached = wp_cache_get( $key, self::CACHE_GROUP );

			if ( is_string( $cached ) ) {
				self::$memory[ $key ] = $cached;

				return $cached;
			}
		}

		return null;
	}

	private static function cache_set( string $key, string $markup ): void {
		if ( '' === $markup ) {
			return;
		}

		self::$memory[ $key ] = $markup;

		if ( function_exists( 'wp_cache_set' ) ) {
			wp_cache_set( $key, $markup, self::CACHE_GROUP );
		}
	}
}
