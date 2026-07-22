<?php

namespace Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers;

use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Resolver_Base;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Size_Plain_Resolver extends Plain_Resolver_Base {
	const NUMBER_WITH_UNIT_PATTERN = '/^(-?\d*\.?\d+)([a-z%]*)$/i';
	const DYNAMIC_FUNCTION_PATTERN = '/(?:calc|clamp|min|max|var|env)\(/i';

	private bool $allow_unitless;

	public function __construct( bool $allow_unitless = false ) {
		$this->allow_unitless = $allow_unitless;
	}

	public static function parse( $value, bool $allow_unitless = false ): ?array {
		return ( new self( $allow_unitless ) )->resolve( $value );
	}

	public function resolve( $plain_value ) {
		if ( ! is_string( $plain_value ) && ! is_numeric( $plain_value ) ) {
			return null;
		}

		$value = trim( (string) $plain_value );

		if ( '' === $value ) {
			return null;
		}

		if ( Size_Constants::UNIT_AUTO === strtolower( $value ) ) {
			return [
				'size' => null,
				'unit' => Size_Constants::UNIT_AUTO,
			];
		}

		if ( $this->is_dynamic_value( $value ) ) {
			return [
				'size' => $value,
				'unit' => Size_Constants::UNIT_CUSTOM,
			];
		}

		return $this->parse_number_with_unit( $value );
	}

	private function parse_number_with_unit( string $value ): ?array {
		if ( ! preg_match( self::NUMBER_WITH_UNIT_PATTERN, $value, $matches ) ) {
			return null;
		}

		$size = $matches[1] + 0;
		$unit = strtolower( $matches[2] );

		if ( '' === $unit ) {
			if ( 0.0 === (float) $size ) {
				return [
					'size' => $size,
					'unit' => Size_Constants::DEFAULT_UNIT,
				];
			}

			return $this->allow_unitless
				? [
					'size' => $matches[1],
					'unit' => Size_Constants::UNIT_CUSTOM,
				]
				: null;
		}

		if ( ! in_array( $unit, Size_Constants::all_supported_units(), true ) ) {
			return null;
		}

		return [
			'size' => $size,
			'unit' => $unit,
		];
	}

	private function is_dynamic_value( string $value ): bool {
		return 1 === preg_match( self::DYNAMIC_FUNCTION_PATTERN, $value );
	}
}
