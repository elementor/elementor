<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Prop_Canonicalizer {

	/**
	 * Resolves a property name to its canonical key in the schema.
	 * Mirrors the frontend's resolveCanonicalPropName function.
	 *
	 * @param array<string, Prop_Type>   $schema    The widget props schema.
	 * @param string                     $name      The property name to resolve (may be canonical or alias).
	 * @param array<string, string>|null $alias_map Optional precomputed alias map from build_alias_map().
	 *                                              Pass it when resolving many props against the same schema.
	 *
	 * @return string|null The canonical key if found, or null if unknown.
	 */
	public static function resolve_canonical_key( array $schema, string $name, ?array $alias_map = null ): ?string {
		if ( isset( $schema[ $name ] ) ) {
			return $name;
		}

		$alias_map = $alias_map ?? self::build_alias_map( $schema );

		return $alias_map[ $name ] ?? null;
	}

	/**
	 * @param array<string, Prop_Type> $schema The widget props schema.
	 * @return array<string, string> Map of alias => canonical.
	 */
	public static function build_alias_map( array $schema ): array {
		return self::build_alias_to_canonical_map( $schema );
	}

	/**
	 * Resolves all property keys in an array to their canonical names.
	 * Mirrors the frontend's resolveCanonicalPropKeys function.
	 *
	 * @param array<string, Prop_Type> $schema The widget props schema.
	 * @param array<string, mixed>     $props  The props to resolve.
	 *
	 * @return array<string, mixed> Props with canonical keys.
	 */
	public static function resolve_canonical_prop_keys( array $schema, array $props ): array {
		$alias_map = self::build_alias_to_canonical_map( $schema );
		$resolved = [];

		foreach ( $props as $key => $value ) {
			if ( isset( $schema[ $key ] ) ) {
				$resolved[ $key ] = $value;
				continue;
			}

			$canonical = $alias_map[ $key ] ?? null;

			if ( ! $canonical ) {
				$resolved[ $key ] = $value;
				continue;
			}

			if ( ! array_key_exists( $canonical, $resolved ) ) {
				$resolved[ $canonical ] = $value;
			}
		}

		return $resolved;
	}

	/**
	 * Returns the list of available property names in the schema.
	 *
	 * @param array<string, Prop_Type> $schema The widget props schema.
	 *
	 * @return string[] List of canonical property names.
	 */
	public static function available_prop_names( array $schema ): array {
		return array_keys( $schema );
	}

	/**
	 * Builds a map from alias names to canonical property names.
	 *
	 * @param array<string, Prop_Type> $schema The widget props schema.
	 *
	 * @return array<string, string> Map of alias => canonical.
	 */
	private static function build_alias_to_canonical_map( array $schema ): array {
		$alias_to_canonical = [];

		foreach ( $schema as $canonical => $prop_type ) {
			if ( ! ( $prop_type instanceof Prop_Type ) ) {
				continue;
			}

			$aliases = $prop_type->get_aliases();

			foreach ( $aliases as $alias ) {
				if ( is_string( $alias ) && '' !== $alias ) {
					$alias_to_canonical[ $alias ] = $canonical;
				}
			}
		}

		return $alias_to_canonical;
	}
}
