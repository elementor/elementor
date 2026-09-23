<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver;

use Elementor\Icons_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Font_Awesome_7_Icon_Resolver {
	const JSON_RELATIVE_PATH = 'lib/font-awesome-7/json/';

	const JSON_BASE_PATH = ELEMENTOR_ASSETS_PATH . 'lib/font-awesome-7/json/';

	const ALLOWED_JSON_FILES = [ 'solid', 'regular', 'brands' ];

	const LIBRARY_PREFIX = 'fa-';

	const MAX_JSON_FILE_BYTES = 5 * 1024 * 1024;

	const TUPLE_WIDTH = 0;

	const TUPLE_HEIGHT = 1;

	const TUPLE_ALIASES = 2;

	const TUPLE_PATH = 4;

	const TUPLE_MIN_LENGTH = 5;

	private static $icons_by_file = [];

	public static function reset(): void {
		self::$icons_by_file = [];
	}

	public static function is_supported_library( string $library ): bool {
		return str_starts_with( $library, self::LIBRARY_PREFIX );
	}

	const FILTER_TYPE_ALL = 'all';

	const FILTER_TYPE_GROUP = 'group';

	const FILTER_TYPE_ITEM = 'item';

	const SKIPPED_TAB_NAMES = [ 'all', 'recommended', 'GoPro' ];

	public static function get_editor_config(): array {
		return [
			'jsonFiles' => self::ALLOWED_JSON_FILES,
			'jsonBaseUrl' => self::get_json_base_url(),
			'filter' => self::get_filter_items(),
		];
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

	private static function get_filter_items(): array {
		$items = [
			[
				'type' => self::FILTER_TYPE_ALL,
				'label' => esc_html__( 'All icons', 'elementor' ),
				'icon' => 'list',
			],
			[
				'type' => self::FILTER_TYPE_ITEM,
				'value' => 'fa-regular',
				'label' => esc_html__( 'Font Awesome - Regular', 'elementor' ),
				'icon' => 'star',
			],
			[
				'type' => self::FILTER_TYPE_ITEM,
				'value' => 'fa-solid',
				'label' => esc_html__( 'Font Awesome - Solid', 'elementor' ),
				'icon' => 'star-filled',
			],
			[
				'type' => self::FILTER_TYPE_ITEM,
				'value' => 'fa-brands',
				'label' => esc_html__( 'Font Awesome - Brands', 'elementor' ),
				'icon' => 'library',
			],
		];

		$custom_items = [];

		foreach ( Icons_Manager::get_icon_manager_tabs() as $name => $tab ) {
			if ( ! is_array( $tab ) || ! empty( $tab['native'] ) ) {
				continue;
			}

			if ( in_array( $name, self::SKIPPED_TAB_NAMES, true ) ) {
				continue;
			}

			$tab_name = isset( $tab['name'] ) && is_scalar( $tab['name'] ) ? (string) $tab['name'] : '';
			$tab_label = isset( $tab['label'] ) && is_string( $tab['label'] ) ? $tab['label'] : '';

			if ( '' === $tab_name || '' === $tab_label ) {
				continue;
			}

			$custom_items[] = [
				'type' => self::FILTER_TYPE_ITEM,
				'value' => $tab_name,
				'label' => $tab_label,
				'icon' => 'library',
			];
		}

		if ( empty( $custom_items ) ) {
			return $items;
		}

		$items[] = [
			'type' => self::FILTER_TYPE_GROUP,
			'label' => esc_html__( 'My libraries', 'elementor' ),
		];

		return array_merge( $items, $custom_items );
	}

	private static function get_icon_name( string $value ): ?string {
		if ( ! preg_match( '/^fa\S*\s+fa-([^\s]+)/', $value, $matches ) ) {
			return null;
		}

		return $matches[1];
	}

	private static function get_json_base_path( string $file_name ): string {
		$base_path = apply_filters(
			'elementor/atomic-widgets/font-awesome-7/json-base-path',
			self::JSON_BASE_PATH,
			$file_name
		);

		if ( ! is_string( $base_path ) || '' === $base_path ) {
			return self::JSON_BASE_PATH;
		}

		return trailingslashit( $base_path );
	}

	private static function get_json_base_url( string $file_name = '' ): string {
		$resolved_file_name = '' !== $file_name ? $file_name : self::ALLOWED_JSON_FILES[0];
		$filesystem_path = wp_normalize_path( self::get_json_base_path( $resolved_file_name ) );
		$assets_path = wp_normalize_path( ELEMENTOR_ASSETS_PATH );
		$default_url = trailingslashit( ELEMENTOR_ASSETS_URL . self::JSON_RELATIVE_PATH );

		if ( str_starts_with( $filesystem_path, $assets_path ) ) {
			$relative = ltrim( substr( $filesystem_path, strlen( $assets_path ) ), '/\\' );
			$default_url = trailingslashit( ELEMENTOR_ASSETS_URL . $relative );
		}

		$url = apply_filters(
			'elementor/atomic-widgets/font-awesome-7/json-base-url',
			$default_url,
			$resolved_file_name
		);

		if ( ! is_string( $url ) || '' === $url ) {
			return trailingslashit( ELEMENTOR_ASSETS_URL . self::JSON_RELATIVE_PATH );
		}

		return trailingslashit( $url );
	}

	private static function get_json_file_name( string $library ): ?string {
		if ( ! str_starts_with( $library, self::LIBRARY_PREFIX ) ) {
			return null;
		}

		$file_name = substr( $library, strlen( self::LIBRARY_PREFIX ) );

		if ( ! in_array( $file_name, self::ALLOWED_JSON_FILES, true ) ) {
			return null;
		}

		return $file_name;
	}

	private static function load_icons( string $file_name ): ?array {
		if ( ! in_array( $file_name, self::ALLOWED_JSON_FILES, true ) ) {
			return null;
		}

		$file_path = self::get_json_base_path( $file_name ) . $file_name . '.json';

		if ( isset( self::$icons_by_file[ $file_path ] ) ) {
			return self::$icons_by_file[ $file_path ];
		}

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

		self::$icons_by_file[ $file_path ] = self::index_icons( $file_data['icons'] );

		return self::$icons_by_file[ $file_path ];
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
