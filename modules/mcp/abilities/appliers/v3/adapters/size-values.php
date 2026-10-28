<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters;

use Elementor\Modules\AtomicWidgets\PropTypes\Border_Width_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Size_Values {

	/**
	 * Prop types whose value is a size per logical side.
	 *
	 * @return string[]
	 */
	public static function sides_prop_types(): array {
		return [ Dimensions_Prop_Type::get_key(), Border_Width_Prop_Type::get_key() ];
	}

	/**
	 * @param mixed $prop_value
	 */
	public static function is_sides_prop( $prop_value ): bool {
		return is_array( $prop_value ) && in_array( $prop_value['$$type'] ?? null, self::sides_prop_types(), true );
	}

	/**
	 * A unitless `0` converts to `0px`, so `margin: 2rem 0` would mix units; a zero side takes the
	 * unit the other sides share.
	 *
	 * @param array<string, array{unit: string, size: mixed}> $sizes
	 * @return array<string, array{unit: string, size: mixed}>
	 */
	public static function with_zero_in_shared_unit( array $sizes ): array {
		$non_zero_units = array_unique( array_column( array_filter( $sizes, fn( array $size ) => ! self::is_zero( $size ) ), 'unit' ) );

		if ( 1 !== count( $non_zero_units ) ) {
			return $sizes;
		}

		$unit = reset( $non_zero_units );

		return array_map( fn( array $size ) => self::is_zero( $size ) ? array_merge( $size, [ 'unit' => $unit ] ) : $size, $sizes );
	}

	private static function is_zero( array $size ): bool {
		return is_numeric( $size['size'] ) && 0.0 === (float) $size['size'];
	}

	/**
	 * @param mixed $prop_value
	 * @return array{unit: string, size: mixed}|null
	 */
	public static function from_prop( $prop_value ): ?array {
		if ( ! is_array( $prop_value ) || Size_Prop_Type::get_key() !== ( $prop_value['$$type'] ?? null ) ) {
			return null;
		}

		$size = $prop_value['value']['size'] ?? null;
		$unit = $prop_value['value']['unit'] ?? null;

		if ( null === $size || '' === $size || ! is_string( $unit ) ) {
			return null;
		}

		return [
			'unit' => $unit,
			'size' => $size,
		];
	}

	/**
	 * @param mixed $control_value
	 */
	public static function to_prop( $control_value ): ?array {
		if ( ! is_array( $control_value ) ) {
			return null;
		}

		$size = $control_value['size'] ?? null;
		$unit = $control_value['unit'] ?? null;

		if ( null === $size || '' === $size || ! is_string( $unit ) ) {
			return null;
		}

		return Size_Prop_Type::generate( [
			'size' => is_numeric( $size ) ? $size + 0 : $size,
			'unit' => $unit,
		] );
	}

	/**
	 * @param array{unit: string, size: mixed} $size
	 * @param array<string, mixed>             $control
	 */
	public static function is_unit_allowed( array $size, array $control ): bool {
		$units = $control['size_units'] ?? null;

		return ! is_array( $units ) || empty( $units ) || in_array( $size['unit'], $units, true );
	}

	/**
	 * @param array<int, array{unit: string, size: mixed}> $sizes
	 */
	public static function are_equal( array $sizes ): bool {
		$first = reset( $sizes );

		foreach ( $sizes as $size ) {
			if ( $size['unit'] !== $first['unit'] || (string) $size['size'] !== (string) $first['size'] ) {
				return false;
			}
		}

		return true;
	}
}
