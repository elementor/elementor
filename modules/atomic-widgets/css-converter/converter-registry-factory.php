<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter;

use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Noop_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\String_Property_Converter;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Converter_Registry_Factory {
	/**
	 * Hardcoded Style_Schema properties that are NOT plain strings (sizes, colors, objects, unions).
	 * Combined with STRING_PROPERTIES via covered_properties() to form the exhaustive covered set.
	 * Intentionally NOT derived from Style_Schema: a coverage test diffs the live schema against the
	 * covered set so adding a schema property without coverage fails CI until it is added here.
	 */
	const NON_STRING_PROPERTIES = [
		'width',
		'height',
		'min-width',
		'min-height',
		'max-width',
		'max-height',
		'object-position',
		'inset-block-start',
		'inset-inline-end',
		'inset-block-end',
		'inset-inline-start',
		'z-index',
		'scroll-margin-top',
		'font-size',
		'color',
		'letter-spacing',
		'word-spacing',
		'column-count',
		'column-gap',
		'line-height',
		'stroke',
		'padding',
		'margin',
		'border-radius',
		'border-width',
		'border-color',
		'outline-width',
		'outline-color',
		'outline-offset',
		'background',
		'box-shadow',
		'opacity',
		'filter',
		'backdrop-filter',
		'transform',
		'transition',
		'gap',
		'flex',
		'grid-template-columns',
		'grid-template-rows',
		'grid-auto-rows',
		'grid-auto-columns',
		'grid-column',
		'grid-row',
		'order',
	];

	/**
	 * Every Style_Schema property backed by a plain String_Prop_Type. Enum-backed and free-string
	 * props are handled the same way: get_enum() returns the allowlist (enum props) or null
	 * (free-string props), so the allowlist is always sourced from the schema, never duplicated.
	 */
	const STRING_PROPERTIES = [
		'overflow',
		'aspect-ratio',
		'object-fit',
		'position',
		'font-family',
		'font-weight',
		'text-align',
		'font-style',
		'text-decoration',
		'text-transform',
		'direction',
		'all',
		'cursor',
		'border-style',
		'outline-style',
		'mix-blend-mode',
		'display',
		'flex-direction',
		'flex-wrap',
		'grid-auto-flow',
		'justify-content',
		'justify-items',
		'align-content',
		'align-items',
		'align-self',
		'content',
		'appearance',
		'clip-path',
	];

	/**
	 * The exhaustive covered set: string props plus every non-string prop. Single source of truth
	 * for the coverage test, with no property listed twice.
	 *
	 * @return string[]
	 */
	public static function covered_properties(): array {
		return array_merge( self::STRING_PROPERTIES, self::NON_STRING_PROPERTIES );
	}

	public static function create(): Converter_Registry {
		$registry = new Converter_Registry();
		$real_converters = self::real_converters();

		foreach ( $real_converters as $converter ) {
			$registry->register( $converter );
		}

		foreach ( self::covered_properties() as $property ) {
			if ( isset( $real_converters[ $property ] ) ) {
				continue;
			}

			$registry->register( new Noop_Converter( $property ) );
		}

		return $registry;
	}

	/**
	 * Real converters keyed by the property they own. Every remaining covered_properties() entry
	 * falls back to a Noop_Converter, so the "exactly one converter per property" invariant holds.
	 * Enum allowlists are sourced from the live Style_Schema to avoid duplicating (and drifting from)
	 * the schema's enums.
	 *
	 * @return array<string, \Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter>
	 */
	private static function real_converters(): array {
		$schema = Style_Schema::get_style_schema();
		$converters = [];

		foreach ( self::STRING_PROPERTIES as $property ) {
			$converters[ $property ] = new String_Property_Converter( $property, $schema[ $property ]->get_enum() );
		}

		return $converters;
	}
}
