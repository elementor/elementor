<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Css_Token_Splitter;
use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Size_Value_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Box_Shadow_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Shadow_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Converter for the `box-shadow` CSS property -> Box_Shadow_Prop_Type (array of Shadow_Prop_Type).
 *
 * Per-layer CSS grammar:
 *   <shadow> = <color>? && [<length>{2,4}] && inset?
 *
 * Token classification (paren-aware so rgb(255 0 0) stays one token):
 *   - `inset`              -> position keyword
 *   - parses as Size       -> length token
 *   - anything else        -> color (at most one per layer)
 *
 * Length mapping by count:
 *   2 -> hOffset, vOffset
 *   3 -> hOffset, vOffset, blur
 *   4 -> hOffset, vOffset, blur, spread
 * Any other count, multiple colors, or unrecognised tokens decline the entire declaration to custom_css.
 *
 * Defaults:
 *   - missing color -> `currentColor` (CSS spec default)
 *   - missing blur/spread -> 0 px
 *
 * Special values:
 *   - `none` -> empty Box_Shadow array (clears the prop).
 */
class Box_Shadow_Property_Converter extends Property_Converter_Base {
	const INSET_KEYWORD = 'inset';
	const DEFAULT_COLOR = 'currentColor';
	const ZERO_SIZE     = [
		'size' => 0,
		'unit' => 'px',
	];

	protected function get_supported_properties(): array {
		return [ 'box-shadow' ];
	}

	protected function do_convert( Conversion_Context $context, array $rule ): bool {
		$value = trim( $rule['value'] );

		if ( '' === $value ) {
			return false;
		}

		if ( 'none' === strtolower( $value ) ) {
			$context->set_prop( 'box-shadow', Box_Shadow_Prop_Type::generate( [] ) );
			return true;
		}

		$layers = Css_Token_Splitter::split_by_comma( $value );
		$shadows = [];

		foreach ( $layers as $layer ) {
			$shadow = $this->parse_layer( trim( $layer ) );

			if ( null === $shadow ) {
				return false;
			}

			$shadows[] = $shadow;
		}

		$context->set_prop( 'box-shadow', Box_Shadow_Prop_Type::generate( $shadows ) );

		return true;
	}

	private function parse_layer( string $layer ): ?array {
		$tokens = Css_Token_Splitter::split_by_whitespace( $layer );

		if ( empty( $tokens ) ) {
			return null;
		}

		$lengths = [];
		$color = null;
		$is_inset = false;

		foreach ( $tokens as $token ) {
			if ( self::INSET_KEYWORD === strtolower( $token ) ) {
				if ( $is_inset ) {
					return null;
				}

				$is_inset = true;
				continue;
			}

			$size = Size_Value_Parser::parse( $token );

			if ( null !== $size ) {
				$lengths[] = $size;
				continue;
			}

			if ( null !== $color ) {
				return null;
			}

			$color = $token;
		}

		$length_count = count( $lengths );

		if ( $length_count < 2 || $length_count > 4 ) {
			return null;
		}

		return Shadow_Prop_Type::generate( $this->build_shadow_fields( $lengths, $color, $is_inset ) );
	}

	private function build_shadow_fields( array $lengths, ?string $color, bool $is_inset ): array {
		$fields = [
			'hOffset' => Size_Prop_Type::generate( $lengths[0] ),
			'vOffset' => Size_Prop_Type::generate( $lengths[1] ),
			'blur'    => Size_Prop_Type::generate( $lengths[2] ?? self::ZERO_SIZE ),
			'spread'  => Size_Prop_Type::generate( $lengths[3] ?? self::ZERO_SIZE ),
			'color'   => Color_Prop_Type::generate( $color ?? self::DEFAULT_COLOR ),
		];

		if ( $is_inset ) {
			$fields['position'] = String_Prop_Type::generate( self::INSET_KEYWORD );
		}

		return $fields;
	}
}
