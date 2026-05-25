<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter;

use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Prop_Converter {

	private const COLOR_PROPERTIES = [
		'color',
		'border-color',
		'outline-color',
	];

	private const SIZE_PROPERTIES = [
		'width',
		'height',
		'min-width',
		'min-height',
		'max-width',
		'max-height',
		'font-size',
		'letter-spacing',
		'word-spacing',
		'line-height',
		'column-gap',
		'row-gap',
		'gap',
		'inset-block-start',
		'inset-inline-end',
		'inset-block-end',
		'inset-inline-start',
		'outline-width',
		'outline-offset',
		'opacity',
	];

	private const NAMED_COLORS = [
		'black', 'silver', 'gray', 'white', 'maroon', 'red', 'purple', 'fuchsia',
		'green', 'lime', 'olive', 'yellow', 'navy', 'blue', 'teal', 'aqua',
		'orange', 'aliceblue', 'antiquewhite', 'aquamarine', 'azure', 'beige',
		'bisque', 'blanchedalmond', 'blueviolet', 'brown', 'burlywood', 'cadetblue',
		'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson',
		'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen',
		'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange',
		'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue',
		'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink',
		'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite',
		'forestgreen', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'greenyellow',
		'grey', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki',
		'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue',
		'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen',
		'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue',
		'lightslategray', 'lightslategrey', 'lightsteelblue', 'lightyellow',
		'limegreen', 'linen', 'magenta', 'mediumaquamarine', 'mediumblue',
		'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue',
		'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue',
		'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'oldlace', 'olivedrab',
		'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise',
		'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum',
		'powderblue', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown',
		'seagreen', 'seashell', 'sienna', 'skyblue', 'slateblue', 'slategray',
		'slategrey', 'snow', 'springgreen', 'steelblue', 'tan', 'thistle', 'tomato',
		'turquoise', 'violet', 'wheat', 'whitesmoke', 'yellowgreen', 'transparent',
		'currentcolor',
	];

	public static function make(): self {
		return new self();
	}

	public function convert( string $css ): Conversion_Result {
		$declarations = Declaration_Classifier::make()->split( $css );

		$props = [];
		$unconverted_decls = [];
		$unconverted_meta = [];

		foreach ( $declarations as $declaration ) {
			$property = $declaration['property'];
			$value = $declaration['value'];

			$converted = $this->convert_declaration( $property, $value );

			if ( null !== $converted ) {
				$props[ $property ] = $converted;
				continue;
			}

			$unconverted_decls[] = $property . ': ' . $value . ';';
			$unconverted_meta[] = [
				'declaration' => $property . ': ' . $value,
				'hint' => $this->get_hint( $property ),
			];
		}

		$custom_css = empty( $unconverted_decls )
			? ''
			: Utils::encode_string( implode( "\n", $unconverted_decls ) );

		return Conversion_Result::make( $props, $custom_css, $unconverted_meta );
	}

	private function convert_declaration( string $property, string $value ): ?array {
		if ( in_array( $property, self::COLOR_PROPERTIES, true ) ) {
			return $this->convert_color( $value );
		}

		if ( in_array( $property, self::SIZE_PROPERTIES, true ) ) {
			return $this->convert_size( $value );
		}

		return null;
	}

	private function convert_color( string $value ): ?array {
		$value = trim( $value );

		if ( '' === $value ) {
			return null;
		}

		if ( ! $this->is_color_value( $value ) ) {
			return null;
		}

		return Color_Prop_Type::generate( $value );
	}

	private function is_color_value( string $value ): bool {
		$lower = strtolower( $value );

		if ( preg_match( '/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i', $value ) ) {
			return true;
		}

		if ( preg_match( '/^rgba?\s*\(.+\)$/i', $value ) ) {
			return true;
		}

		if ( preg_match( '/^hsla?\s*\(.+\)$/i', $value ) ) {
			return true;
		}

		if ( in_array( $lower, self::NAMED_COLORS, true ) ) {
			return true;
		}

		return false;
	}

	private function convert_size( string $value ): ?array {
		$value = trim( $value );

		if ( '' === $value ) {
			return null;
		}

		$lower = strtolower( $value );

		if ( Size_Constants::UNIT_AUTO === $lower ) {
			return Size_Prop_Type::generate( [
				'size' => '',
				'unit' => Size_Constants::UNIT_AUTO,
			] );
		}

		if ( $this->is_custom_size_function( $lower ) ) {
			return Size_Prop_Type::generate( [
				'size' => $value,
				'unit' => Size_Constants::UNIT_CUSTOM,
			] );
		}

		if ( preg_match( '/^(-?\d+(?:\.\d+)?)\s*([a-z%]+)?$/i', $value, $matches ) ) {
			$number = $matches[1];
			$unit = isset( $matches[2] ) && '' !== $matches[2] ? strtolower( $matches[2] ) : Size_Constants::UNIT_PX;

			if ( ! in_array( $unit, Size_Constants::all_supported_units(), true ) ) {
				return null;
			}

			$size = strpos( $number, '.' ) !== false ? (float) $number : (int) $number;

			return Size_Prop_Type::generate( [
				'size' => $size,
				'unit' => $unit,
			] );
		}

		return null;
	}

	private function is_custom_size_function( string $lower ): bool {
		foreach ( [ 'calc(', 'clamp(', 'min(', 'max(', 'var(' ] as $prefix ) {
			if ( 0 === strpos( $lower, $prefix ) ) {
				return true;
			}
		}

		return false;
	}

	private function get_hint( string $property ): string {
		if ( in_array( $property, self::COLOR_PROPERTIES, true ) ) {
			return 'Value is not a recognized color literal; rendered via custom_css.';
		}

		if ( in_array( $property, self::SIZE_PROPERTIES, true ) ) {
			return 'Value could not be parsed as a size; rendered via custom_css.';
		}

		return 'Property is not in the typed-prop allowlist; rendered via custom_css.';
	}
}
