<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers;

use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Size_Value_Parser {

	private const CUSTOM_FUNCTIONS = [ 'calc(', 'clamp(', 'min(', 'max(', 'var(' ];

	public static function parse( string $value ): ?array {
		$value = trim( $value );

		if ( '' === $value ) {
			return null;
		}

		$lower = strtolower( $value );

		if ( Size_Constants::UNIT_AUTO === $lower ) {
			return [
				'size' => '',
				'unit' => Size_Constants::UNIT_AUTO,
			];
		}

		foreach ( self::CUSTOM_FUNCTIONS as $prefix ) {
			if ( 0 === strpos( $lower, $prefix ) ) {
				return [
					'size' => $value,
					'unit' => Size_Constants::UNIT_CUSTOM,
				];
			}
		}

		if ( ! preg_match( '/^(-?\d+(?:\.\d+)?)\s*([a-z%]+)?$/i', $value, $matches ) ) {
			return null;
		}

		$number = $matches[1];
		$unit = isset( $matches[2] ) && '' !== $matches[2] ? strtolower( $matches[2] ) : Size_Constants::UNIT_PX;

		if ( ! in_array( $unit, Size_Constants::all_supported_units(), true ) ) {
			return null;
		}

		$size = strpos( $number, '.' ) !== false ? (float) $number : (int) $number;

		return [
			'size' => $size,
			'unit' => $unit,
		];
	}

	public static function parse_unitless_as_em( string $value ): ?array {
		$value = trim( $value );

		if ( preg_match( '/^-?\d+(?:\.\d+)?$/', $value ) ) {
			$size = strpos( $value, '.' ) !== false ? (float) $value : (int) $value;

			return [
				'size' => $size,
				'unit' => Size_Constants::UNIT_EM,
			];
		}

		return self::parse( $value );
	}

	public static function parse_opacity( string $value ): ?array {
		$value = trim( $value );

		if ( preg_match( '/^(-?\d+(?:\.\d+)?)\s*%$/', $value, $matches ) ) {
			$pct = (float) $matches[1];

			return [
				'size' => $pct,
				'unit' => Size_Constants::UNIT_PERCENT,
			];
		}

		if ( preg_match( '/^-?\d+(?:\.\d+)?$/', $value ) ) {
			$pct = ( (float) $value ) * 100.0;
			$pct = max( 0.0, min( 100.0, $pct ) );

			return [
				'size' => $pct === (float) (int) $pct ? (int) $pct : $pct,
				'unit' => Size_Constants::UNIT_PERCENT,
			];
		}

		return self::parse( $value );
	}
}
