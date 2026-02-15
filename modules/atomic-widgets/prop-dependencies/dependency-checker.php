<?php

namespace Elementor\Modules\AtomicWidgets\PropDependencies;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dependency_Checker {

	/**
	 * Check if a dependency is met given the current prop values.
	 *
	 * @param array|null $dependency The dependency to check.
	 * @param array      $props      The current prop values.
	 * @return bool True if the dependency is met, false otherwise.
	 */
	public static function is_dependency_met( ?array $dependency, array $props ): bool {
		if ( empty( $dependency ) || empty( $dependency['terms'] ) ) {
			return true;
		}

		$relation = $dependency['relation'] ?? Manager::RELATION_OR;
		$terms = $dependency['terms'];

		foreach ( $terms as $term ) {
			$is_met = self::is_term_met( $term, $props );

			if ( Manager::RELATION_OR === $relation && $is_met ) {
				return true;
			}

			if ( Manager::RELATION_AND === $relation && ! $is_met ) {
				return false;
			}
		}

		// For OR relation, if we get here, none of the terms were met
		// For AND relation, if we get here, all terms were met
		return Manager::RELATION_AND === $relation;
	}

	/**
	 * Check if a single term is met.
	 *
	 * @param array $term  The term to check.
	 * @param array $props The current prop values.
	 * @return bool True if the term is met, false otherwise.
	 */
	private static function is_term_met( array $term, array $props ): bool {
		// Handle nested dependencies
		if ( isset( $term['terms'] ) && is_array( $term['terms'] ) ) {
			return self::is_dependency_met( $term, $props );
		}

		if ( ! isset( $term['operator'] ) || ! isset( $term['path'] ) ) {
			return true;
		}

		$actual_value = self::extract_value( $term['path'], $props );

		return self::evaluate_term( $term, $actual_value );
	}

	/**
	 * Extract a value from props using a path.
	 *
	 * @param array $path  The path to the value.
	 * @param array $props The props to extract from.
	 * @return mixed The extracted value or null if not found.
	 */
	private static function extract_value( array $path, array $props ) {
		$value = $props;

		foreach ( $path as $key ) {
			if ( ! is_array( $value ) || ! array_key_exists( $key, $value ) ) {
				return null;
			}

			$value = $value[ $key ];

			// If value is a transformable prop value, extract the actual value
			if ( is_array( $value ) && isset( $value['$$type'] ) && array_key_exists( 'value', $value ) ) {
				$value = $value['value'];
			}
		}

		return $value;
	}

	/**
	 * Evaluate a single term against an actual value.
	 *
	 * @param array $term         The term to evaluate.
	 * @param mixed $actual_value The actual value to compare against.
	 * @return bool True if the term evaluates to true, false otherwise.
	 */
	private static function evaluate_term( array $term, $actual_value ): bool {
		$operator = $term['operator'];
		$compare_value = $term['value'] ?? null;

		switch ( $operator ) {
			case 'eq':
				return $actual_value === $compare_value;

			case 'ne':
				return $actual_value !== $compare_value;

			case 'gt':
				if ( ! is_numeric( $actual_value ) || ! is_numeric( $compare_value ) ) {
					return false;
				}
				return floatval( $actual_value ) > floatval( $compare_value );

			case 'gte':
				if ( ! is_numeric( $actual_value ) || ! is_numeric( $compare_value ) ) {
					return false;
				}
				return floatval( $actual_value ) >= floatval( $compare_value );

			case 'lt':
				if ( ! is_numeric( $actual_value ) || ! is_numeric( $compare_value ) ) {
					return false;
				}
				return floatval( $actual_value ) < floatval( $compare_value );

			case 'lte':
				if ( ! is_numeric( $actual_value ) || ! is_numeric( $compare_value ) ) {
					return false;
				}
				return floatval( $actual_value ) <= floatval( $compare_value );

			case 'in':
				if ( ! is_array( $compare_value ) ) {
					return false;
				}
				return in_array( $actual_value, $compare_value, true );

			case 'nin':
				if ( ! is_array( $compare_value ) ) {
					return false;
				}
				return ! in_array( $actual_value, $compare_value, true );

			case 'contains':
				if ( is_string( $actual_value ) && is_string( $compare_value ) ) {
					return false !== strpos( $actual_value, $compare_value );
				}
				if ( is_array( $actual_value ) ) {
					return in_array( $compare_value, $actual_value, true );
				}
				return false;

			case 'ncontains':
				if ( is_string( $actual_value ) && is_string( $compare_value ) ) {
					return false === strpos( $actual_value, $compare_value );
				}
				if ( is_array( $actual_value ) ) {
					return ! in_array( $compare_value, $actual_value, true );
				}
				return false;

			case 'exists':
				return null !== $actual_value && false !== $actual_value && '' !== $actual_value;

			case 'not_exist':
				return null === $actual_value || false === $actual_value || '' === $actual_value;

			default:
				return true;
		}
	}
}
