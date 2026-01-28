<?php

namespace Elementor\Modules\CssConverter\Services\Css\Processing;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CSS_Shorthand_Expander {

	public static function expand_shorthand_properties( array $css_properties ): array {
		$expanded = [];

		foreach ( $css_properties as $property => $value ) {
			if ( self::is_shorthand_property( $property ) ) {
				$longhand_properties = self::expand_shorthand( $property, $value );
				$expanded = array_merge( $expanded, $longhand_properties );
			} else {
				$expanded[ $property ] = $value;
			}
		}

		return $expanded;
	}

	private static function is_shorthand_property( string $property ): bool {
		$shorthand_properties = [
			'font',
			'border',
			'border-top',
			'border-right',
			'border-bottom',
			'border-left',
			// ✅ NEW: Logical margin properties
			'margin-inline',
			'margin-block',
			// ✅ NEW: Logical positioning properties
			'inset',
			'inset-inline',
			'inset-block',
			// ✅ NEW: Physical positioning properties (need conversion to logical)
			'top',
			'right',
			'bottom',
			'left',
		];

		return in_array( $property, $shorthand_properties, true );
	}

	private static function expand_shorthand( string $property, $value ): array {
		switch ( $property ) {
			case 'font':
				return self::expand_font_shorthand( $value );
			case 'border':
			case 'border-top':
			case 'border-right':
			case 'border-bottom':
			case 'border-left':
				return self::expand_border_shorthand( $property, $value );
			case 'margin-inline':
				return self::expand_margin_inline_shorthand( $value );
			case 'margin-block':
				return self::expand_margin_block_shorthand( $value );
			case 'inset':
				return self::expand_inset_shorthand( $value );
			case 'inset-inline':
				return self::expand_inset_inline_shorthand( $value );
			case 'inset-block':
				return self::expand_inset_block_shorthand( $value );
			case 'top':
				return [ 'inset-block-start' => $value ];
			case 'right':
				return [ 'inset-inline-end' => $value ];
			case 'bottom':
				return [ 'inset-block-end' => $value ];
			case 'left':
				return [ 'inset-inline-start' => $value ];
			default:
				return [ $property => $value ];
		}
	}

	private static function expand_border_shorthand( string $property, $value ): array {
		if ( '' === $value || ! is_string( $value ) ) {
			return [];
		}

		$parsed = self::parse_border_shorthand( $value );
		if ( empty( $parsed ) ) {
			return [];
		}

		// ✅ ATOMIC WIDGETS WORKAROUND
		// For directional borders (border-top, border-right, etc.),
		// we need to convert to full border shorthand because atomic widgets
		// don't support individual border-style/border-color properties
		if ( 'border' !== $property ) {
			// This is border-top, border-right, etc.
			return self::expand_directional_border_to_full_border( $property, $parsed );
		}

		// Regular border shorthand expansion for 'border' property
		$expanded = [];
		$suffix = self::get_border_suffix( $property );

		if ( isset( $parsed['width'] ) ) {
			$width_property = 'border' . $suffix . '-width';
			$expanded[ $width_property ] = $parsed['width'];
		}

		if ( isset( $parsed['style'] ) ) {
			$style_property = 'border' . $suffix . '-style';
			$expanded[ $style_property ] = $parsed['style'];
		}

		if ( isset( $parsed['color'] ) ) {
			$color_property = 'border' . $suffix . '-color';
			$expanded[ $color_property ] = $parsed['color'];
		}

		// 🎯 SPECIAL CASE: border: 0 should explicitly set ALL border properties to null values
		if ( self::is_border_zero_case( $value ) ) {
			// Ensure all three border properties are explicitly set for border: 0
			if ( ! isset( $expanded[ 'border' . $suffix . '-width' ] ) ) {
				$expanded[ 'border' . $suffix . '-width' ] = '0';
			}
			if ( ! isset( $expanded[ 'border' . $suffix . '-style' ] ) ) {
				$expanded[ 'border' . $suffix . '-style' ] = 'none';
			}
			if ( ! isset( $expanded[ 'border' . $suffix . '-color' ] ) ) {
				$expanded[ 'border' . $suffix . '-color' ] = 'transparent';
			}
		}

		return $expanded;
	}

	private static function expand_directional_border_to_full_border( string $property, array $parsed ): array {
		// Convert directional border (border-top: 5px solid blue) to full border properties
		// that work with atomic widgets limitations:
		// - border-width: 5px 0 0 0 (directional, supported by Border_Width_Prop_Type)
		// - border-style: solid (shorthand, supported by String_Prop_Type)
		// - border-color: blue (shorthand, supported by Color_Prop_Type)

		$expanded = [];

		if ( isset( $parsed['width'] ) ) {
			$directional_width = self::create_directional_border_width( $property, $parsed['width'] );
			$expanded['border-width'] = $directional_width;
		}

		if ( isset( $parsed['style'] ) ) {
			$expanded['border-style'] = $parsed['style']; // Use shorthand (supported)
		}

		if ( isset( $parsed['color'] ) ) {
			$expanded['border-color'] = $parsed['color']; // Use shorthand (supported)
		}

		return $expanded;
	}

	private static function create_directional_border_width( string $property, string $width ): string {
		// Convert directional border to 4-value border-width shorthand
		// border-top: 5px → border-width: 5px 0 0 0
		// border-right: 5px → border-width: 0 5px 0 0
		// border-bottom: 5px → border-width: 0 0 5px 0
		// border-left: 5px → border-width: 0 0 0 5px

		switch ( $property ) {
			case 'border-top':
				return "$width 0 0 0";
			case 'border-right':
				return "0 $width 0 0";
			case 'border-bottom':
				return "0 0 $width 0";
			case 'border-left':
				return "0 0 0 $width";
			default:
				return $width;
		}
	}

	private static function get_border_suffix( string $property ): string {
		switch ( $property ) {
			case 'border-top':
				return '-top';
			case 'border-right':
				return '-right';
			case 'border-bottom':
				return '-bottom';
			case 'border-left':
				return '-left';
			case 'border':
			default:
				return '';
		}
	}

	private static function parse_border_shorthand( string $value ): array {
		$value = trim( $value );
		$parts = preg_split( '/\s+/', $value );

		if ( empty( $parts ) ) {
			return [];
		}

		$result = [];

		foreach ( $parts as $part ) {
			$part = trim( $part );
			if ( '' === $part ) {
				continue;
			}

			if ( self::is_border_width_value( $part ) ) {
				$result['width'] = $part;
			} elseif ( self::is_border_style_value( $part ) ) {
				$result['style'] = $part;
			} elseif ( self::is_color_value( $part ) ) {
				$result['color'] = $part;
			}
		}

		return $result;
	}

	private static function is_border_zero_case( string $value ): bool {
		// Check if this is a "border: 0" case (unitless zero only)
		$value = trim( $value );
		return '0' === $value;
	}

	private static function is_border_width_value( string $value ): bool {
		// CSS allows unitless zero
		if ( '0' === $value ) {
			return true;
		}

		if ( preg_match( '/^(\d*\.?\d+)(px|em|rem|%|vh|vw)$/i', $value ) ) {
			return true;
		}

		$keywords = [ 'thin', 'medium', 'thick' ];
		return in_array( strtolower( $value ), $keywords, true );
	}

	private static function is_border_style_value( string $value ): bool {
		$styles = [
			'none',
			'hidden',
			'dotted',
			'dashed',
			'solid',
			'double',
			'groove',
			'ridge',
			'inset',
			'outset',
		];
		return in_array( strtolower( $value ), $styles, true );
	}

	private static function is_color_value( string $value ): bool {
		if ( preg_match( '/^#([0-9a-f]{3}|[0-9a-f]{6})$/i', $value ) ) {
			return true;
		}

		if ( preg_match( '/^rgba?\(/i', $value ) ) {
			return true;
		}

		$named_colors = [
			'black',
			'white',
			'red',
			'green',
			'blue',
			'yellow',
			'cyan',
			'magenta',
			'gray',
			'grey',
			'orange',
			'purple',
			'pink',
			'brown',
			'transparent',
		];
		return in_array( strtolower( $value ), $named_colors, true );
	}

	/**
	 * Expand margin-inline shorthand to logical properties
	 * margin-inline: 10px 30px -> margin-inline-start: 10px, margin-inline-end: 30px
	 */
	private static function expand_margin_inline_shorthand( $value ): array {
		// ✅ CRITICAL FIX: Don't use empty() as it treats '0' as empty!
		if ( ! is_string( $value ) || '' === trim( $value ) ) {
			return [];
		}

		$parts = preg_split( '/\s+/', trim( $value ) );
		// ✅ CRITICAL FIX: Don't use array_filter() as it removes '0' values!
		$parts = array_filter( $parts, function( $part ) {
			return '' !== trim( $part );
		} );
		$parts = array_values( $parts );
		$count = count( $parts );

		if ( $count < 1 || $count > 2 ) {
			return [];
		}

		$start_value = $parts[0];
		$end_value = $count > 1 ? $parts[1] : $start_value;

		return [
			'margin-inline-start' => $start_value,
			'margin-inline-end' => $end_value,
		];
	}

	/**
	 * Expand margin-block shorthand to logical properties
	 * margin-block: 10px 30px -> margin-block-start: 10px, margin-block-end: 30px
	 */
	private static function expand_margin_block_shorthand( $value ): array {
		// ✅ CRITICAL FIX: Don't use empty() as it treats '0' as empty!
		if ( ! is_string( $value ) || '' === trim( $value ) ) {
			return [];
		}

		$parts = preg_split( '/\s+/', trim( $value ) );
		// ✅ CRITICAL FIX: Don't use array_filter() as it removes '0' values!
		$parts = array_filter( $parts, function( $part ) {
			return '' !== trim( $part );
		} );
		$parts = array_values( $parts );
		$count = count( $parts );

		if ( $count < 1 || $count > 2 ) {
			return [];
		}

		$start_value = $parts[0];
		$end_value = $count > 1 ? $parts[1] : $start_value;

		return [
			'margin-block-start' => $start_value,
			'margin-block-end' => $end_value,
		];
	}

	/**
	 * Expand inset-inline shorthand to logical properties
	 * inset-inline: 10px 30px -> inset-inline-start: 10px, inset-inline-end: 30px
	 */
	private static function expand_inset_inline_shorthand( $value ): array {
		// ✅ CRITICAL FIX: Don't use empty() as it treats '0' as empty!
		if ( ! is_string( $value ) || '' === trim( $value ) ) {
			return [];
		}

		$parts = preg_split( '/\s+/', trim( $value ) );
		// ✅ CRITICAL FIX: Don't use array_filter() as it removes '0' values!
		$parts = array_filter( $parts, function( $part ) {
			return '' !== trim( $part );
		} );
		$parts = array_values( $parts );
		$count = count( $parts );

		if ( $count < 1 || $count > 2 ) {
			return [];
		}

		$start_value = $parts[0];
		$end_value = $count > 1 ? $parts[1] : $start_value;

		return [
			'inset-inline-start' => $start_value,
			'inset-inline-end' => $end_value,
		];
	}

	/**
	 * Expand inset shorthand to all 4 logical properties
	 * inset: 20px -> all 4 sides: 20px
	 * inset: 10px 20px -> block: 10px, inline: 20px
	 * inset: 10px 20px 30px -> block-start: 10px, inline: 20px, block-end: 30px
	 * inset: 10px 20px 30px 40px -> block-start: 10px, inline-end: 20px, block-end: 30px, inline-start: 40px
	 */
	private static function expand_inset_shorthand( $value ): array {
		// ✅ CRITICAL FIX: Don't use empty() as it treats '0' as empty!
		if ( ! is_string( $value ) || '' === trim( $value ) ) {
			return [];
		}

		$parts = preg_split( '/\s+/', trim( $value ) );
		// ✅ CRITICAL FIX: Don't use array_filter() as it removes '0' values!
		// Filter out only truly empty strings, not '0'
		$parts = array_filter( $parts, function( $part ) {
			return '' !== trim( $part );
		} );
		$parts = array_values( $parts ); // Re-index array
		$count = count( $parts );

		if ( $count < 1 || $count > 4 ) {
			return [];
		}

		switch ( $count ) {
			case 1:
				// All 4 sides same
				$all_value = $parts[0];
				return [
					'inset-block-start' => $all_value,
					'inset-inline-end' => $all_value,
					'inset-block-end' => $all_value,
					'inset-inline-start' => $all_value,
				];

			case 2:
				// Vertical (block) and horizontal (inline)
				$block_value = $parts[0];
				$inline_value = $parts[1];
				return [
					'inset-block-start' => $block_value,
					'inset-inline-end' => $inline_value,
					'inset-block-end' => $block_value,
					'inset-inline-start' => $inline_value,
				];

			case 3:
				// Top, horizontal, bottom
				$block_start = $parts[0];
				$inline_value = $parts[1];
				$block_end = $parts[2];
				return [
					'inset-block-start' => $block_start,
					'inset-inline-end' => $inline_value,
					'inset-block-end' => $block_end,
					'inset-inline-start' => $inline_value,
				];

			case 4:
				// All 4 sides: top, right, bottom, left
				return [
					'inset-block-start' => $parts[0],
					'inset-inline-end' => $parts[1],
					'inset-block-end' => $parts[2],
					'inset-inline-start' => $parts[3],
				];

			default:
				return [];
		}
	}

	/**
	 * Expand inset-block shorthand to logical properties
	 * inset-block: 10px 30px -> inset-block-start: 10px, inset-block-end: 30px
	 */
	private static function expand_inset_block_shorthand( $value ): array {
		// ✅ CRITICAL FIX: Don't use empty() as it treats '0' as empty!
		if ( ! is_string( $value ) || '' === trim( $value ) ) {
			return [];
		}

		$parts = preg_split( '/\s+/', trim( $value ) );
		// ✅ CRITICAL FIX: Don't use array_filter() as it removes '0' values!
		$parts = array_filter( $parts, function( $part ) {
			return '' !== trim( $part );
		} );
		$parts = array_values( $parts );
		$count = count( $parts );

		if ( $count < 1 || $count > 2 ) {
			return [];
		}

		$start_value = $parts[0];
		$end_value = $count > 1 ? $parts[1] : $start_value;

		return [
			'inset-block-start' => $start_value,
			'inset-block-end' => $end_value,
		];
	}

	private static function expand_font_shorthand( $value ): array {
		if ( ! is_string( $value ) || '' === trim( $value ) ) {
			return [];
		}

		$value = trim( $value );
		$expanded = [];

		// Font shorthand syntax: [font-style] [font-variant] [font-weight] [font-stretch] font-size[/line-height] font-family
		// Example: italic bold 18px/1.6 "Times New Roman", serif

		// Split by spaces, but preserve quoted strings
		$parts = self::parse_font_shorthand_parts( $value );

		if ( empty( $parts ) ) {
			return [];
		}

		$font_size_index = self::find_font_size_index( $parts );

		if ( false === $font_size_index ) {
			// No valid font-size found, return empty (font-size is required)
			return [];
		}

		// Extract font-size and optional line-height
		$font_size_part = $parts[ $font_size_index ];
		if ( false !== strpos( $font_size_part, '/' ) ) {
			// Contains line-height: 18px/1.6
			$size_parts = explode( '/', $font_size_part, 2 );
			$expanded['font-size'] = trim( $size_parts[0] );
			$expanded['line-height'] = trim( $size_parts[1] );
		} else {
			$expanded['font-size'] = $font_size_part;
		}

		// Process parts before font-size (font-style, font-variant, font-weight, font-stretch)
		for ( $i = 0; $i < $font_size_index; $i++ ) {
			$part = $parts[ $i ];

			if ( self::is_font_style_value( $part ) ) {
				$expanded['font-style'] = $part;
			} elseif ( self::is_font_weight_value( $part ) ) {
				$expanded['font-weight'] = $part;
			}
			// Note: font-variant and font-stretch are less common, skipping for now
		}

		// font-family comes after font-size, but we EXCLUDE it (that's the whole point)
		// The font-family filtering will happen elsewhere in the pipeline

		return $expanded;
	}

	private static function parse_font_shorthand_parts( string $value ): array {
		$parts = [];
		$current = '';
		$in_quotes = false;
		$quote_char = '';

		$value_length = strlen( $value );
		for ( $i = 0; $i < $value_length; $i++ ) {
			$char = $value[ $i ];

			if ( ! $in_quotes && ( '"' === $char || "'" === $char ) ) {
				$in_quotes = true;
				$quote_char = $char;
				$current .= $char;
			} elseif ( $in_quotes && $char === $quote_char ) {
				$in_quotes = false;
				$quote_char = '';
				$current .= $char;
			} elseif ( ! $in_quotes && ' ' === $char ) {
				if ( '' !== trim( $current ) ) {
					$parts[] = trim( $current );
					$current = '';
				}
			} else {
				$current .= $char;
			}
		}

		if ( '' !== trim( $current ) ) {
			$parts[] = trim( $current );
		}

		return $parts;
	}

	private static function find_font_size_index( array $parts ): int {
		// Font-size is required and comes after optional style/weight properties
		// Look for a part that looks like a size (has px, em, rem, %, etc. or is a number)
		$parts_count = count( $parts );
		for ( $i = 0; $i < $parts_count; $i++ ) {
			$part = $parts[ $i ];

			// Skip quoted strings (these are likely font-family)
			if ( ( 0 === strpos( $part, '"' ) && strlen( $part ) > 1 && '"' === substr( $part, -1 ) ) ||
				( 0 === strpos( $part, "'" ) && strlen( $part ) > 1 && "'" === substr( $part, -1 ) ) ) {
				continue;
			}

			// Check if this looks like a font-size
			if ( self::is_font_size_value( $part ) ) {
				return $i;
			}
		}

		return false;
	}

	private static function is_font_size_value( string $value ): bool {
		// Remove line-height part if present (18px/1.6 -> 18px)
		$size_part = explode( '/', $value )[0];

		// Check for size units
		if ( preg_match( '/^(\d*\.?\d+)(px|em|rem|%|pt|pc|in|cm|mm|ex|ch|vw|vh|vmin|vmax)$/i', $size_part ) ) {
			return true;
		}

		// Check for keyword sizes
		$size_keywords = [ 'xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large', 'smaller', 'larger' ];
		return in_array( strtolower( $size_part ), $size_keywords, true );
	}

	private static function is_font_style_value( string $value ): bool {
		$styles = [ 'normal', 'italic', 'oblique' ];
		return in_array( strtolower( $value ), $styles, true );
	}

	private static function is_font_weight_value( string $value ): bool {
		// Numeric weights
		if ( is_numeric( $value ) ) {
			$num = (int) $value;
			return $num >= 100 && $num <= 900 && 0 === $num % 100;
		}

		// Keyword weights
		$weights = [ 'normal', 'bold', 'bolder', 'lighter' ];
		return in_array( strtolower( $value ), $weights, true );
	}
}
