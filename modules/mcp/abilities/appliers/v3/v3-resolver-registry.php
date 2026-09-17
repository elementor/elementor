<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Extension point for V3 value resolvers.
 *
 * Each resolver is a callable of shape `fn(string $css_value, array $args): mixed`.
 * `$args` contains at least `property` (the CSS property being resolved) and may
 * carry resolver-specific keys such as `side` or `prefix`. Callables return one of:
 *   - the resolved value (array/string/scalar) on success,
 *   - a rejection array (`['rejected' => true, 'property' => ..., 'value' => ..., 'reason' => ...]`)
 *     when the input is invalid for the target property,
 *   - `null` when the input cannot be parsed and no rejection reason applies.
 *
 * The default set is registered from `V3_Value_Resolvers::default_resolvers()` on
 * first access. Third parties (or future in-tree code) can override or extend the
 * set with `register()`; the registry is process-scoped.
 */
class V3_Resolver_Registry {

	/**
	 * @var array<string, callable>|null
	 */
	private static ?array $resolvers = null;

	/**
	 * @param string   $name
	 * @param callable $resolver fn(string $css_value, array<string, mixed> $args): mixed
	 */
	public static function register( string $name, callable $resolver ): void {
		self::ensure_initialised();
		self::$resolvers[ $name ] = $resolver;
	}

	public static function has( string $name ): bool {
		self::ensure_initialised();
		return isset( self::$resolvers[ $name ] );
	}

	/**
	 * @param array<string, mixed> $args
	 * @return mixed|null
	 */
	public static function resolve( string $name, string $css_value, array $args = [] ) {
		self::ensure_initialised();

		if ( ! isset( self::$resolvers[ $name ] ) ) {
			return null;
		}

		return ( self::$resolvers[ $name ] )( $css_value, $args );
	}

	/**
	 * Test-only. Resets the registry so a test can register a resolver in isolation.
	 */
	public static function reset(): void {
		self::$resolvers = null;
	}

	private static function ensure_initialised(): void {
		if ( null !== self::$resolvers ) {
			return;
		}

		self::$resolvers = V3_Value_Resolvers::default_resolvers();
	}
}
