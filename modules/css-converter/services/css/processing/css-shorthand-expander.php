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
			default:
				return [ $property => $value ];
		}
	}

	private static function expand_border_shorthand( string $property, $value ): array {
		if ( empty( $value ) || ! is_string( $value ) ) {
			return [];
		}

		$parsed = self::parse_border_shorthand( $value );
		if ( empty( $parsed ) ) {
			return [];
		}

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

		return $expanded;
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
			if ( empty( $part ) ) {
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

	private static function is_border_width_value( string $value ): bool {
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
}
