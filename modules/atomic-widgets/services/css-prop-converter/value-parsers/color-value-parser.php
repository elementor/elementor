<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Color_Value_Parser {

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

	public static function parse( string $value ): ?string {
		$value = trim( $value );

		if ( '' === $value ) {
			return null;
		}

		if ( preg_match( '/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i', $value ) ) {
			return $value;
		}

		if ( preg_match( '/^rgba?\s*\(.+\)$/i', $value ) ) {
			return $value;
		}

		if ( preg_match( '/^hsla?\s*\(.+\)$/i', $value ) ) {
			return $value;
		}

		if ( in_array( strtolower( $value ), self::NAMED_COLORS, true ) ) {
			return $value;
		}

		return null;
	}
}
