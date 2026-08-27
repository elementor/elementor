<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Context_Meta;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Decides which V3 setting key to write for a given (setting, breakpoint, is_responsive)
 * tuple, so the rule is shared between converters.
 */
class Responsive_Key_Resolver {

	const BASE_BREAKPOINT = 'desktop';

	/**
	 * The group's own on/off switch is never per-breakpoint.
	 */
	const TYPOGRAPHY_TOGGLE_SUFFIX = '_typography';

	/**
	 * A setting that cannot vary per breakpoint has to be dropped rather than written to its
	 * bare key, which would silently replace the desktop value with the narrower one.
	 *
	 * @param bool $is_responsive Mapping-level claim; the widget's own control marker is
	 *                            authoritative when the mapping makes no claim.
	 * @return string|null Suffixed key, base key, or null when the write should be dropped.
	 */
	public function resolve( string $setting, string $breakpoint, bool $is_responsive, V3_Context_Meta $meta ): ?string {
		if ( self::BASE_BREAKPOINT === $breakpoint ) {
			return $setting;
		}

		if ( ! $is_responsive && ! $meta->supports_breakpoint_variant( $setting ) ) {
			return null;
		}

		return $setting . '_' . $breakpoint;
	}

	/**
	 * Applies the responsive-suffix rule across an entire patch (typography group case).
	 *
	 * A group sibling that is not responsive (font-family, font-weight) cannot carry a
	 * breakpoint value, and writing it to the bare key would overwrite the desktop value,
	 * so it is dropped and reported instead.
	 *
	 * @param array<string, mixed> $patch
	 * @return array{patch: array<string, mixed>, dropped: string[]}
	 */
	public function suffix_patch( array $patch, string $breakpoint, V3_Context_Meta $meta ): array {
		$suffixed = [];
		$dropped = [];

		foreach ( $patch as $key => $value ) {
			if ( self::TYPOGRAPHY_TOGGLE_SUFFIX === substr( (string) $key, -strlen( self::TYPOGRAPHY_TOGGLE_SUFFIX ) ) ) {
				$suffixed[ $key ] = $value;
				continue;
			}

			$resolved = $this->resolve( (string) $key, $breakpoint, false, $meta );

			if ( null === $resolved ) {
				$dropped[] = (string) $key;
				continue;
			}

			$suffixed[ $resolved ] = $value;
		}

		return [
			'patch' => $suffixed,
			'dropped' => $dropped,
		];
	}
}
