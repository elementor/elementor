<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Settings_Patch {

	const GLOBALS_KEY = '__globals__';

	/**
	 * Elementor renders a setting from its `__globals__` link before its own value, so a
	 * patched value must drop the old link, and links of other settings must survive.
	 *
	 * @param array<string, mixed> $settings
	 * @param array<string, mixed> $patch
	 * @return array<string, mixed>
	 */
	public static function merge( array $settings, array $patch ): array {
		$patched_links = is_array( $patch[ self::GLOBALS_KEY ] ?? null ) ? $patch[ self::GLOBALS_KEY ] : [];
		unset( $patch[ self::GLOBALS_KEY ] );

		$links = is_array( $settings[ self::GLOBALS_KEY ] ?? null ) ? $settings[ self::GLOBALS_KEY ] : [];
		$links = array_merge( array_diff_key( $links, $patch ), $patched_links );

		$merged = array_merge( $settings, $patch );
		unset( $merged[ self::GLOBALS_KEY ] );

		if ( ! empty( $links ) ) {
			$merged[ self::GLOBALS_KEY ] = $links;
		}

		return $merged;
	}
}
