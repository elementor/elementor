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
 * Match keys extend the legacy bridge format with the style target:
 *   "<target>|<css-property>"           for the `default` state
 *   "<target>|<css-property>@<state>"   for state overrides (hover|selected|...)
 *
 * Simple and typography-field descriptors become `setting` overrides (typography fields carry
 * their group toggle as `companion_settings`); border and box-shadow group descriptors become
 * the legacy `border_prefix` / `box_shadow_prefix` overrides.
 */
class V3_Map_Overrides_Builder {

	const DEFAULT_STATE = 'default';

	const TARGET_SEPARATOR = '|';

	const PREFIX_OVERRIDE_KEYS = [
		Style_Control_Target::KIND_BORDER => 'border_prefix',
		Style_Control_Target::KIND_BOX_SHADOW => 'box_shadow_prefix',
	];

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
	 * @param string $target
	 * @param string $property
	 * @param string $state
	 * @param mixed  $descriptor
	 *
	 * @return array{match_key: string, override: array{setting: string, resolver: string, responsive?: bool}}|null
	 */
	private static function translate_descriptor( string $target, string $property, string $state, $descriptor ): ?array {
		if ( ! is_array( $descriptor ) ) {
			return null;
		}

		$override = self::build_override( $descriptor );

		if ( null === $override ) {
			return null;
		}

		$override['_map_descriptor'] = $descriptor;
		$override['_map_target'] = $target;

		if ( ! empty( $descriptor['responsive'] ) ) {
			$override['responsive'] = true;
		}

		if ( ! empty( $descriptor['companion_settings'] ) && is_array( $descriptor['companion_settings'] ) ) {
			$override['companion_settings'] = $descriptor['companion_settings'];
		}

		$match_key = self::match_key( $target, $property, self::DEFAULT_STATE === $state ? null : $state );

		return [
			'match_key' => $match_key,
			'override' => $override,
		];
	}

	public static function match_key( ?string $target, string $property, ?string $state ): string {
		$key = null === $state ? $property : $property . '@' . $state;

		return null === $target ? $key : $target . self::TARGET_SEPARATOR . $key;
	}

	/**
	 * @return array{0: string|null, 1: string, 2: string|null} Target, property, state.
	 */
	public static function split_match_key( string $match_key ): array {
		$target = null;

		if ( false !== strpos( $match_key, self::TARGET_SEPARATOR ) ) {
			[ $target, $match_key ] = explode( self::TARGET_SEPARATOR, $match_key, 2 );
		}

		if ( false === strpos( $match_key, '@' ) ) {
			return [ $target, $match_key, null ];
		}

		[ $property, $state ] = explode( '@', $match_key, 2 );

		return [ $target, $property, '' === $state ? null : $state ];
	}

	private static function build_override( array $descriptor ): ?array {
		$kind = $descriptor['kind'] ?? null;

		if ( isset( self::PREFIX_OVERRIDE_KEYS[ $kind ] ) ) {
			return is_string( $descriptor['prefix'] ?? null )
				? [ self::PREFIX_OVERRIDE_KEYS[ $kind ] => $descriptor['prefix'] ]
				: null;
		}

		if ( ! in_array( $kind, [ Style_Control_Target::KIND_SIMPLE, Style_Control_Target::KIND_TYPOGRAPHY ], true ) ) {
			return null;
		}

		$destination = $descriptor['destinations'][0] ?? null;

		if ( ! is_array( $destination ) || ! isset( $destination['setting'], $destination['resolver'] ) ) {
			return null;
		}

		return [
			'setting' => (string) $destination['setting'],
			'resolver' => (string) $destination['resolver'],
		];
	}
}
