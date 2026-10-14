<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Css_Token_Splitter;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Image_Position_Offset_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Position_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Converter for `background-position`.
 *
 * The schema accepts only two shapes for a position value:
 *   - String enum (one of Position_Prop_Type::get_position_enum_values())
 *   - Background_Image_Position_Offset_Prop_Type { x: Size, y: Size }
 *
 * This subclass adds keyword normalization to the generic Background_Layer_Field_Converter
 * so common LLM-emitted inputs reach the enum branch instead of declining:
 *   - single keyword:  center  -> "center center", top -> "top center", left -> "center left", ...
 *   - swapped pair:    left top -> "top left"  (enum is y-then-x ordered)
 *
 * Anything that cannot be normalized to an enum string or to two parseable Sizes
 * (e.g. center 20%, bottom 4px, anything containing calc()) declines to custom_css.
 */
class Background_Position_Property_Converter extends Background_Layer_Field_Converter {
	const SINGLE_KEYWORD_TO_PAIR = [
		'center' => 'center center',
		'top'    => 'top center',
		'bottom' => 'bottom center',
		'left'   => 'center left',
		'right'  => 'center right',
	];

	const X_ONLY_KEYWORDS = [ 'left', 'right' ];
	const Y_ONLY_KEYWORDS = [ 'top', 'bottom' ];

	public function __construct() {
		parent::__construct(
			'background-position',
			'position',
			Position_Prop_Type::get_position_enum_values(),
			Background_Image_Position_Offset_Prop_Type::class,
			[ 'x', 'y' ]
		);
	}

	protected function parse_token( string $token ): ?array {
		return parent::parse_token( $this->normalize_keywords( trim( $token ) ) );
	}

	private function normalize_keywords( string $token ): string {
		$parts = Css_Token_Splitter::split_by_whitespace( $token );

		if ( 1 === count( $parts ) ) {
			$lower = strtolower( $parts[0] );

			return self::SINGLE_KEYWORD_TO_PAIR[ $lower ] ?? $token;
		}

		if ( 2 === count( $parts ) ) {
			$first = strtolower( $parts[0] );
			$second = strtolower( $parts[1] );

			if ( in_array( $first, self::X_ONLY_KEYWORDS, true ) && in_array( $second, self::Y_ONLY_KEYWORDS, true ) ) {
				return $second . ' ' . $first;
			}
		}

		return $token;
	}
}
