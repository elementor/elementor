<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Translates a compiled V3 widget map's `style_targets` into the flat
 * `[ match_key => { setting, resolver, responsive? } ]` shape consumed by
 * {@see \Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper} and
 * {@see \Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Serializer}.
 *
 * Match key format matches the legacy bridge registry:
 *   "<css-property>"           for the `default` state
 *   "<css-property>@<state>"   for pseudo-state overrides (hover|focus|active)
 *
 * Only simple single-destination descriptors (see {@see Style_Control_Target::KIND_SIMPLE})
 * are emitted in PR 3. Typography, border, and box-shadow descriptors are added by later PRs
 * and are silently skipped here.
 */
class V3_Map_Overrides_Builder {

	const DEFAULT_STATE = 'default';

	/**
	 * @param array<string, array{css_properties: array<string, array<string, array>>}> $style_targets
	 *
	 * @return array<string, array{setting: string, resolver: string, responsive?: bool}>
	 */
	public static function from_style_targets( array $style_targets ): array {
		$overrides = [];

		foreach ( $style_targets as $alias => $target ) {
			$css_properties = $target['css_properties'] ?? [];

			if ( ! is_array( $css_properties ) ) {
				continue;
			}

			foreach ( $css_properties as $property => $states ) {
				if ( ! is_array( $states ) ) {
					continue;
				}

				foreach ( $states as $state => $descriptor ) {
					$entry = self::translate_descriptor( (string) $alias, (string) $property, (string) $state, $descriptor );

					if ( null !== $entry ) {
						$overrides[ $entry['match_key'] ] = $entry['override'];
					}
				}
			}
		}

		return $overrides;
	}

	/**
	 * @param array $descriptor
	 * @param string $target
	 * @param string $property
	 * @param string $state
	 *
	 * @return array{match_key: string, override: array{setting: string, resolver: string, responsive?: bool}}|null
	 */
	private static function translate_descriptor( string $target, string $property, string $state, $descriptor ): ?array {
		if ( ! is_array( $descriptor ) ) {
			return null;
		}

		if ( ( $descriptor['kind'] ?? null ) !== Style_Control_Target::KIND_SIMPLE ) {
			return null;
		}

		$destination = $descriptor['destinations'][0] ?? null;

		if ( ! is_array( $destination ) || ! isset( $destination['setting'], $destination['resolver'] ) ) {
			return null;
		}

		$override = [
			'setting' => (string) $destination['setting'],
			'resolver' => (string) $destination['resolver'],
			'_map_descriptor' => $descriptor,
			'_map_target' => $target,
		];

		if ( ! empty( $descriptor['responsive'] ) ) {
			$override['responsive'] = true;
		}

		$match_key = self::DEFAULT_STATE === $state
			? $property
			: $property . '@' . $state;

		return [
			'match_key' => $match_key,
			'override' => $override,
		];
	}
}
