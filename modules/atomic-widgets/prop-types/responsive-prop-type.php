<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Transformable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Responsive_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'responsive';
	}

	protected function define_shape(): array {
		return [];
	}

	public static function create_from( Transformable_Prop_Type $inner ): self {
		$dependencies = $inner->get_dependencies();
		$prop_meta = $inner->get_meta() ?? [];

		$inner->set_dependencies( [] );

		$inner_default = $inner->get_default();
		$shape = [];

		foreach ( self::breakpoint_keys() as $breakpoint_key ) {
			$entry = self::duplicate_inner_prop_type( $inner );

			if (
				Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP === $breakpoint_key
				&& is_array( $inner_default )
				&& array_key_exists( 'value', $inner_default )
			) {
				$entry->default( $inner_default['value'] );
			}

			$shape[ $breakpoint_key ] = $entry;
		}

		$result = static::make()
			->set_shape( $shape )
			->set_dependencies( $dependencies );

		if ( null !== $inner_default ) {
			$result->default( [
				Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP => $inner_default,
			] );
		}

		foreach ( $prop_meta as $key => $value ) {
			$result->meta( $key, $value );
		}

		$inner_initial = $inner->get_initial_value();

		if ( null !== $inner_initial ) {
			$result->initial_value( [
				Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP => $inner_initial,
			] );
		}

		return $result;
	}

	/**
	 * All canonical breakpoint keys, narrowest to widest (excluding implicit desktop root ordering quirks).
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

	private static function duplicate_inner_prop_type( Transformable_Prop_Type $inner ): Transformable_Prop_Type {
		$entry = clone $inner;
		$entry->set_dependencies( [] );

		$default_property = new \ReflectionProperty( $entry, 'default' );
		$default_property->setAccessible( true );
		$default_property->setValue( $entry, null );

		return $entry;
	}
}
