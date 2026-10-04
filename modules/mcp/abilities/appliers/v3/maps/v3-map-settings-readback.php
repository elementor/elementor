<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Reads stored V3 control values back into a map's public settings, undoing each
 * schema's `convert` (e.g. a switcher's `yes` / `''` become `true` / `false`).
 */
class V3_Map_Settings_Readback {

	/**
	 * @param array<string, array> $schemas Compiled map settings keyed by public key.
	 * @param array<string, mixed> $raw     Stored widget settings keyed by control key.
	 * @return array<string, mixed>
	 */
	public static function from_raw( array $schemas, array $raw ): array {
		$settings = [];

		foreach ( $schemas as $public_key => $schema ) {
			$control_key = $schema['key'] ?? $public_key;

			if ( ! array_key_exists( $control_key, $raw ) ) {
				continue;
			}

			$settings[ $public_key ] = self::revert( $raw[ $control_key ], $schema );
		}

		return $settings;
	}

	/**
	 * @param mixed $value
	 * @param array $schema
	 * @return mixed
	 */
	private static function revert( $value, array $schema ) {
		$convert = $schema['convert'] ?? null;

		if ( is_array( $convert ) && is_scalar( $value ) ) {
			$public_value = array_search( (string) $value, array_map( 'strval', $convert ), true );

			if ( false !== $public_value ) {
				return self::to_public_scalar( (string) $public_value );
			}
		}

		if ( is_array( $value ) && is_array( $schema['properties'] ?? null ) ) {
			foreach ( $value as $key => $nested_value ) {
				$nested_schema = $schema['properties'][ $key ] ?? null;

				if ( is_array( $nested_schema ) ) {
					$value[ $key ] = self::revert( $nested_value, $nested_schema );
				}
			}
		}

		return $value;
	}

	/**
	 * @return bool|string
	 */
	private static function to_public_scalar( string $conversion_key ) {
		if ( 'true' === $conversion_key || 'false' === $conversion_key ) {
			return 'true' === $conversion_key;
		}

		return $conversion_key;
	}
}
