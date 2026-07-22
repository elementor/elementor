<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Css_Token_Splitter;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Size_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Key_Value_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Selection_Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transition_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Converter for the `transition` CSS property -> Transition_Prop_Type (array of Selection_Size).
 *
 * Parses comma-separated transition layers. Each layer is whitespace-split into tokens:
 *   <property> <duration> [<easing>] [<delay>]
 *
 * Only the property name and the FIRST duration/delay time value are mapped — the schema has no
 * field for easing or delay, so they are intentionally dropped (silently).
 *
 * The `property` token must be in ALLOWED_PROPERTIES (sourced from the Elementor UI data).
 * Layers with an unrecognised property decline the entire declaration to customCss.
 *
 * Time values must be in `s` or `ms`; any other unit declines the layer.
 */
class Transition_Property_Converter extends Property_Converter_Base {
	const ALLOWED_PROPERTIES = [
		'all',
		'background-color',
		'background-position',
		'border',
		'border-color',
		'border-radius',
		'border-width',
		'box-shadow',
		'color',
		'filter',
		'flex',
		'flex-basis',
		'flex-grow',
		'flex-shrink',
		'font-size',
		'font-variation-settings',
		'height',
		'inset-block-end',
		'inset-block-start',
		'inset-inline-end',
		'inset-inline-start',
		'letter-spacing',
		'line-height',
		'margin',
		'margin-block-end',
		'margin-block-start',
		'margin-inline-end',
		'margin-inline-start',
		'max-height',
		'max-width',
		'min-height',
		'min-width',
		'opacity',
		'padding',
		'padding-block-end',
		'padding-block-start',
		'padding-inline-end',
		'padding-inline-start',
		'transform',
		'width',
		'word-spacing',
		'-webkit-text-stroke-color',
		'z-index',
	];

	const TIME_UNITS = [ 's', 'ms' ];

	protected function get_supported_properties(): array {
		return [ 'transition' ];
	}

	protected function do_convert( Conversion_Context $context, array $rule ): bool {
		$layers = Css_Token_Splitter::split_by_comma( trim( $rule['value'] ) );

		if ( empty( $layers ) ) {
			return false;
		}

		$items = [];

		foreach ( $layers as $layer ) {
			$item = $this->parse_layer( trim( $layer ) );

			if ( null === $item ) {
				return false;
			}

			$items[] = $item;
		}

		$context->set_prop( 'transition', Transition_Prop_Type::generate( $items ) );

		return true;
	}

	private function parse_layer( string $layer ): ?array {
		$tokens = Css_Token_Splitter::split_by_whitespace( $layer );

		if ( empty( $tokens ) ) {
			return null;
		}

		$property = strtolower( $tokens[0] );

		if ( ! in_array( $property, self::ALLOWED_PROPERTIES, true ) ) {
			return null;
		}

		$duration = $this->find_first_time( array_slice( $tokens, 1 ) );

		if ( null === $duration ) {
			return null;
		}

		return Selection_Size_Prop_Type::generate( [
			'selection' => Key_Value_Prop_Type::generate( [
				'key'   => String_Prop_Type::generate( $property ),
				'value' => String_Prop_Type::generate( $property ),
			] ),
			'size' => Size_Prop_Type::generate( $duration ),
		] );
	}

	private function find_first_time( array $tokens ): ?array {
		foreach ( $tokens as $token ) {
			$parsed = Size_Plain_Resolver::parse( $token );

			if ( null !== $parsed && in_array( $parsed['unit'], self::TIME_UNITS, true ) ) {
				return $parsed;
			}
		}

		return null;
	}
}
