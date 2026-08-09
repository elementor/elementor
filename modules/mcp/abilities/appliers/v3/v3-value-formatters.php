<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Inverse of {@see V3_Value_Resolvers}: turns V3 control values back into CSS strings.
 * Uses the same resolver names so mapper/serializer stay symmetric under one vocabulary.
 */
class V3_Value_Formatters {

	const DEFAULT_UNIT = 'px';

	public static function format( string $resolver, $value ): ?string {
		if ( null === $value || '' === $value ) {
			return null;
		}

		switch ( $resolver ) {
			case 'text':
			case 'color':
				return is_scalar( $value ) ? (string) $value : null;

			case 'dimension':
			case 'slider':
				return self::format_dimension( $value );

			case 'sides':
				return self::format_sides( $value );

			default:
				return null;
		}
	}

	public static function format_size( $size ): string {
		if ( is_int( $size ) ) {
			return (string) $size;
		}

		if ( is_float( $size ) ) {
			return rtrim( rtrim( sprintf( '%.4f', $size ), '0' ), '.' );
		}

		if ( is_string( $size ) && '' !== $size ) {
			return $size;
		}

		return '0';
	}

	private static function format_dimension( $value ): ?string {
		if ( ! is_array( $value ) || ! array_key_exists( 'size', $value ) ) {
			return null;
		}

		if ( '' === $value['size'] || null === $value['size'] ) {
			return null;
		}

		$unit = isset( $value['unit'] ) && '' !== $value['unit'] ? $value['unit'] : self::DEFAULT_UNIT;
		if ( self::DEFAULT_UNIT !== $unit ) {
			return self::format_size( $value['size'] ) . $unit;
		}

		return self::format_size( $value['size'] ) . self::DEFAULT_UNIT;
	}

	private static function format_sides( $value ): ?string {
		if ( ! is_array( $value ) ) {
			return null;
		}

		foreach ( [ 'top', 'right', 'bottom', 'left' ] as $side ) {
			if ( ! array_key_exists( $side, $value ) || '' === $value[ $side ] || null === $value[ $side ] ) {
				return null;
			}
		}

		$unit = isset( $value['unit'] ) && '' !== $value['unit'] ? $value['unit'] : self::DEFAULT_UNIT;
		$top = self::format_size( $value['top'] );
		$right = self::format_size( $value['right'] );
		$bottom = self::format_size( $value['bottom'] );
		$left = self::format_size( $value['left'] );

		if ( ! empty( $value['isLinked'] ) && $top === $right && $right === $bottom && $bottom === $left ) {
			return $top . $unit;
		}

		return sprintf( '%s%s %s%s %s%s %s%s', $top, $unit, $right, $unit, $bottom, $unit, $left, $unit );
	}
}
