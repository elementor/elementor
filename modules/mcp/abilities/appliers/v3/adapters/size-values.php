<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters;

use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Size_Values {

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
