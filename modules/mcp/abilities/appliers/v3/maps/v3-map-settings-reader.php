<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Map_Settings_Reader {

	/**
	 * @param Compiled_V3_Map      $map
	 * @param array<string, mixed> $raw Stored V3 settings keyed by control key.
	 * @return array<string, mixed> Plain values keyed by public setting key.
	 */
	public static function read( Compiled_V3_Map $map, array $raw ): array {
		$plain = [];

		foreach ( $map->get_settings() as $public_key => $setting ) {
			if ( ! array_key_exists( $setting->get_control_key(), $raw ) ) {
				continue;
			}

			$value = $setting->from_control_value( $raw[ $setting->get_control_key() ] );

			if ( null !== $value ) {
				$plain[ $public_key ] = $value;
			}
		}

		return $plain;
	}
}
