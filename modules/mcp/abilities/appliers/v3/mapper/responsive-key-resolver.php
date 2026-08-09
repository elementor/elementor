<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Context_Meta;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Decides which V3 setting key to write for a given (setting, breakpoint, is_responsive)
 * tuple. Encapsulates the "silent drop when responsive variant is absent" rule so it can
 * be shared between converters.
 */
class Responsive_Key_Resolver {

	const BASE_BREAKPOINT = 'desktop';

	/**
	 * @return string|null Suffixed key, base key, or null when the write should be dropped.
	 */
	public function resolve( string $setting, string $breakpoint, bool $is_responsive, V3_Context_Meta $meta ): ?string {
		if ( ! $is_responsive || self::BASE_BREAKPOINT === $breakpoint ) {
			return $setting;
		}

		$suffixed = $setting . '_' . $breakpoint;
		if ( $meta->has_control( $suffixed ) ) {
			return $suffixed;
		}

		if ( $meta->has_control( $setting ) ) {
			return null;
		}

		return $suffixed;
	}

	/**
	 * Applies the responsive-suffix rule across an entire patch (typography group case).
	 *
	 * @param array<string, mixed> $patch
	 * @return array<string, mixed>
	 */
	public function suffix_patch( array $patch, string $breakpoint, V3_Context_Meta $meta ): array {
		$suffixed = [];

		foreach ( $patch as $key => $value ) {
			if ( str_ends_with( (string) $key, '_typography' ) ) {
				$suffixed[ $key ] = $value;
				continue;
			}

			$candidate = $key . '_' . $breakpoint;
			if ( $meta->has_control( $candidate ) ) {
				$suffixed[ $candidate ] = $value;
				continue;
			}

			$suffixed[ $key ] = $value;
		}

		return $suffixed;
	}
}
