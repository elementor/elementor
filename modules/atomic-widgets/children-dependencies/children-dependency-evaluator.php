<?php

namespace Elementor\Modules\AtomicWidgets\ChildrenDependencies;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Children_Dependency_Evaluator {
	public static function is_met( ?array $when, array $resolved_settings ): bool {
		if ( empty( $when['terms'] ) ) {
			return true;
		}

		$relation = $when['relation'] ?? 'or';
		$results = array_map(
			fn( $term ) => self::evaluate_term( $term, $resolved_settings ),
			$when['terms']
		);

		if ( 'and' === $relation ) {
			return ! in_array( false, $results, true );
		}

		return in_array( true, $results, true );
	}

	private static function evaluate_term( array $term, array $resolved_settings ): bool {
		if ( isset( $term['terms'] ) ) {
			return self::is_met( $term, $resolved_settings );
		}

		$path = $term['path'] ?? [];
		$actual_value = self::extract_path( $resolved_settings, $path );

		return self::compare( $term['operator'] ?? 'eq', $actual_value, $term['value'] ?? null );
	}

	private static function extract_path( array $settings, array $path ) {
		$value = $settings;

		foreach ( $path as $segment ) {
			if ( ! is_array( $value ) || ! array_key_exists( $segment, $value ) ) {
				return null;
			}

			$value = $value[ $segment ];
		}

		return $value;
	}

	private static function compare( string $operator, $actual_value, $expected_value ): bool {
		switch ( $operator ) {
			case 'eq':
			case 'ne':
				return ( $actual_value === $expected_value ) === ( 'eq' === $operator );

			case 'gt':
			case 'lte':
				if ( ! is_numeric( $actual_value ) || ! is_numeric( $expected_value ) ) {
					return false;
				}

				return ( (float) $actual_value > (float) $expected_value ) === ( 'gt' === $operator );

			case 'lt':
			case 'gte':
				if ( ! is_numeric( $actual_value ) || ! is_numeric( $expected_value ) ) {
					return false;
				}

				return ( (float) $actual_value < (float) $expected_value ) === ( 'lt' === $operator );

			case 'in':
			case 'nin':
				if ( ! is_array( $expected_value ) ) {
					return false;
				}

				return in_array( $actual_value, $expected_value, true ) === ( 'in' === $operator );

			case 'contains':
			case 'ncontains':
				$contains = self::contains( $actual_value, $expected_value );

				if ( null === $contains ) {
					return false;
				}

				return ( 'contains' === $operator ) === $contains;

			case 'exists':
			case 'not_exist':
				$exists = (bool) $actual_value || 0 === $actual_value || false === $actual_value;

				return ( 'exists' === $operator ) === $exists;

			default:
				return true;
		}
	}

	/**
	 * @return bool|null Null when the values are not comparable.
	 */
	private static function contains( $actual_value, $expected_value ): ?bool {
		if ( is_array( $actual_value ) ) {
			$haystack = array_map(
				fn( $item ) => is_array( $item ) && array_key_exists( 'value', $item ) ? $item['value'] : $item,
				$actual_value
			);

			return in_array( $expected_value, $haystack, true );
		}

		if ( is_string( $actual_value ) && is_string( $expected_value ) ) {
			return false !== strpos( $actual_value, $expected_value );
		}

		return null;
	}
}
