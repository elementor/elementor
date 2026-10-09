<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Icon_Catalog {
	const SEARCH_INDEX_FILE_NAME = 'search-index.json';

	const VERSION_FILE_NAME = 'version.json';

	const LICENSE_FREE = 'free';

	const LICENSE_PRO = 'pro';

	const MAX_FILE_BYTES = 5 * 1024 * 1024;

	private static ?array $entries = null;

	private static ?string $version = null;

	public static function reset(): void {
		self::$entries = null;
		self::$version = null;
	}

	/**
	 * @return array<int, array{name: string, library: string, value: string, label: string, aliases: string[], terms: string[], categories: string[], license: string}>
	 */
	public static function get_entries(): array {
		if ( null !== self::$entries ) {
			return self::$entries;
		}

		self::$entries = self::read_entries( self::get_search_index_path() );

		return self::$entries;
	}

	public static function is_available(): bool {
		$path = self::get_search_index_path();

		if ( '' === $path ) {
			return false;
		}

		return is_readable( $path ) && filesize( $path ) > 0;
	}

	public static function has_entries(): bool {
		return ! empty( self::get_entries() );
	}

	public static function get_version(): ?string {
		if ( null !== self::$version ) {
			return '' === self::$version ? null : self::$version;
		}

		$data = self::read_json_file( self::get_version_path() );
		$version = is_array( $data ) && isset( $data['version'] ) && is_string( $data['version'] ) ? $data['version'] : '';

		self::$version = $version;

		return '' === $version ? null : $version;
	}

	/**
	 * @return string[]
	 */
	public static function get_libraries(): array {
		$libraries = [];

		foreach ( self::get_entries() as $entry ) {
			$libraries[ $entry['library'] ] = true;
		}

		$libraries = array_keys( $libraries );
		sort( $libraries );

		return $libraries;
	}

	/**
	 * @return string[]
	 */
	public static function get_categories(): array {
		$categories = [];

		foreach ( self::get_entries() as $entry ) {
			foreach ( $entry['categories'] as $category ) {
				$categories[ $category ] = true;
			}
		}

		$categories = array_keys( $categories );
		sort( $categories );

		return $categories;
	}

	private static function get_search_index_path(): string {
		$base_path = apply_filters(
			'elementor/atomic-widgets/font-awesome-7/json-base-path',
			Font_Awesome_7_Icon_Resolver::JSON_BASE_PATH,
			'search-index'
		);

		if ( ! is_string( $base_path ) || '' === $base_path ) {
			$base_path = Font_Awesome_7_Icon_Resolver::JSON_BASE_PATH;
		}

		$path = trailingslashit( $base_path ) . self::SEARCH_INDEX_FILE_NAME;

		$filtered = apply_filters( 'elementor/atomic-widgets/icons/search-index-path', $path );

		return is_string( $filtered ) ? $filtered : $path;
	}

	private static function get_version_path(): string {
		$base_path = apply_filters(
			'elementor/atomic-widgets/font-awesome-7/json-base-path',
			Font_Awesome_7_Icon_Resolver::JSON_BASE_PATH,
			'version'
		);

		if ( ! is_string( $base_path ) || '' === $base_path ) {
			$base_path = Font_Awesome_7_Icon_Resolver::JSON_BASE_PATH;
		}

		$path = dirname( trailingslashit( $base_path ) ) . '/' . self::VERSION_FILE_NAME;

		$filtered = apply_filters( 'elementor/atomic-widgets/icons/version-path', $path );

		return is_string( $filtered ) ? $filtered : $path;
	}

	private static function read_entries( string $file_path ): array {
		$data = self::read_json_file( $file_path );

		if ( ! is_array( $data ) || ! isset( $data['icons'] ) || ! is_array( $data['icons'] ) ) {
			return [];
		}

		$entries = [];

		foreach ( $data['icons'] as $raw_entry ) {
			$entry = self::normalize_entry( $raw_entry );

			if ( $entry ) {
				$entries[] = $entry;
			}
		}

		return $entries;
	}

	private static function normalize_entry( $raw_entry ): ?array {
		if ( ! is_array( $raw_entry ) ) {
			return null;
		}

		$name = self::read_string( $raw_entry, 'name' );
		$library = self::read_string( $raw_entry, 'library' );
		$value = self::read_string( $raw_entry, 'value' );

		if ( '' === $name || '' === $library ) {
			return null;
		}

		$canonical_value = $library . ' ' . Font_Awesome_7_Icon_Resolver::LIBRARY_PREFIX . $name;

		if ( $value !== $canonical_value ) {
			return null;
		}

		$license = self::read_string( $raw_entry, 'license' );
		$label = self::read_string( $raw_entry, 'label' );

		return [
			'name' => $name,
			'library' => $library,
			'value' => $value,
			'label' => '' !== $label ? $label : str_replace( '-', ' ', $name ),
			'aliases' => self::read_string_list( $raw_entry, 'aliases' ),
			'terms' => self::read_string_list( $raw_entry, 'terms' ),
			'categories' => self::read_string_list( $raw_entry, 'categories' ),
			'license' => self::LICENSE_PRO === $license ? self::LICENSE_PRO : self::LICENSE_FREE,
		];
	}

	private static function read_string( array $entry, string $key ): string {
		return isset( $entry[ $key ] ) && is_string( $entry[ $key ] ) ? $entry[ $key ] : '';
	}

	/**
	 * @return string[]
	 */
	private static function read_string_list( array $entry, string $key ): array {
		if ( ! isset( $entry[ $key ] ) || ! is_array( $entry[ $key ] ) ) {
			return [];
		}

		return array_values( array_unique( array_filter(
			$entry[ $key ],
			static fn( $item ) => is_string( $item ) && '' !== $item
		) ) );
	}

	private static function read_json_file( string $file_path ) {
		if ( '' === $file_path || ! is_readable( $file_path ) ) {
			return null;
		}

		$file_size = filesize( $file_path );

		if ( false === $file_size || 0 === $file_size || $file_size > self::MAX_FILE_BYTES ) {
			return null;
		}

		$raw = file_get_contents( $file_path );

		return is_string( $raw ) ? json_decode( $raw, true ) : null;
	}
}
