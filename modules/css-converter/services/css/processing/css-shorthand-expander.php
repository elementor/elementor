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
			'border',
			'border-top',
			'border-right',
			'border-bottom',
			'border-left',
			// ✅ NEW: Logical margin properties
			'margin-inline',
			'margin-block',
			// ✅ NEW: Logical positioning properties
			'inset-inline',
			'inset-block',
		];

		return in_array( $property, $shorthand_properties, true );
	}

	private static function expand_shorthand( string $property, $value ): array {
		switch ( $property ) {
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
			case 'inset-inline':
				return self::expand_inset_inline_shorthand( $value );
			case 'inset-block':
				return self::expand_inset_block_shorthand( $value );
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
			'none', 'hidden', 'dotted', 'dashed', 'solid', 
			'double', 'groove', 'ridge', 'inset', 'outset' 
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
			'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
			'gray', 'grey', 'orange', 'purple', 'pink', 'brown', 'transparent'
		];
		return in_array( strtolower( $value ), $named_colors, true );
	}

	/**
	 * Expand margin-inline shorthand to logical properties
	 * margin-inline: 10px 30px -> margin-inline-start: 10px, margin-inline-end: 30px
	 */
	private static function expand_margin_inline_shorthand( $value ): array {
		if ( empty( $value ) || ! is_string( $value ) ) {
			return [];
		}

		$parts = preg_split( '/\s+/', trim( $value ) );
		$parts = array_filter( $parts );
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
		if ( empty( $value ) || ! is_string( $value ) ) {
			return [];
		}

		$parts = preg_split( '/\s+/', trim( $value ) );
		$parts = array_filter( $parts );
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
		if ( empty( $value ) || ! is_string( $value ) ) {
			return [];
		}

		$parts = preg_split( '/\s+/', trim( $value ) );
		$parts = array_filter( $parts );
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
	 * Expand inset-block shorthand to logical properties
	 * inset-block: 10px 30px -> inset-block-start: 10px, inset-block-end: 30px
	 */
	private static function expand_inset_block_shorthand( $value ): array {
		if ( empty( $value ) || ! is_string( $value ) ) {
			return [];
		}

		$parts = preg_split( '/\s+/', trim( $value ) );
		$parts = array_filter( $parts );
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
}
