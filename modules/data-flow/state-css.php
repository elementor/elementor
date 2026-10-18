<?php

namespace Elementor\Modules\DataFlow;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class State_CSS {
	const VARIABLE_PREFIX = '--e-state-';
	const CLASS_PREFIX = 'e--state-';
	const SIZE_UNITS = [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax', 'ch', 'ex', 'pt', 'cm', 'mm', 'in', 'fr', 'deg', 's', 'ms' ];
	const COLOR_PATTERN = '/^(#[0-9a-f]{3,8}|(rgb|hsl)a?\([\d\s.,%\/-]+\)|[a-z]{3,20})$/i';
	const IDENTIFIER_PATTERN = '/^[\w-]{1,64}$/';
	const TOKEN_PATTERN = '/^[A-Za-z0-9 _.\-]{1,64}$/';

	public static function value( $value, string $prop_type ): ?string {
		$value = self::unwrap( $value );

		switch ( $prop_type ) {
			case State_Params::TYPE_NUMBER:
				return self::number( $value );
			case State_Schema::TYPE_SIZE:
				return self::size( $value );
			case State_Schema::TYPE_COLOR:
				return is_string( $value ) && 1 === preg_match( self::COLOR_PATTERN, $value ) ? $value : null;
			case State_Schema::TYPE_ENUM:
				return is_string( $value ) && 1 === preg_match( self::IDENTIFIER_PATTERN, $value ) ? $value : null;
			case State_Params::TYPE_STRING:
				return is_string( $value ) && 1 === preg_match( self::TOKEN_PATTERN, $value ) ? $value : null;
			default:
				return null;
		}
	}

	public static function variables( array $state, array $schema ): array {
		$variables = [];

		foreach ( $state as $key => $value ) {
			$prop_type = $schema[ $key ]['prop_type'] ?? State_Schema::infer_prop_type( $value );
			$css_value = self::value( $value, $prop_type );

			if ( null !== $css_value ) {
				$variables[ self::VARIABLE_PREFIX . $key ] = $css_value;
			}
		}

		return $variables;
	}

	public static function classes( array $state ): array {
		$classes = [];

		foreach ( $state as $key => $value ) {
			if ( true === $value ) {
				$classes[] = self::CLASS_PREFIX . $key;
			}
		}

		return $classes;
	}

	public static function declarations( array $variables ): string {
		return implode( ';', array_map( fn( $name, $value ) => $name . ':' . $value, array_keys( $variables ), $variables ) );
	}

	public static function merge_style( string $existing, array $variables ): string {
		$existing = trim( $existing );
		$existing = '' === $existing || ';' === substr( $existing, -1 ) ? $existing : $existing . ';';

		return $existing . self::declarations( $variables ) . ';';
	}

	private static function unwrap( $value ) {
		return is_array( $value ) && isset( $value['$$type'] ) ? ( $value['value'] ?? null ) : $value;
	}

	private static function number( $value ): ?string {
		return ( is_int( $value ) || is_float( $value ) ) && is_finite( (float) $value ) ? (string) $value : null;
	}

	private static function size( $value ): ?string {
		if ( ! is_array( $value ) || ! isset( $value['size'], $value['unit'] ) ) {
			return null;
		}

		$size = self::number( $value['size'] );

		return null !== $size && in_array( $value['unit'], self::SIZE_UNITS, true ) ? $size . $value['unit'] : null;
	}
}
