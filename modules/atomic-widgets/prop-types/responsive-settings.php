<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Opt-in marker for settings props that may be authored per breakpoint.
 *
 * Desktop lives in `settings[propKey]`. Non-desktop overrides live in
 * `settings_variants[]` with `meta.breakpoint`, matching how styles store variants.
 */
class Responsive_Settings {
	const META_KEY = 'responsive';

	/**
	 * Return a tuple for `Prop_Type::meta()`, e.g.
	 * `Number_Prop_Type::make()->meta( Responsive_Settings::enable() )`.
	 *
	 * @return array{0: string, 1: true}
	 */
	public static function enable(): array {
		return [ self::META_KEY, true ];
	}

	public static function is_enabled( Prop_Type $prop_type ): bool {
		if ( $prop_type->get_meta_item( self::META_KEY, false ) ) {
			return true;
		}

		if ( $prop_type instanceof Union_Prop_Type ) {
			foreach ( $prop_type->get_prop_types() as $inner ) {
				if ( self::is_enabled( $inner ) ) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * @param array<string, Prop_Type> $schema
	 * @return array<string, Prop_Type>
	 */
	public static function filter_schema( array $schema ): array {
		$filtered = [];

		foreach ( $schema as $key => $prop_type ) {
			if ( $prop_type instanceof Prop_Type && self::is_enabled( $prop_type ) ) {
				$filtered[ $key ] = $prop_type;
			}
		}

		return $filtered;
	}

	/**
	 * Canonical breakpoint keys, narrowest to widest.
	 *
	 * @return string[]
	 */
	public static function breakpoint_keys(): array {
		return [
			Breakpoints_Manager::BREAKPOINT_KEY_MOBILE,
			Breakpoints_Manager::BREAKPOINT_KEY_MOBILE_EXTRA,
			Breakpoints_Manager::BREAKPOINT_KEY_TABLET,
			Breakpoints_Manager::BREAKPOINT_KEY_TABLET_EXTRA,
			Breakpoints_Manager::BREAKPOINT_KEY_LAPTOP,
			Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP,
			Breakpoints_Manager::BREAKPOINT_KEY_WIDESCREEN,
		];
	}

	public static function is_valid_breakpoint( string $breakpoint ): bool {
		return in_array( $breakpoint, self::breakpoint_keys(), true );
	}

	/**
	 * Inheritance chain from the requested breakpoint toward wider breakpoints, ending at desktop.
	 *
	 * @return string[]
	 */
	public static function fallback_chain( string $breakpoint ): array {
		$keys = self::breakpoint_keys();
		$index = array_search( $breakpoint, $keys, true );
		$desktop_index = array_search( Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP, $keys, true );

		if ( false === $index || false === $desktop_index ) {
			return [ Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP ];
		}

		if ( $index > $desktop_index ) {
			return [ $breakpoint, Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP ];
		}

		return array_slice( $keys, $index, $desktop_index - $index + 1 );
	}

	/**
	 * Build a nested CSS `var()` fallback chain for a breakpoint-scoped custom property prefix.
	 */
	public static function css_var_fallback_chain( string $css_var_prefix, string $breakpoint, string $literal_fallback ): string {
		$chain = self::fallback_chain( $breakpoint );
		$result = $literal_fallback;

		foreach ( array_reverse( $chain ) as $key ) {
			$result = sprintf( 'var(--%s-%s, %s)', $css_var_prefix, $key, $result );
		}

		return $result;
	}
}
