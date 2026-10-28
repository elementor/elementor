<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Enum_From_Control_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Switcher_Setting_Adapter;

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
	 * Words the condition in the same values the schema accepts. Switchers are booleans,
	 * an empty choice key is its public token, and a multiple control matches by inclusion.
	 *
	 * @param array<string, mixed> $condition
	 * @param array<string, mixed> $controls Registered controls, keyed by control name.
	 */
	public static function describe( array $condition, array $controls = [] ): string {
		$parts = [];

		foreach ( $condition as $term => $expected ) {
			if ( 1 !== preg_match( self::TERM_PATTERN, (string) $term, $matches ) ) {
				continue;
			}

			$control = is_array( $controls[ $matches['key'] ] ?? null ) ? $controls[ $matches['key'] ] : [];
			$subject = empty( $matches['sub'] ) ? $matches['key'] : $matches['key'] . '.' . $matches['sub'];
			$is_negated = ! empty( $matches['negation'] );
			$values = implode( ', ', array_map(
				fn( $value ) => self::display_value( $value, $control ),
				(array) $expected
			) );

			$parts[] = sprintf( '%s %s %s', $subject, self::operator( $expected, $is_negated, $control ), $values );
		}

		return implode( ' and ', $parts );
	}

	/**
	 * @param mixed                $expected
	 * @param bool                 $is_negated
	 * @param array<string, mixed> $control
	 */
	private static function operator( $expected, bool $is_negated, array $control ): string {
		if ( ! empty( $control['multiple'] ) && ! is_array( $expected ) ) {
			return $is_negated ? 'does not include' : 'includes';
		}

		if ( is_array( $expected ) ) {
			return $is_negated ? 'is not one of' : 'is one of';
		}

		return $is_negated ? 'is not' : 'is';
	}

	/**
	 * @param mixed                $value
	 * @param array<string, mixed> $control
	 */
	private static function display_value( $value, array $control ): string {
		if ( Switcher_Setting_Adapter::CONTROL_TYPE === ( $control['type'] ?? null ) && is_scalar( $value ) ) {
			$on = (string) ( $control['return_value'] ?? Switcher_Setting_Adapter::DEFAULT_RETURN_VALUE );

			if ( (string) $value === $on ) {
				return 'true';
			}

			if ( Switcher_Setting_Adapter::OFF_VALUE === (string) $value ) {
				return 'false';
			}
		}

		if ( is_scalar( $value ) ) {
			return "'" . Enum_From_Control_Setting_Adapter::public_value( (string) $value, $control ) . "'";
		}

		return "''";
	}
}
