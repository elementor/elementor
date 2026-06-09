<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers;

use Elementor\Modules\AtomicWidgets\PropTypes\Background_Gradient_Overlay_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Image_Overlay_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Stop_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Gradient_Color_Stop_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Src_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Position_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Url_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Stateless parser: a raw CSS `background-image` value -> an ordered list of overlay PropValues (one
 * per comma-separated layer), or null to decline the whole declaration (-> custom_css).
 *
 * Each layer token is classified:
 *  - `none`                    -> layer is silently skipped (not added to the list).
 *  - `url(...)`                -> Background_Image_Overlay_Prop_Type PropValue.
 *  - `linear-gradient(...)`    -> Background_Gradient_Overlay_Prop_Type PropValue (linear).
 *  - `radial-gradient(...)`    -> Background_Gradient_Overlay_Prop_Type PropValue (radial).
 *  - anything else             -> decline the entire value.
 *
 * Gradient parsing supports:
 *  - Linear: optional leading `Ndeg` angle, then comma-separated color stops.
 *  - Radial:  optional leading `circle at <named-position>`, then color stops.
 *  - Color stops: `<color> <N>%` pairs; offset is optional.
 *  - Unsupported syntax (direction keywords, conic, complex shapes) declines.
 */
class Background_Image_Value_Parser {
	const DEFAULT_IMAGE_SIZE = 'large';

	/**
	 * @return array[]|null  Ordered overlay PropValues per layer, or null to decline.
	 */
	public static function parse( string $value ): ?array {
		$tokens = Css_Token_Splitter::split_by_comma( trim( $value ) );

		if ( empty( $tokens ) ) {
			return null;
		}

		$overlays = [];

		foreach ( $tokens as $token ) {
			$overlay = self::parse_layer( trim( $token ) );

			if ( false === $overlay ) {
				return null;
			}

			if ( null !== $overlay ) {
				$overlays[] = $overlay;
			}
		}

		return $overlays;
	}

	/**
	 * @return array|null|false  PropValue, null for `none`, false to decline.
	 */
	private static function parse_layer( string $token ) {
		$lower = strtolower( $token );

		if ( 'none' === $lower ) {
			return null;
		}

		if ( 0 === strpos( $lower, 'url(' ) ) {
			return self::parse_url( $token );
		}

		if ( preg_match( '/^([\w-]+-gradient)\s*\((.+)\)$/si', $token, $m ) ) {
			return self::parse_gradient( strtolower( $m[1] ), $m[2] );
		}

		return false;
	}

	/**
	 * @return array|false
	 */
	private static function parse_url( string $token ) {
		if ( ! preg_match( '/^url\s*\(\s*([\'"]?)(.+?)\1\s*\)$/i', $token, $m ) ) {
			return false;
		}

		$url = $m[2];

		return Background_Image_Overlay_Prop_Type::generate( [
			'image' => Image_Prop_Type::generate( [
				'src' => Image_Src_Prop_Type::generate( [
					'url' => Url_Prop_Type::generate( $url ),
				] ),
				'size' => String_Prop_Type::generate( self::DEFAULT_IMAGE_SIZE ),
			] ),
		] );
	}

	/**
	 * @return array|false
	 */
	private static function parse_gradient( string $func_name, string $args ) {
		if ( 'linear-gradient' === $func_name ) {
			return self::parse_linear_gradient( $args );
		}

		if ( 'radial-gradient' === $func_name ) {
			return self::parse_radial_gradient( $args );
		}

		return false;
	}

	/**
	 * @return array|false
	 */
	private static function parse_linear_gradient( string $args ) {
		$tokens = Css_Token_Splitter::split_by_comma( trim( $args ) );

		if ( empty( $tokens ) ) {
			return false;
		}

		$angle = null;
		$stop_start = 0;
		$first = trim( $tokens[0] );

		if ( preg_match( '/^(-?\d+(?:\.\d+)?)deg$/i', $first, $m ) ) {
			$angle = (float) $m[1];
			$stop_start = 1;
		} elseif ( 0 === strpos( strtolower( $first ), 'to ' ) ) {
			return false;
		}

		$stops = self::parse_color_stops( array_slice( $tokens, $stop_start ) );

		if ( null === $stops ) {
			return false;
		}

		$value = [
			'type' => String_Prop_Type::generate( 'linear' ),
			'stops' => Gradient_Color_Stop_Prop_Type::generate( $stops ),
		];

		if ( null !== $angle ) {
			$value['angle'] = Number_Prop_Type::generate( $angle );
		}

		return Background_Gradient_Overlay_Prop_Type::generate( $value );
	}

	/**
	 * @return array|false
	 */
	private static function parse_radial_gradient( string $args ) {
		$tokens = Css_Token_Splitter::split_by_comma( trim( $args ) );

		if ( empty( $tokens ) ) {
			return false;
		}

		$positions = null;
		$stop_start = 0;
		$first = trim( $tokens[0] );

		if ( preg_match( '/^circle\s+at\s+(.+)$/i', $first, $m ) ) {
			$pos = trim( $m[1] );

			if ( ! self::is_valid_radial_position( $pos ) ) {
				return false;
			}

			$positions = $pos;
			$stop_start = 1;
		}

		$stops = self::parse_color_stops( array_slice( $tokens, $stop_start ) );

		if ( null === $stops ) {
			return false;
		}

		$value = [
			'type' => String_Prop_Type::generate( 'radial' ),
			'stops' => Gradient_Color_Stop_Prop_Type::generate( $stops ),
		];

		if ( null !== $positions ) {
			$value['positions'] = String_Prop_Type::generate( $positions );
		}

		return Background_Gradient_Overlay_Prop_Type::generate( $value );
	}

	private static function is_valid_radial_position( string $pos ): bool {
		if ( in_array( $pos, Position_Prop_Type::get_position_enum_values(), true ) ) {
			return true;
		}

		$token_pattern = '(?:(?:top|bottom|left|right|center)|(?:-?\d+(?:\.\d+)?(?:%|px|em|rem|vw|vh)))';

		return (bool) preg_match( '/^' . $token_pattern . '(?:\s+' . $token_pattern . ')?$/i', $pos );
	}

	/**
	 * @return array[]|null
	 */
	private static function parse_color_stops( array $tokens ): ?array {
		if ( empty( $tokens ) ) {
			return null;
		}

		$stops = [];

		foreach ( $tokens as $token ) {
			$stop = self::parse_color_stop( trim( $token ) );

			if ( null === $stop ) {
				return null;
			}

			$stops[] = $stop;
		}

		return $stops;
	}

	private static function parse_color_stop( string $token ): ?array {
		$parts = Css_Token_Splitter::split_by_whitespace( $token );

		if ( empty( $parts ) || count( $parts ) > 2 ) {
			return null;
		}

		$stop_value = [ 'color' => Color_Prop_Type::generate( $parts[0] ) ];

		if ( isset( $parts[1] ) ) {
			if ( ! preg_match( '/^(-?\d+(?:\.\d+)?)%$/', $parts[1], $m ) ) {
				return null;
			}

			$stop_value['offset'] = Number_Prop_Type::generate( (float) $m[1] );
		}

		return Color_Stop_Prop_Type::generate( $stop_value );
	}
}
