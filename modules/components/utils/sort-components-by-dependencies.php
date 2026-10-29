<?php

namespace Elementor\Modules\Components\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Orders component ids so every component comes after the in-kit components it depends on.
 * References to components outside the given ids count as satisfied, and a cycle (only possible
 * in a hand-edited kit) falls back to the original order instead of looping forever.
 */
class Sort_Components_By_Dependencies {
	public static function apply( array $component_ids, array $dependencies ): array {
		$remaining = array_values( $component_ids );
		$sorted = [];

		while ( ! empty( $remaining ) ) {
			$ready = array_values( array_filter(
				$remaining,
				fn( $component_id ) => self::are_dependencies_satisfied( $component_id, $dependencies, $remaining )
			) );

			if ( empty( $ready ) ) {
				$ready = $remaining;
			}

			$sorted = array_merge( $sorted, $ready );
			$remaining = array_values( array_diff( $remaining, $ready ) );
		}

		return $sorted;
	}

	private static function are_dependencies_satisfied( $component_id, array $dependencies, array $remaining ): bool {
		$depends_on = $dependencies[ $component_id ]['depends_on'] ?? [];

		if ( ! is_array( $depends_on ) ) {
			return true;
		}

		$pending_dependencies = array_diff( $remaining, [ $component_id ] );

		return empty( array_intersect( $depends_on, $pending_dependencies ) );
	}
}
