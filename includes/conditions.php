<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor conditions.
 *
 * Elementor conditions handler class introduce the compare conditions and the
 * check conditions methods.
 *
 * @since 1.0.0
 */
class Conditions {

	/**
	 * Compare conditions.
	 *
	 * Whether the two values comply the comparison operator.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @param mixed  $left_value  First value to compare.
	 * @param mixed  $right_value Second value to compare.
	 * @param string $operator    Comparison operator.
	 *
	 * @return bool Whether the two values complies the comparison operator.
	 */
	public static function compare( $left_value, $right_value, $operator ) {
		switch ( $operator ) {
			case '==':
				return $left_value == $right_value;
			case '!=':
				return $left_value != $right_value;
			case '!==':
				return $left_value !== $right_value;
			case 'in':
				return in_array( $left_value, $right_value, true );
			case '!in':
				return ! in_array( $left_value, $right_value, true );
			case 'contains':
				return in_array( $right_value, $left_value, true );
			case '!contains':
				return ! in_array( $right_value, $left_value, true );
			case '<':
				return $left_value < $right_value;
			case '<=':
				return $left_value <= $right_value;
			case '>':
				return $left_value > $right_value;
			case '>=':
				return $left_value >= $right_value;
			default:
				return $left_value === $right_value;
		}
	}

	/**
	 * Check conditions.
	 *
	 * Whether the comparison conditions comply.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @param array $conditions The conditions to check.
	 * @param array $comparison The comparison parameter.
	 *
	 * @return bool Whether the comparison conditions comply.
	 */
	public static function check( array $conditions, array $comparison ) {
		$is_or_condition = isset( $conditions['relation'] ) && 'or' === $conditions['relation'];

		$condition_succeed = ! $is_or_condition;

		foreach ( $conditions['terms'] as $term ) {
			if ( ! empty( $term['terms'] ) ) {
				$comparison_result = self::check( $term, $comparison );
			} else {
				$parsed_name = self::parse_name( $term['name'] );

				$value = $comparison[ $parsed_name[0] ];

				if ( ! empty( $parsed_name[1] ) ) {
					$value = $value[ $parsed_name[1] ];
				}

				$operator = null;

				if ( ! empty( $term['operator'] ) ) {
					$operator = $term['operator'];
				}

				$comparison_result = self::compare( $value, $term['value'], $operator );
			}

			if ( $is_or_condition ) {
				if ( $comparison_result ) {
					return true;
				}
			} elseif ( ! $comparison_result ) {
				return false;
			}
		}

		return $condition_succeed;
	}

	/**
	 * Fast name parsing logic.
	 * Replacement for previosly used regex: '/(\w+)(?:\[(\w+)])?/'.
	 *
	 * @param string $name Name to parse.
	 *
	 * @return string[] Parsing result.
	 */
	private static function parse_name( string $name ): array {
		$open_bracket_pos = strpos( $name, '[' );
		if( $open_bracket_pos === false ) {
			return [ $name ];
		}

		$close_bracket_pos = strpos( $name, ']' );

		$first_part = substr( $name, 0, $open_bracket_pos );
		$second_part = substr( $name, $open_bracket_pos + 1, $close_bracket_pos - $open_bracket_pos - 1 );

		return [ $first_part, $second_part ];
	}
}
