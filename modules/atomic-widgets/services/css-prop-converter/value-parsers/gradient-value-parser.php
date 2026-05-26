<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Parses a CSS gradient function value (linear-gradient / radial-gradient) into the
 * typed `background-gradient-overlay` prop shape used by atomic-widgets.
 *
 * Supported inputs:
 *  - `linear-gradient( <angle>deg, <color> <offset>%, ... )` — explicit angle + explicit stops
 *  - `linear-gradient( <direction-keyword>, <color> <offset>%, ... )` — `to top`, `to right`, etc.
 *  - `linear-gradient( <color> <offset>%, ... )` — angle defaults to 180deg (CSS spec)
 *  - `radial-gradient( <color> <offset>%, ... )` — bare radial without shape/position prefix
 *
 * NOT supported (returns null; caller routes to custom_css):
 *  - Radial gradients with shape/position prefix (`circle at 30% 20%`, `ellipse closest-side`, ...)
 *  - Stops without an explicit `<offset>%`
 *  - `<angle>rad`, `<angle>turn`, `<angle>grad` units
 *  - Conic gradients
 *  - Multiple gradients in one value (`linear-gradient(...), linear-gradient(...)`)
 */
class Gradient_Value_Parser {

	private const DIRECTION_ANGLES = [
		'to top' => 0,
		'to top right' => 45,
		'to right' => 90,
		'to bottom right' => 135,
		'to bottom' => 180,
		'to bottom left' => 225,
		'to left' => 270,
		'to top left' => 315,
	];

	private const DEFAULT_LINEAR_ANGLE = 180;

	public static function parse( string $value ): ?array {
		$value = trim( $value );

		if ( ! preg_match( '/^(linear|radial)-gradient\(\s*(.+)\s*\)\s*$/is', $value, $match ) ) {
			return null;
		}

		$type = strtolower( $match[1] );
		$parts = self::split_top_level_commas( $match[2] );

		if ( count( $parts ) < 2 ) {
			return null;
		}

		$angle = null;

		if ( 'linear' === $type ) {
			$parsed_angle = self::parse_angle( trim( $parts[0] ) );
			if ( null !== $parsed_angle ) {
				$angle = $parsed_angle;
				array_shift( $parts );
			} else {
				$angle = self::DEFAULT_LINEAR_ANGLE;
			}
		}

		if ( 'radial' === $type && null === Color_Value_Parser::parse( self::strip_offset( trim( $parts[0] ) ) ) ) {
			return null;
		}

		$stops = [];

		foreach ( $parts as $stop_string ) {
			$stop = self::parse_color_stop( trim( $stop_string ) );

			if ( null === $stop ) {
				return null;
			}

			$stops[] = $stop;
		}

		if ( count( $stops ) < 2 ) {
			return null;
		}

		$overlay = [
			'$$type' => 'background-gradient-overlay',
			'value' => [
				'type' => [ '$$type' => 'string', 'value' => $type ],
				'stops' => [
					'$$type' => 'gradient-color-stop',
					'value' => $stops,
				],
			],
		];

		if ( 'linear' === $type ) {
			$overlay['value']['angle'] = [ '$$type' => 'number', 'value' => $angle ];
		}

		return $overlay;
	}

	private static function parse_angle( string $token ): ?int {
		$token = strtolower( trim( $token ) );

		if ( isset( self::DIRECTION_ANGLES[ $token ] ) ) {
			return self::DIRECTION_ANGLES[ $token ];
		}

		if ( preg_match( '/^(-?\d+(?:\.\d+)?)deg$/', $token, $match ) ) {
			return (int) round( (float) $match[1] );
		}

		return null;
	}

	private static function parse_color_stop( string $token ): ?array {
		if ( ! preg_match( '/^(.+?)\s+(-?\d+(?:\.\d+)?)%\s*$/', $token, $match ) ) {
			return null;
		}

		$color_string = trim( $match[1] );
		$offset = (float) $match[2];

		$color = Color_Value_Parser::parse( $color_string );

		if ( null === $color ) {
			return null;
		}

		return [
			'$$type' => 'color-stop',
			'value' => [
				'color' => [ '$$type' => 'color', 'value' => $color ],
				'offset' => [ '$$type' => 'number', 'value' => 0 + $offset ],
			],
		];
	}

	private static function strip_offset( string $token ): string {
		return (string) preg_replace( '/\s+-?\d+(?:\.\d+)?%\s*$/', '', $token );
	}

	private static function split_top_level_commas( string $value ): array {
		$parts = [];
		$buffer = '';
		$depth = 0;
		$length = strlen( $value );

		for ( $i = 0; $i < $length; $i++ ) {
			$char = $value[ $i ];

			if ( '(' === $char ) {
				$depth++;
			} elseif ( ')' === $char ) {
				$depth = max( 0, $depth - 1 );
			}

			if ( ',' === $char && 0 === $depth ) {
				$parts[] = $buffer;
				$buffer = '';
				continue;
			}

			$buffer .= $char;
		}

		if ( '' !== $buffer ) {
			$parts[] = $buffer;
		}

		return $parts;
	}
}
