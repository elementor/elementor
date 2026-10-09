<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Words an Elementor control `condition` (e.g. `[ 'layout!' => 'dropdown', 'pointer' => [ 'underline' ] ]`)
 * for the LLM. Evaluation stays with `Controls_Stack::is_control_visible()`.
 */
class V3_Control_Condition {

	const TERM_PATTERN = '/^(?P<key>[^\[!]+)(?:\[(?P<sub>[^\]]+)\])?(?P<negation>!)?$/';

	/**
	 * @param array<string, mixed> $condition
	 */
	public static function describe( array $condition ): string {
		$parts = [];

		foreach ( $condition as $term => $expected ) {
			if ( 1 !== preg_match( self::TERM_PATTERN, (string) $term, $matches ) ) {
				continue;
			}

			$subject = empty( $matches['sub'] ) ? $matches['key'] : $matches['key'] . '.' . $matches['sub'];
			$is_negated = ! empty( $matches['negation'] );
			$values = implode( ', ', array_map( [ self::class, 'quote' ], (array) $expected ) );

			$parts[] = sprintf( '%s %s %s', $subject, self::operator( $expected, $is_negated ), $values );
		}

		return implode( ' and ', $parts );
	}

	/**
	 * @param mixed $expected
	 */
	private static function operator( $expected, bool $is_negated ): string {
		if ( is_array( $expected ) ) {
			return $is_negated ? 'is not one of' : 'is one of';
		}

		return $is_negated ? 'is not' : 'is';
	}

	/**
	 * @param mixed $value
	 */
	private static function quote( $value ): string {
		return "'" . ( is_scalar( $value ) ? (string) $value : '' ) . "'";
	}
}
