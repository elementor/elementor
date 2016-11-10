<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Conditions {

	public static function compare( $left_value, $right_value, $operator ) {
		switch ( $operator ) {
			case '==':
				return $left_value == $right_value;
			case '!=':
				return $left_value != $right_value;
			case '!==':
				return $left_value !== $right_value;
			case 'in':
				return -1 !== array_search( $left_value, $right_value );
			case '!in':
				return -1 === array_search( $left_value, $right_value );
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

	public static function check( array $conditions, array $comparison ) {
		$is_or_condition = isset( $conditions['relation'] ) && 'or' === $conditions['relation'];

		$condition_succeed = ! $is_or_condition;

		foreach ( $conditions['terms'] as $term ) {
			if ( ! empty( $term['terms'] ) ) {
				$comparison_result = self::check( $term, $conditions );
			} else {
				preg_match( '/(\w+)(?:\[(\w+)])?/', $term['name'], $parsed_name );

				$value = $comparison[ $parsed_name[1] ];

				if ( ! empty( $parsed_name[2] ) ) {
					$value = $value[ $parsed_name[2] ];
				}

				$comparison_result = self::compare( $value, $term['value'], $term['operator'] );
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
}
