<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Migratable_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Prop_Type_Migrator {
	/**
	 * Migrate prop type value to match the expected prop type if compatible.
	 *
	 * @param mixed     $value The prop value to migrate
	 * @param Prop_Type $prop_type The expected prop type
	 * @return mixed The migrated value
	 */
	public static function migrate( $value, Prop_Type $prop_type ) {
		if ( ! is_array( $value ) || ! isset( $value['$$type'] ) || ! isset( $value['value'] ) ) {
			return $value;
		}

		if ( $prop_type instanceof Union_Prop_Type ) {
			return self::migrate_union_type( $value, $prop_type );
		}

		if ( $prop_type instanceof Migratable_Prop_Type ) {
			return self::migrate_migratable_type( $value, $prop_type );
		}

		return $value;
	}

	/**
	 * Migrate value for Union prop type.
	 *
	 * @param array           $value The prop value to migrate
	 * @param Union_Prop_Type $union_prop_type The union prop type
	 * @return array The migrated value
	 */
	private static function migrate_union_type( array $value, Union_Prop_Type $union_prop_type ): array {
		$prop_types = $union_prop_type->get_prop_types();

		foreach ( $prop_types as $union_sub_type ) {
			if ( ! $union_sub_type instanceof Migratable_Prop_Type ) {
				continue;
			}

			$expected_key = $union_sub_type::get_key();

			if ( $value['$$type'] === $expected_key ) {
				break;
			}

			$compatible_keys = $union_sub_type->get_compatible_type_keys();

			if ( ! in_array( $value['$$type'], $compatible_keys, true ) ) {
				continue;
			}

			$value['$$type'] = $expected_key;
			break;
		}

		return $value;
	}

	/**
	 * Migrate value for Migratable prop type.
	 *
	 * @param array                $value The prop value to migrate
	 * @param Migratable_Prop_Type $migratable_prop_type The migratable prop type
	 * @return array The migrated value
	 */
	private static function migrate_migratable_type( array $value, Migratable_Prop_Type $migratable_prop_type ): array {
		$expected_key = $migratable_prop_type::get_key();

		if ( $value['$$type'] === $expected_key ) {
			return $value;
		}

		$compatible_keys = $migratable_prop_type->get_compatible_type_keys();

		if ( in_array( $value['$$type'], $compatible_keys, true ) ) {
			$value['$$type'] = $expected_key;
		}

		return $value;
	}
}
