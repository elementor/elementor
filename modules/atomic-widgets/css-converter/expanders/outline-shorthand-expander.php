<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Expanders;

use Elementor\Modules\AtomicWidgets\CssConverter\Shorthand_Expander_Base;
use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Css_Token_Splitter;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Size_Plain_Resolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Expands the `outline` shorthand into its supported longhands (outline-width, outline-style,
 * outline-color). Token classification mirrors the border expander: a style keyword -> style; a
 * length or width keyword -> width; anything else -> color. Duplicate roles or unclassifiable
 * tokens cause the whole expansion to decline (-> custom_css).
 *
 * On null reset, outline-offset is also included because it is a supported prop type even though
 * it is not part of the outline shorthand syntax.
 */
class Outline_Shorthand_Expander extends Shorthand_Expander_Base {
	const STYLE_KEYWORDS = [
		'none',
		'auto',
		'dotted',
		'dashed',
		'solid',
		'double',
		'groove',
		'ridge',
		'inset',
		'outset',
	];

	const WIDTH_KEYWORDS = [ 'thin', 'medium', 'thick' ];

	const SHORTHAND_LONGHANDS = [
		'width' => 'outline-width',
		'style' => 'outline-style',
		'color' => 'outline-color',
	];

	const ALL_LONGHANDS = [ 'outline-width', 'outline-style', 'outline-color', 'outline-offset' ];

	protected function get_supported_properties(): array {
		return [ 'outline' ];
	}

	protected function expand_null( array $rule ): array {
		return array_map( fn( $p ) => $this->null_rule( $p ), self::ALL_LONGHANDS );
	}

	protected function do_expand( array $rule ): array {
		$tokens = Css_Token_Splitter::split_by_whitespace( trim( $rule['value'] ) );

		if ( empty( $tokens ) ) {
			return [];
		}

		$slots = [
			'width' => null,
			'style' => null,
			'color' => null,
		];

		foreach ( $tokens as $token ) {
			$role = $this->classify_token( $token );

			if ( null === $role || null !== $slots[ $role ] ) {
				return [];
			}

			$slots[ $role ] = $token;
		}

		$rules = [];

		foreach ( $slots as $role => $value ) {
			if ( null === $value ) {
				continue;
			}

			$property = self::SHORTHAND_LONGHANDS[ $role ];

			$rules[] = [
				'property'    => $property,
				'value'       => $value,
				'declaration' => $property . ': ' . $value,
			];
		}

		return $rules;
	}

	private function classify_token( string $token ): ?string {
		$lower = strtolower( $token );

		if ( in_array( $lower, self::STYLE_KEYWORDS, true ) ) {
			return 'style';
		}

		if ( in_array( $lower, self::WIDTH_KEYWORDS, true ) || null !== Size_Plain_Resolver::parse( $token ) ) {
			return 'width';
		}

		return 'color';
	}
}
