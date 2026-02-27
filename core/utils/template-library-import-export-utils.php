<?php

namespace Elementor\Core\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Template_Library_Import_Export_Utils {
	const LABEL_PREFIX = 'DUP_';
	const MAX_LABEL_LENGTH = 50;
	const DEFAULT_RANDOM_STRING_LENGTH = 7;
	const IMPORT_MODE_MATCH_SITE = 'match_site';
	const IMPORT_MODE_KEEP_CREATE = 'keep_create';
	const IMPORT_MODE_KEEP_FLATTEN = 'keep_flatten';

	public static function items_equal( array $a, array $b ): bool {
		$a = self::recursive_ksort( $a );
		$b = self::recursive_ksort( $b );

		$encoded_a = wp_json_encode( $a );
		$encoded_b = wp_json_encode( $b );

		if ( false === $encoded_a || false === $encoded_b ) {
			return false;
		}

		return $encoded_a === $encoded_b;
	}

	public static function items_equal_ignoring_keys( array $a, array $b, array $ignore_keys = [] ): bool {
		foreach ( $ignore_keys as $key ) {
			unset( $a[ $key ], $b[ $key ] );
		}

		return self::items_equal( $a, $b );
	}

	public static function build_label_to_id_index( array $items, string $label_key = 'label' ): array {
		$index = [];

		foreach ( $items as $id => $item ) {
			$label = $item[ $label_key ] ?? null;
			if ( is_string( $label ) && '' !== $label && ! isset( $index[ $label ] ) ) {
				$index[ $label ] = $id;
			}
		}

		return $index;
	}

	public static function recursive_ksort( $value ) {
		if ( is_array( $value ) ) {
			foreach ( $value as $k => $v ) {
				$value[ $k ] = self::recursive_ksort( $v );
			}
			ksort( $value );
		}

		return $value;
	}

	public static function normalize_string_ids( array $ids ): array {
		return array_values(
			array_unique(
				array_filter( $ids, fn( $id ) => is_string( $id ) && '' !== $id )
			)
		);
	}

	public static function extract_labels( array $items, string $label_key = 'label' ): array {
		$labels = [];

		foreach ( $items as $item ) {
			if ( isset( $item[ $label_key ] ) && is_string( $item[ $label_key ] ) ) {
				$labels[] = $item[ $label_key ];
			}
		}

		return $labels;
	}

	public static function apply_unique_label( array $item, array &$existing_labels, string $label_key = 'label' ): array {
		if ( ! isset( $item[ $label_key ] ) || ! is_string( $item[ $label_key ] ) || '' === $item[ $label_key ] ) {
			return $item;
		}

		$label = $item[ $label_key ];

		if ( in_array( $label, $existing_labels, true ) ) {
			$label = self::generate_unique_label( $label, $existing_labels );
			$item[ $label_key ] = $label;
		}

		$existing_labels[] = $label;

		return $item;
	}

	public static function generate_unique_id( array $existing_ids, string $prefix = 'g-' ): string {
		$existing = array_fill_keys( $existing_ids, true );

		do {
			$random = substr( strtolower( dechex( wp_rand( 0, PHP_INT_MAX ) ) ), 0, 7 );
			$id = $prefix . $random;
		} while ( isset( $existing[ $id ] ) );

		return $id;
	}

	public static function generate_random_string( int $length = self::DEFAULT_RANDOM_STRING_LENGTH ): string {
		$length = max( 1, $length );
		$chars = '0123456789abcdef';
		$out = '';

		for ( $i = 0; $i < $length; $i++ ) {
			$out .= $chars[ wp_rand( 0, 15 ) ];
		}

		return $out;
	}

	public static function sanitize_import_mode( $import_mode ): string {
		$allowed = [
			self::IMPORT_MODE_MATCH_SITE,
			self::IMPORT_MODE_KEEP_CREATE,
			self::IMPORT_MODE_KEEP_FLATTEN,
		];

		if ( is_string( $import_mode ) && in_array( $import_mode, $allowed, true ) ) {
			return $import_mode;
		}

		return self::IMPORT_MODE_MATCH_SITE;
	}

	public static function generate_unique_label( string $original_label, array $existing_labels ): string {
		$prefix = self::LABEL_PREFIX;
		$max_length = self::MAX_LABEL_LENGTH;

		$has_prefix = 0 === strpos( $original_label, $prefix );

		if ( $has_prefix ) {
			$base_label = substr( $original_label, strlen( $prefix ) );
			$counter = 1;
			$new_label = $prefix . $base_label . $counter;

			while ( in_array( $new_label, $existing_labels, true ) ) {
				++$counter;
				$new_label = $prefix . $base_label . $counter;
			}

			if ( strlen( $new_label ) > $max_length ) {
				$available_length = $max_length - strlen( $prefix . $counter );
				$base_label = substr( $base_label, 0, $available_length );
				$new_label = $prefix . $base_label . $counter;
			}
		} else {
			$new_label = $prefix . $original_label;

			if ( strlen( $new_label ) > $max_length ) {
				$available_length = $max_length - strlen( $prefix );
				$new_label = $prefix . substr( $original_label, 0, $available_length );
			}

			$counter = 1;
			$base_label = substr( $original_label, 0, $available_length ?? strlen( $original_label ) );

			while ( in_array( $new_label, $existing_labels, true ) ) {
				$new_label = $prefix . $base_label . $counter;

				if ( strlen( $new_label ) > $max_length ) {
					$available_length = $max_length - strlen( $prefix . $counter );
					$base_label = substr( $original_label, 0, $available_length );
					$new_label = $prefix . $base_label . $counter;
				}

				++$counter;
			}
		}

		return $new_label;
	}

	public static function filter_items_by_ids( array $items, array $ids ): array {
		$filtered_items = [];

		foreach ( $ids as $id ) {
			if ( isset( $items[ $id ] ) ) {
				$filtered_items[ $id ] = $items[ $id ];
			}
		}

		return $filtered_items;
	}

	public static function build_filtered_order( array $order, array $items ): array {
		$filtered_order = [];

		foreach ( $order as $id ) {
			if ( isset( $items[ $id ] ) ) {
				$filtered_order[] = $id;
			}
		}

		foreach ( array_keys( $items ) as $id ) {
			if ( ! in_array( $id, $filtered_order, true ) ) {
				$filtered_order[] = $id;
			}
		}

		return $filtered_order;
	}
}
