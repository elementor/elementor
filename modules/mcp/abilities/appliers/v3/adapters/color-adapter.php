<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters;

use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Color_Adapter implements V3_Control_Adapter {

	const CONTROL_TYPE = 'color';

	const MAX_LENGTH = 120;

	const HEX_PATTERN = '/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i';

	const FUNCTION_PATTERN = '/^(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|var)\(\s*[-\w\s.,%\/#()+*]*\)$/i';

	const KEYWORDS = [ 'transparent', 'currentcolor', 'inherit', 'initial', 'unset' ];

	const NAMED_COLORS = 'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood '
		. 'cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod '
		. 'darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon '
		. 'darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray '
		. 'dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green '
		. 'greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon '
		. 'lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon '
		. 'lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen '
		. 'magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue '
		. 'mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy '
		. 'oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip '
		. 'peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown '
		. 'seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal '
		. 'thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen';

	public function supports( string $prop_type, string $control_type, bool $has_sides ): bool {
		return Color_Prop_Type::get_key() === $prop_type && self::CONTROL_TYPE === $control_type && ! $has_sides;
	}

	public function to_control_value( array $prop_value, ?array $sides, array $control ) {
		return self::plain_color( $prop_value );
	}

	public static function plain_color( $prop_value ): ?string {
		if ( ! is_array( $prop_value ) || Color_Prop_Type::get_key() !== ( $prop_value['$$type'] ?? null ) ) {
			return null;
		}

		$color = $prop_value['value'] ?? null;

		return is_string( $color ) && self::is_valid_color( $color ) ? $color : null;
	}

	/**
	 * Anything that is not a color notation would be stored as a value the browser ignores, so it
	 * is reported as unstorable instead.
	 */
	private static function is_valid_color( string $color ): bool {
		$color = trim( $color );

		if ( '' === $color || strlen( $color ) > self::MAX_LENGTH || substr_count( $color, '(' ) !== substr_count( $color, ')' ) ) {
			return false;
		}

		if ( 1 === preg_match( self::HEX_PATTERN, $color ) || 1 === preg_match( self::FUNCTION_PATTERN, $color ) ) {
			return true;
		}

		$keyword = strtolower( $color );

		return in_array( $keyword, self::KEYWORDS, true ) || in_array( $keyword, explode( ' ', self::NAMED_COLORS ), true );
	}

	public function from_control_value( $control_value, ?array $sides ): ?array {
		return is_string( $control_value ) && '' !== $control_value
			? Color_Prop_Type::generate( $control_value )
			: null;
	}
}
