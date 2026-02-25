<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Path_Resolver {
	public static function resolve( string $pattern, array $data, bool $allow_missing_leaf = true ): array {
		$segments = self::parse_path( $pattern );

		return self::resolve_segments( $segments, $data, [], '', $allow_missing_leaf );
	}

	public static function resolve_with_wildcard_binding( string $pattern, array $data, array $wildcard_values ): ?string {
		$segments = self::parse_path( $pattern );
		$wildcard_index = 0;

		return self::resolve_with_binding( $segments, $data, '', $wildcard_values, $wildcard_index );
	}

	public static function get( string $path, array $data ) {
		$segments = self::parse_concrete_path( $path );
		$current = $data;

		foreach ( $segments as $segment ) {
			if ( ! is_array( $current ) ) {
				return null;
			}

			$key = $segment['value'];

			if ( ! array_key_exists( $key, $current ) ) {
				return null;
			}

			$current = $current[ $key ];
		}

		return $current;
	}

	private static function parse_path( string $path ): array {
		$segments = [];
		$current = '';
		$length = strlen( $path );

		for ( $i = 0; $i < $length; $i++ ) {
			$char = $path[ $i ];

			if ( '.' === $char ) {
				self::flush_current_segment( $segments, $current );
			} elseif ( '[' === $char ) {
				self::flush_current_segment( $segments, $current );

				$end = strpos( $path, ']', $i );

				if ( false === $end ) {
					throw new \Exception( sprintf( 'Malformed path: unmatched opening bracket in "%s"', esc_html( $path ) ) );
				}

				$index = substr( $path, $i + 1, $end - $i - 1 );
				$segments[] = self::create_segment( $index, 'index' );
				$i = $end;
			} elseif ( ']' === $char ) {
				throw new \Exception( sprintf( 'Malformed path: unmatched closing bracket in "%s"', esc_html( $path ) ) );
			} else {
				$current .= $char;
			}
		}

		self::flush_current_segment( $segments, $current );

		return $segments;
	}

	private static function flush_current_segment( array &$segments, string &$current ): void {
		if ( '' !== $current ) {
			$segments[] = self::create_segment( $current, 'key' );
			$current = '';
		}
	}

	private static function parse_concrete_path( string $path ): array {
		return self::parse_path( $path );
	}

	private static function create_segment( string $value, string $type ): array {
		return [
			'value' => $value,
			'type' => $type,
			'is_wildcard' => '*' === $value,
		];
	}

	private static function resolve_segments( array $segments, $data, array $wildcard_values, string $current_path = '', bool $allow_missing_leaf = true ): array {
		if ( empty( $segments ) ) {
			return [
				[
					'path' => $current_path,
					'wildcard_values' => $wildcard_values,
				],
			];
		}

		if ( ! is_array( $data ) ) {
			return [];
		}

		$segment = array_shift( $segments );
		$is_last_segment = empty( $segments );

		if ( $segment['is_wildcard'] ) {
			return self::resolve_wildcard_segment( $segment, $segments, $data, $wildcard_values, $current_path, $allow_missing_leaf );
		}

		return self::resolve_concrete_segment( $segment, $segments, $data, $wildcard_values, $current_path, $is_last_segment, $allow_missing_leaf );
	}

	private static function resolve_wildcard_segment( array $segment, array $segments, array $data, array $wildcard_values, string $current_path, bool $allow_missing_leaf ): array {
		$results = [];
		$keys = array_keys( $data );

		if ( 'index' === $segment['type'] ) {
			$keys = array_filter( $keys, 'is_int' );
		} else {
			$keys = array_filter( $keys, 'is_string' );
		}

		foreach ( $keys as $key ) {
			$new_wildcard_values = $wildcard_values;
			$new_wildcard_values[] = [
				'key' => $key,
				'type' => $segment['type'],
			];

			$new_path = self::append_to_path( $current_path, $key, $segment['type'] );

			$results = array_merge(
				$results,
				self::resolve_segments( $segments, $data[ $key ], $new_wildcard_values, $new_path, $allow_missing_leaf )
			);
		}

		return $results;
	}

	private static function resolve_concrete_segment( array $segment, array $segments, array $data, array $wildcard_values, string $current_path, bool $is_last_segment, bool $allow_missing_leaf ): array {
		$key = $segment['value'];
		$key_exists = array_key_exists( $key, $data );

		if ( ! $key_exists && ! ( $allow_missing_leaf && $is_last_segment ) ) {
			return [];
		}

		$new_path = self::append_to_path( $current_path, $key, $segment['type'] );

		if ( $is_last_segment ) {
			return [
				[
					'path' => $new_path,
					'wildcard_values' => $wildcard_values,
				],
			];
		}

		return self::resolve_segments( $segments, $data[ $key ], $wildcard_values, $new_path, $allow_missing_leaf );
	}

	private static function resolve_with_binding( array $segments, $data, string $prefix, array $wildcard_values, int &$wildcard_index ): ?string {
		if ( empty( $segments ) ) {
			return $prefix;
		}

		if ( ! is_array( $data ) ) {
			return null;
		}

		$segment = array_shift( $segments );

		if ( $segment['is_wildcard'] ) {
			if ( ! isset( $wildcard_values[ $wildcard_index ] ) ) {
				return null;
			}

			$key = $wildcard_values[ $wildcard_index ]['key'];
			++$wildcard_index;

			if ( ! array_key_exists( $key, $data ) ) {
				return null;
			}

			$new_prefix = self::append_to_path( $prefix, $key, $segment['type'] );

			return self::resolve_with_binding( $segments, $data[ $key ], $new_prefix, $wildcard_values, $wildcard_index );
		}

		$key = $segment['value'];

		if ( ! array_key_exists( $key, $data ) ) {
			return null;
		}

		$new_prefix = self::append_to_path( $prefix, $key, $segment['type'] );

		return self::resolve_with_binding( $segments, $data[ $key ], $new_prefix, $wildcard_values, $wildcard_index );
	}

	private static function build_path_string( array $wildcard_values ): string {
		$path = '';

		foreach ( $wildcard_values as $entry ) {
			$path = self::append_to_path( $path, $entry['key'], $entry['type'] );
		}

		return $path;
	}

	private static function append_to_path( string $prefix, $key, string $type ): string {
		if ( 'index' === $type ) {
			return $prefix . '[' . $key . ']';
		}

		if ( '' === $prefix ) {
			return (string) $key;
		}

		return $prefix . '.' . $key;
	}
}
