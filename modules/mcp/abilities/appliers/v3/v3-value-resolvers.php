<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Pure functions that turn CSS values into legacy V3 control value shapes.
 */
class V3_Value_Resolvers {

	const DEFAULT_UNIT = 'px';

	/**
	 * @return array{unit: string, size: float}|null
	 */
	public static function resolve_dimension( string $css_value ): ?array {
		$parsed = self::parse_length( trim( $css_value ) );

		if ( null === $parsed ) {
			return null;
		}

		return [
			'unit' => $parsed['unit'],
			'size' => $parsed['size'],
		];
	}

	/**
	 * Parses padding/margin/border-radius shorthand into Elementor dimensions shape.
	 *
	 * @return array{top: string, right: string, bottom: string, left: string, unit: string, isLinked: bool}|null
	 */
	public static function resolve_sides_shorthand( string $css_value ): ?array {
		$tokens = self::tokenize_css_values( trim( $css_value ) );

		if ( empty( $tokens ) || count( $tokens ) > 4 ) {
			return null;
		}

		$parsed = [];
		foreach ( $tokens as $token ) {
			$length = self::parse_length( $token );
			if ( null === $length ) {
				return null;
			}
			$parsed[] = $length;
		}

		$unit = $parsed[0]['unit'];
		foreach ( $parsed as $item ) {
			if ( $item['unit'] !== $unit ) {
				return null;
			}
		}

		$sizes = array_column( $parsed, 'size' );
		$count = count( $sizes );

		if ( 1 === $count ) {
			$top = $right = $bottom = $left = $sizes[0];
		} elseif ( 2 === $count ) {
			$top = $bottom = $sizes[0];
			$right = $left = $sizes[1];
		} elseif ( 3 === $count ) {
			$top = $sizes[0];
			$right = $left = $sizes[1];
			$bottom = $sizes[2];
		} else {
			[ $top, $right, $bottom, $left ] = $sizes;
		}

		$linked = $top === $right && $right === $bottom && $bottom === $left;

		return [
			'top' => (string) $top,
			'right' => (string) $right,
			'bottom' => (string) $bottom,
			'left' => (string) $left,
			'unit' => $unit,
			'isLinked' => $linked,
		];
	}

	public static function resolve_color( string $css_value ): string {
		return trim( $css_value );
	}

	/**
	 * Parses a single box-shadow declaration into Elementor's box_shadow control shape.
	 *
	 * @return array{box_shadow_type: string, box_shadow: array}|null
	 */
	public static function resolve_box_shadow( string $css_value ): ?array {
		$value = trim( $css_value );

		if ( '' === $value || 'none' === strtolower( $value ) ) {
			return [
				'box_shadow_type' => '',
				'box_shadow' => [
					'horizontal' => 0,
					'vertical' => 0,
					'blur' => 0,
					'spread' => 0,
					'color' => 'rgba(0,0,0,0.5)',
				],
			];
		}

		$position = 'outline';
		if ( preg_match( '/\binset\b/i', $value ) ) {
			$position = 'inset';
			$value = trim( preg_replace( '/\binset\b/i', '', $value ) );
		}

		$color = null;
		if ( preg_match( '/^(rgba?\([^)]+\)|hsla?\([^)]+\)|#[0-9a-fA-F]{3,8}|[a-zA-Z]+)\s+(.+)$/', $value, $matches ) ) {
			$color = $matches[1];
			$value = trim( $matches[2] );
		} elseif ( preg_match( '/^(.+?)\s+(rgba?\([^)]+\)|hsla?\([^)]+\)|#[0-9a-fA-F]{3,8}|[a-zA-Z]+)$/', $value, $matches ) ) {
			$value = trim( $matches[1] );
			$color = $matches[2];
		}

		$lengths = self::tokenize_css_values( $value );
		if ( count( $lengths ) < 2 || count( $lengths ) > 4 ) {
			return null;
		}

		$parsed_lengths = [];
		foreach ( $lengths as $token ) {
			$length = self::parse_length( $token );
			if ( null === $length ) {
				return null;
			}
			$parsed_lengths[] = $length['size'];
		}

		return [
			'box_shadow_type' => 'yes',
			'box_shadow' => [
				'horizontal' => $parsed_lengths[0],
				'vertical' => $parsed_lengths[1],
				'blur' => $parsed_lengths[2] ?? 0,
				'spread' => $parsed_lengths[3] ?? 0,
				'color' => $color ?? 'rgba(0,0,0,0.5)',
				'position' => $position,
			],
		];
	}

	/**
	 * Spreads typography-related CSS properties into legacy typography_* keys and
	 * forces the group toggle to `custom`.
	 *
	 * @param array<string, string> $declarations property => css value
	 * @param string                $prefix       Control group prefix, e.g. `typography` or `menu_typography`.
	 * @return array<string, mixed>
	 */
	public static function resolve_typography_group( array $declarations, string $prefix = 'typography' ): array {
		$patch = [
			$prefix . '_typography' => 'custom',
		];

		$map = [
			'font-family' => $prefix . '_font_family',
			'font-weight' => $prefix . '_font_weight',
			'text-transform' => $prefix . '_text_transform',
			'font-style' => $prefix . '_font_style',
			'text-decoration' => $prefix . '_text_decoration',
			'line-height' => $prefix . '_line_height',
			'letter-spacing' => $prefix . '_letter_spacing',
			'word-spacing' => $prefix . '_word_spacing',
			'font-size' => $prefix . '_font_size',
		];

		foreach ( $declarations as $property => $value ) {
			$key = $map[ $property ] ?? null;
			if ( null === $key ) {
				continue;
			}

			if ( in_array( $property, [ 'font-size', 'line-height', 'letter-spacing', 'word-spacing' ], true ) ) {
				$dimension = self::resolve_dimension( $value );
				if ( null !== $dimension ) {
					$patch[ $key ] = $dimension;
				}
				continue;
			}

			$patch[ $key ] = trim( $value );
		}

		return $patch;
	}

	/**
	 * Parses `border: WIDTH STYLE COLOR` into Elementor border group keys.
	 *
	 * @param string $css_value
	 * @param string $prefix    e.g. `border` or `image_border` or `dropdown_border`.
	 * @return array<string, mixed>|null
	 */
	public static function resolve_border_shorthand( string $css_value, string $prefix = 'border' ): ?array {
		$value = trim( $css_value );

		if ( '' === $value || 'none' === strtolower( $value ) ) {
			return [
				$prefix . '_border' => '',
			];
		}

		$style = null;
		$styles = [ 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset', 'none', 'hidden' ];
		foreach ( $styles as $candidate ) {
			if ( preg_match( '/\b' . preg_quote( $candidate, '/' ) . '\b/i', $value ) ) {
				$style = strtolower( $candidate );
				$value = trim( preg_replace( '/\b' . preg_quote( $candidate, '/' ) . '\b/i', '', $value ) );
				break;
			}
		}

		$color = null;
		if ( preg_match( '/(rgba?\([^)]+\)|hsla?\([^)]+\)|#[0-9a-fA-F]{3,8}|[a-zA-Z]+)$/', $value, $matches ) ) {
			$color = $matches[1];
			$value = trim( substr( $value, 0, -strlen( $color ) ) );
		}

		$width = null;
		$tokens = self::tokenize_css_values( $value );
		if ( ! empty( $tokens ) ) {
			$width = self::resolve_sides_shorthand( implode( ' ', $tokens ) );
		}

		$patch = [
			$prefix . '_border' => $style ?? 'solid',
		];

		if ( null !== $width ) {
			$patch[ $prefix . '_width' ] = $width;
		}

		if ( null !== $color ) {
			$patch[ $prefix . '_color' ] = $color;
		}

		return $patch;
	}

	/**
	 * Dispatches a named resolver against a CSS value.
	 *
	 * @param string               $resolver_name One of: color, dimension, sides, box_shadow, border, text, slider.
	 * @param string               $css_value
	 * @param array<string, mixed> $args          Extra args (prefix for border/typography).
	 * @return mixed|null
	 */
	public static function resolve( string $resolver_name, string $css_value, array $args = [] ) {
		switch ( $resolver_name ) {
			case 'color':
				return self::resolve_color( $css_value );
			case 'dimension':
				return self::resolve_dimension( $css_value );
			case 'sides':
				return self::resolve_sides_shorthand( $css_value );
			case 'box_shadow':
				return self::resolve_box_shadow( $css_value );
			case 'border':
				return self::resolve_border_shorthand( $css_value, $args['prefix'] ?? 'border' );
			case 'slider':
				$dimension = self::resolve_dimension( $css_value );
				return null === $dimension ? null : $dimension;
			case 'text':
				return trim( $css_value );
			default:
				return null;
		}
	}

	/**
	 * @return array{size: float, unit: string}|null
	 */
	private static function parse_length( string $token ): ?array {
		$token = trim( $token );

		if ( '' === $token ) {
			return null;
		}

		if ( '0' === $token ) {
			return [
				'size' => 0.0,
				'unit' => self::DEFAULT_UNIT,
			];
		}

		if ( ! preg_match( '/^(-?\d*\.?\d+)(px|em|rem|%|vh|vw|vmin|vmax)?$/i', $token, $matches ) ) {
			return null;
		}

		return [
			'size' => (float) $matches[1],
			'unit' => strtolower( $matches[2] ?? self::DEFAULT_UNIT ),
		];
	}

	/**
	 * @return string[]
	 */
	private static function tokenize_css_values( string $value ): array {
		if ( '' === $value ) {
			return [];
		}

		preg_match_all( '/(?:rgba?\([^)]+\)|hsla?\([^)]+\)|[^\s]+)/', $value, $matches );

		return $matches[0] ?? [];
	}
}
