<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers;

use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Filters\Css_Filter_Func_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Filters\Functions\Blur_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Filters\Functions\Color_Tone_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Filters\Functions\Drop_Shadow_Filter_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Filters\Functions\Hue_Rotate_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Filters\Functions\Intensity_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Stateless parser: a raw CSS `filter`/`backdrop-filter` value -> the ordered list of
 * `css-filter-func` PropValues an Array(Filter) accepts, or null to decline (the caller routes the
 * whole declaration to custom_css). It never touches the registry, context, or the wrapping prop type.
 *
 * Conversion is all-or-nothing per declaration: a single unsupported function or unparsable argument
 * declines the entire value. Single-argument functions (blur/brightness/contrast/saturate/hue-rotate/
 * grayscale/invert/sepia) reuse Size_Plain_Resolver; drop-shadow expands to xAxis/yAxis/blur/color.
 */
class Filter_Value_Parser {
	const DROP_SHADOW = 'drop-shadow';

	const DEFAULT_DROP_SHADOW_BLUR = [
		'size' => 10,
		'unit' => Size_Constants::UNIT_PX,
	];

	const DEFAULT_DROP_SHADOW_COLOR = 'rgba(0, 0, 0, 1)';

	const FUNCTION_GROUPS = [
		'blur' => 'blur',
		'brightness' => 'intensity',
		'contrast' => 'intensity',
		'saturate' => 'intensity',
		'grayscale' => 'color-tone',
		'invert' => 'color-tone',
		'sepia' => 'color-tone',
		'hue-rotate' => 'hue-rotate',
		self::DROP_SHADOW => self::DROP_SHADOW,
	];

	const GROUP_PROP_TYPES = [
		'blur' => Blur_Prop_Type::class,
		'intensity' => Intensity_Prop_Type::class,
		'color-tone' => Color_Tone_Prop_Type::class,
		'hue-rotate' => Hue_Rotate_Prop_Type::class,
	];

	const DROP_SHADOW_MIN_SIZES = 2;
	const DROP_SHADOW_MAX_SIZES = 3;

	/**
	 * @return array<int, array>|null
	 */
	public static function parse( string $value ): ?array {
		$functions = self::split_functions( trim( $value ) );

		if ( null === $functions ) {
			return null;
		}

		$items = [];

		foreach ( $functions as [$name, $args] ) {
			$item = self::parse_function( $name, $args );

			if ( null === $item ) {
				return null;
			}

			$items[] = $item;
		}

		return empty( $items ) ? null : $items;
	}

	/**
	 * @return array{0: string, 1: string}[]|null
	 */
	private static function split_functions( string $value ): ?array {
		$functions = [];
		$length = strlen( $value );
		$i = 0;

		while ( $i < $length ) {
			$i = self::skip_whitespace( $value, $i, $length );

			if ( $i >= $length ) {
				break;
			}

			$name_start = $i;

			while ( $i < $length && ( ctype_alpha( $value[ $i ] ) || '-' === $value[ $i ] ) ) {
				++$i;
			}

			$name = substr( $value, $name_start, $i - $name_start );
			$i = self::skip_whitespace( $value, $i, $length );

			if ( '' === $name || $i >= $length || '(' !== $value[ $i ] ) {
				return null;
			}

			$args_start = $i + 1;
			$depth = 0;

			for ( ; $i < $length; $i++ ) {
				if ( '(' === $value[ $i ] ) {
					++$depth;
				} elseif ( ')' === $value[ $i ] ) {
					--$depth;

					if ( 0 === $depth ) {
						break;
					}
				}
			}

			if ( 0 !== $depth || $i >= $length ) {
				return null;
			}

			$functions[] = [ strtolower( $name ), trim( substr( $value, $args_start, $i - $args_start ) ) ];
			++$i;
		}

		return empty( $functions ) ? null : $functions;
	}

	private static function parse_function( string $name, string $args ): ?array {
		$group = self::FUNCTION_GROUPS[ $name ] ?? null;

		if ( null === $group ) {
			return null;
		}

		$parsed_args = self::DROP_SHADOW === $group
			? self::parse_drop_shadow( $args )
			: self::parse_single_size( $group, $args );

		if ( null === $parsed_args ) {
			return null;
		}

		return Css_Filter_Func_Prop_Type::generate( [
			'func' => String_Prop_Type::generate( $name ),
			'args' => $parsed_args,
		] );
	}

	private static function parse_single_size( string $group, string $args ): ?array {
		$size = Size_Plain_Resolver::parse( $args );

		if ( null === $size ) {
			return null;
		}

		$prop_type = self::GROUP_PROP_TYPES[ $group ];

		return $prop_type::generate( [ 'size' => Size_Prop_Type::generate( $size ) ] );
	}

	private static function parse_drop_shadow( string $args ): ?array {
		$tokens = self::split_top_level( $args );

		if ( empty( $tokens ) ) {
			return null;
		}

		$sizes = [];
		$color = null;

		foreach ( $tokens as $token ) {
			$size = Size_Plain_Resolver::parse( $token );

			if ( null !== $size ) {
				$sizes[] = $size;
				continue;
			}

			if ( null !== $color ) {
				return null;
			}

			$color = $token;
		}

		$size_count = count( $sizes );

		if ( $size_count < self::DROP_SHADOW_MIN_SIZES || $size_count > self::DROP_SHADOW_MAX_SIZES ) {
			return null;
		}

		$blur = $sizes[2] ?? self::DEFAULT_DROP_SHADOW_BLUR;

		return Drop_Shadow_Filter_Prop_Type::generate( [
			'xAxis' => Size_Prop_Type::generate( $sizes[0] ),
			'yAxis' => Size_Prop_Type::generate( $sizes[1] ),
			'blur' => Size_Prop_Type::generate( $blur ),
			'color' => Color_Prop_Type::generate( $color ?? self::DEFAULT_DROP_SHADOW_COLOR ),
		] );
	}

	private static function skip_whitespace( string $value, int $index, int $length ): int {
		while ( $index < $length && ctype_space( $value[ $index ] ) ) {
			++$index;
		}

		return $index;
	}

	/**
	 * Split on whitespace runs at parenthesis depth 0 so function colors such as "rgba(0, 0, 0, .5)"
	 * stay intact as a single token.
	 *
	 * @return string[]
	 */
	private static function split_top_level( string $value ): array {
		$tokens = [];
		$current = '';
		$depth = 0;
		$length = strlen( $value );

		for ( $i = 0; $i < $length; $i++ ) {
			$char = $value[ $i ];

			if ( '(' === $char ) {
				++$depth;
			} elseif ( ')' === $char ) {
				$depth = max( 0, $depth - 1 );
			}

			if ( 0 === $depth && ctype_space( $char ) ) {
				if ( '' !== $current ) {
					$tokens[] = $current;
					$current = '';
				}

				continue;
			}

			$current .= $char;
		}

		if ( '' !== $current ) {
			$tokens[] = $current;
		}

		return $tokens;
	}
}
