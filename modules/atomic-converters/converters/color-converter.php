<?php

namespace Elementor\Modules\AtomicConverters\Converters;

use Elementor\Modules\AtomicConverters\Property_Converter_Interface;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Color_Converter implements Property_Converter_Interface {
	private const SUPPORTED_PROPERTIES = [ 'color' ];

	public function supports( string $property, $value = null ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function convert( string $property, $value ): ?array {
		if ( ! $this->supports( $property ) ) {
			return null;
		}

		if ( ! is_string( $value ) || empty( trim( $value ) ) ) {
			return null;
		}

		$normalized = $this->normalize_color_value( $value );
		if ( null === $normalized ) {
			return null;
		}

		return Color_Prop_Type::generate( $normalized );
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	private function normalize_color_value( string $value ): ?string {
		$value = trim( $value );

		if ( empty( $value ) ) {
			return null;
		}

		if ( 'none' === $value ) {
			return null;
		}

		if ( 'transparent' === $value ) {
			return 'rgba(0,0,0,0)';
		}

		if ( $this->is_valid_color_format( $value ) ) {
			return $value;
		}

		return null;
	}

	private function is_valid_color_format( string $value ): bool {
		if ( $this->is_css_variable( $value ) ) {
			return false;
		}

		if ( str_starts_with( $value, '#' ) && ( strlen( $value ) === 4 || strlen( $value ) === 7 ) ) {
			return ctype_xdigit( substr( $value, 1 ) );
		}

		if ( str_starts_with( $value, 'rgb' ) || str_starts_with( $value, 'hsl' ) ) {
			return true;
		}

		return in_array( strtolower( $value ), $this->get_named_colors(), true );
	}

	private function is_css_variable( string $value ): bool {
		return str_starts_with( $value, 'var(' );
	}

	private function get_named_colors(): array {
		return [
			'aliceblue',
			'antiquewhite',
			'aqua',
			'aquamarine',
			'azure',
			'beige',
			'bisque',
			'black',
			'blanchedalmond',
			'blue',
			'blueviolet',
			'brown',
			'burlywood',
			'cadetblue',
			'chartreuse',
			'chocolate',
			'coral',
			'cornflowerblue',
			'cornsilk',
			'crimson',
			'currentcolor',
			'cyan',
			'darkblue',
			'darkcyan',
			'darkgoldenrod',
			'darkgray',
			'darkgreen',
			'darkgrey',
			'darkkhaki',
			'darkmagenta',
			'darkolivegreen',
			'darkorange',
			'darkorchid',
			'darkred',
			'darksalmon',
			'darkseagreen',
			'darkslateblue',
			'darkslategray',
			'darkslategrey',
			'darkturquoise',
			'darkviolet',
			'deeppink',
			'deepskyblue',
			'dimgray',
			'dimgrey',
			'dodgerblue',
			'firebrick',
			'floralwhite',
			'forestgreen',
			'fuchsia',
			'gainsboro',
			'ghostwhite',
			'gold',
			'goldenrod',
			'gray',
			'green',
			'greenyellow',
			'grey',
			'honeydew',
			'hotpink',
			'indianred',
			'indigo',
			'inherit',
			'initial',
			'ivory',
			'khaki',
			'lavender',
			'lavenderblush',
			'lawngreen',
			'lemonchiffon',
			'lightblue',
			'lightcoral',
			'lightcyan',
			'lightgoldenrodyellow',
			'lightgray',
			'lightgreen',
			'lightgrey',
			'lightpink',
			'lightsalmon',
			'lightseagreen',
			'lightskyblue',
			'lightslategray',
			'lightslategrey',
			'lightsteelblue',
			'lightyellow',
			'lime',
			'limegreen',
			'linen',
			'magenta',
			'maroon',
			'mediumaquamarine',
			'mediumblue',
			'mediumorchid',
			'mediumpurple',
			'mediumseagreen',
			'mediumslateblue',
			'mediumspringgreen',
			'mediumturquoise',
			'mediumvioletred',
			'midnightblue',
			'mintcream',
			'mistyrose',
			'moccasin',
			'navajowhite',
			'navy',
			'oldlace',
			'olive',
			'olivedrab',
			'orange',
			'orangered',
			'orchid',
			'palegoldenrod',
			'palegreen',
			'paleturquoise',
			'palevioletred',
			'papayawhip',
			'peachpuff',
			'peru',
			'pink',
			'plum',
			'powderblue',
			'purple',
			'rebeccapurple',
			'red',
			'rosybrown',
			'royalblue',
			'saddlebrown',
			'salmon',
			'sandybrown',
			'seagreen',
			'seashell',
			'sienna',
			'silver',
			'skyblue',
			'slateblue',
			'slategray',
			'slategrey',
			'snow',
			'springgreen',
			'steelblue',
			'tan',
			'teal',
			'thistle',
			'tomato',
			'transparent',
			'turquoise',
			'unset',
			'violet',
			'wheat',
			'white',
			'whitesmoke',
			'yellow',
			'yellowgreen',
		];
	}
}

