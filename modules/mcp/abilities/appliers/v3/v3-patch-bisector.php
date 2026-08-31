<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Narrows a failing settings patch to the minimal set of keys that trip the render probe.
 *
 * Split logic is group-aware: sibling keys of a V3 group control (e.g. `typography_typography`
 * and its `typography_font_size` companion) must move together, otherwise probing "half" of a
 * group produces a shape that fatals for a reason unrelated to what the LLM actually caused.
 */
class V3_Patch_Bisector {

	/**
	 * @param array<string, mixed>            $base
	 * @param array<string, mixed>            $patch
	 * @param callable                        $probe  fn(array $settings): bool -- true when render is OK.
	 * @param array<string, string[]>         $groups Optional. Group name => member setting keys.
	 * @return string[]
	 */
	public static function find_offending( array $base, array $patch, callable $probe, array $groups = [] ): array {
		if ( empty( $patch ) ) {
			return [];
		}

		$units = self::partition_into_units( array_keys( $patch ), $groups );
		$budget = 2 * self::ceil_log2( max( 1, count( $units ) ) ) + count( $units );
		$counter = 0;

		$full_fails = self::probe_fails( $units, $base, $patch, $probe, $counter, $budget );
		if ( null === $full_fails ) {
			return array_keys( $patch );
		}
		if ( ! $full_fails ) {
			return [];
		}

		$offending_units = self::bisect( $units, $base, $patch, $probe, $counter, $budget );

		if ( null === $offending_units ) {
			return array_keys( $patch );
		}

		$keys = [];
		foreach ( $offending_units as $unit ) {
			foreach ( $unit as $key ) {
				$keys[] = $key;
			}
		}

		return array_values( array_unique( $keys ) );
	}

	/**
	 * @param string[]                $patch_keys
	 * @param array<string, string[]> $groups
	 * @return array<int, string[]>
	 */
	private static function partition_into_units( array $patch_keys, array $groups ): array {
		$patch_set = array_flip( $patch_keys );
		$units = [];
		$assigned = [];

		foreach ( $groups as $members ) {
			$group_members = [];
			foreach ( $members as $member ) {
				if ( isset( $patch_set[ $member ] ) && ! isset( $assigned[ $member ] ) ) {
					$group_members[] = $member;
					$assigned[ $member ] = true;
				}
			}
			if ( ! empty( $group_members ) ) {
				sort( $group_members );
				$units[] = $group_members;
			}
		}

		foreach ( $patch_keys as $key ) {
			if ( isset( $assigned[ $key ] ) ) {
				continue;
			}
			$units[] = [ $key ];
			$assigned[ $key ] = true;
		}

		usort( $units, static fn( $a, $b ) => strcmp( $a[0], $b[0] ) );

		return $units;
	}

	/**
	 * @param array<int, string[]> $units
	 * @param array<string, mixed> $base
	 * @param array<string, mixed> $patch
	 * @return array<int, string[]>|null Null when budget exhausted.
	 */
	private static function bisect(
		array $units,
		array $base,
		array $patch,
		callable $probe,
		int &$counter,
		int $budget
	): ?array {
		if ( count( $units ) <= 1 ) {
			return $units;
		}

		$mid = intdiv( count( $units ), 2 );
		$left = array_slice( $units, 0, $mid );
		$right = array_slice( $units, $mid );

		$left_fails = self::probe_fails( $left, $base, $patch, $probe, $counter, $budget );
		if ( null === $left_fails ) {
			return null;
		}

		$right_fails = self::probe_fails( $right, $base, $patch, $probe, $counter, $budget );
		if ( null === $right_fails ) {
			return null;
		}

		if ( $left_fails && ! $right_fails ) {
			return self::bisect( $left, $base, $patch, $probe, $counter, $budget );
		}
		if ( $right_fails && ! $left_fails ) {
			return self::bisect( $right, $base, $patch, $probe, $counter, $budget );
		}
		if ( $left_fails && $right_fails ) {
			$left_min = self::bisect( $left, $base, $patch, $probe, $counter, $budget );
			if ( null === $left_min ) {
				return null;
			}
			$right_min = self::bisect( $right, $base, $patch, $probe, $counter, $budget );
			if ( null === $right_min ) {
				return null;
			}
			return array_merge( $left_min, $right_min );
		}

		return $units;
	}

	/**
	 * @param array<int, string[]> $units
	 * @param array<string, mixed> $base
	 * @param array<string, mixed> $patch
	 * @return bool|null Null when budget exhausted.
	 */
	private static function probe_fails(
		array $units,
		array $base,
		array $patch,
		callable $probe,
		int &$counter,
		int $budget
	): ?bool {
		if ( $counter >= $budget ) {
			return null;
		}
		$counter++;

		$candidate = $base;
		foreach ( $units as $unit ) {
			foreach ( $unit as $key ) {
				if ( array_key_exists( $key, $patch ) ) {
					$candidate[ $key ] = $patch[ $key ];
				}
			}
		}

		return ! (bool) $probe( $candidate );
	}

	private static function ceil_log2( int $n ): int {
		if ( $n <= 1 ) {
			return 1;
		}
		return (int) ceil( log( $n, 2 ) );
	}
}
