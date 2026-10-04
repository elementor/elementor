<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Atomic accept/reject validator for a resolved settings patch against its source
 * descriptor's declared destinations.
 *
 * A patch is atomic — either every declared destination is present with a value matching
 * its declared shape, or the entire declaration is rejected. Callers must not merge a
 * rejected patch. The validator returns a structured reason so higher layers can emit
 * an `invalid_resolved_value` warning with sufficient context.
 */
class V3_Resolved_Patch_Validator {

	const REASON_EMPTY_DESTINATIONS = 'empty_destinations';
	const REASON_MISSING = 'missing_destination';
	const REASON_INVALID_SHAPE = 'invalid_shape';
	const REASON_UNKNOWN_SHAPE = 'unknown_shape';

	const SHAPE_STRING = 'string';
	const SHAPE_NUMBER = 'number';
	const SHAPE_DIMENSION = 'dimension';
	const SHAPE_SIDES = 'sides';
	const SHAPE_BOX_SHADOW = 'box_shadow';

	const BOX_SHADOW_KEYS = [ 'horizontal', 'vertical', 'blur', 'spread' ];

	/**
	 * @param array $descriptor    From Style_Control_Target::*() — expects a `destinations` array.
	 * @param array $resolved_patch Setting-keyed patch as produced by a converter.
	 *
	 * @return array{valid: bool, invalid_destinations: string[], reason: ?string}
	 */
	public static function validate( array $descriptor, array $resolved_patch ): array {
		$destinations = $descriptor['destinations'] ?? [];

		if ( ! is_array( $destinations ) || empty( $destinations ) ) {
			return self::reject( [], self::REASON_EMPTY_DESTINATIONS );
		}

		$invalid = [];
		$reason = null;

		foreach ( $destinations as $destination ) {
			$setting = $destination['setting'] ?? '';
			$shape = $destination['shape'] ?? self::SHAPE_STRING;

			if ( ! is_string( $setting ) || '' === $setting ) {
				$invalid[] = (string) $setting;
				$reason = self::REASON_INVALID_SHAPE;
				continue;
			}

			if ( ! array_key_exists( $setting, $resolved_patch ) ) {
				if ( ! empty( $destination['optional'] ) ) {
					continue;
				}

				$invalid[] = $setting;
				$reason = $reason ?? self::REASON_MISSING;
				continue;
			}

			$shape_check = self::check_shape( $shape, $resolved_patch[ $setting ] );

			if ( self::REASON_UNKNOWN_SHAPE === $shape_check ) {
				return self::reject( [ $setting ], self::REASON_UNKNOWN_SHAPE );
			}

			if ( null !== $shape_check ) {
				$invalid[] = $setting;
				$reason = $shape_check;
			}
		}

		if ( ! empty( $invalid ) ) {
			return self::reject( $invalid, $reason ?? self::REASON_INVALID_SHAPE );
		}

		return [
			'valid' => true,
			'invalid_destinations' => [],
			'reason' => null,
		];
	}

	/**
	 * @param string $shape
	 * @param mixed  $value
	 * @return string|null Non-null returns are error reasons.
	 */
	private static function check_shape( string $shape, $value ): ?string {
		switch ( $shape ) {
			case self::SHAPE_STRING:
				return is_string( $value ) ? null : self::REASON_INVALID_SHAPE;

			case self::SHAPE_NUMBER:
				return is_int( $value ) || is_float( $value ) ? null : self::REASON_INVALID_SHAPE;

			case self::SHAPE_DIMENSION:
				return self::is_dimension( $value ) ? null : self::REASON_INVALID_SHAPE;

			case self::SHAPE_SIDES:
				return self::is_sides( $value ) ? null : self::REASON_INVALID_SHAPE;

			case self::SHAPE_BOX_SHADOW:
				return self::has_keys( $value, self::BOX_SHADOW_KEYS ) ? null : self::REASON_INVALID_SHAPE;

			default:
				return self::REASON_UNKNOWN_SHAPE;
		}
	}

	/**
	 * @param mixed $value
	 */
	private static function is_dimension( $value ): bool {
		return is_array( $value )
			&& array_key_exists( 'size', $value )
			&& array_key_exists( 'unit', $value );
	}

	/**
	 * @param mixed $value
	 */
	private static function is_sides( $value ): bool {
		return self::has_keys( $value, [ 'top', 'right', 'bottom', 'left', 'unit', 'isLinked' ] );
	}

	/**
	 * @param mixed    $value
	 * @param string[] $keys
	 */
	private static function has_keys( $value, array $keys ): bool {
		if ( ! is_array( $value ) ) {
			return false;
		}

		foreach ( $keys as $key ) {
			if ( ! array_key_exists( $key, $value ) ) {
				return false;
			}
		}

		return true;
	}

	private static function reject( array $invalid_destinations, string $reason ): array {
		return [
			'valid' => false,
			'invalid_destinations' => $invalid_destinations,
			'reason' => $reason,
		];
	}
}
