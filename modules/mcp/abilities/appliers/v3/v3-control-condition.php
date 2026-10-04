<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Reads an Elementor control `condition` (e.g. `[ 'layout!' => 'dropdown', 'pointer' => [ 'underline', 'overline' ] ]`).
 * Every term must hold; a trailing `!` negates a term, an array value means "one of",
 * and `key[sub]` reads one field of an object setting. Unset settings fall back to the
 * control's default.
 */
class V3_Control_Condition {

	const NEGATION_SUFFIX = '!';

	const TERM_PATTERN = '/^(?P<key>[^\[!]+)(?:\[(?P<sub>[^\]]+)\])?(?P<negation>!)?$/';

	/**
	 * @param array<string, mixed> $condition
	 * @param array<string, mixed> $settings
	 * @param array<string, mixed> $controls
	 */
	public static function is_met( array $condition, array $settings, array $controls ): bool {
		foreach ( $condition as $term => $expected ) {
			$parsed = self::parse_term( (string) $term );

			if ( null === $parsed ) {
				continue;
			}

			$actual = self::current_value( $parsed['key'], $parsed['sub'], $settings, $controls );
			$matches = self::matches( $actual, $expected );

			if ( $matches === $parsed['negated'] ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * @param array<string, mixed> $condition
	 */
	public static function describe( array $condition ): string {
		$parts = [];

		foreach ( $condition as $term => $expected ) {
			$parsed = self::parse_term( (string) $term );

			if ( null === $parsed ) {
				continue;
			}

			$subject = null === $parsed['sub'] ? $parsed['key'] : $parsed['key'] . '.' . $parsed['sub'];
			$values = implode( ', ', array_map( [ self::class, 'quote' ], (array) $expected ) );
			$operator = is_array( $expected )
				? ( $parsed['negated'] ? 'is not one of' : 'is one of' )
				: ( $parsed['negated'] ? 'is not' : 'is' );

			$parts[] = sprintf( '%s %s %s', $subject, $operator, $values );
		}

		return implode( ' and ', $parts );
	}

	/**
	 * @return array{key: string, sub: ?string, negated: bool}|null
	 */
	private static function parse_term( string $term ): ?array {
		if ( 1 !== preg_match( self::TERM_PATTERN, $term, $matches ) ) {
			return null;
		}

		return [
			'key' => $matches['key'],
			'sub' => isset( $matches['sub'] ) && '' !== $matches['sub'] ? $matches['sub'] : null,
			'negated' => self::NEGATION_SUFFIX === ( $matches['negation'] ?? '' ),
		];
	}

	/**
	 * @return mixed
	 */
	private static function current_value( string $key, ?string $sub, array $settings, array $controls ) {
		$value = array_key_exists( $key, $settings ) ? $settings[ $key ] : ( $controls[ $key ]['default'] ?? '' );

		if ( null === $sub ) {
			return $value;
		}

		return is_array( $value ) ? ( $value[ $sub ] ?? '' ) : '';
	}

	/**
	 * @param mixed $actual
	 * @param mixed $expected
	 */
	private static function matches( $actual, $expected ): bool {
		if ( is_array( $expected ) ) {
			foreach ( $expected as $candidate ) {
				if ( self::matches( $actual, $candidate ) ) {
					return true;
				}
			}

			return false;
		}

		if ( is_array( $actual ) ) {
			return empty( $actual ) && '' === (string) $expected;
		}

		return (string) $actual === (string) $expected;
	}

	/**
	 * @param mixed $value
	 */
	private static function quote( $value ): string {
		return "'" . ( is_scalar( $value ) ? (string) $value : '' ) . "'";
	}
}
