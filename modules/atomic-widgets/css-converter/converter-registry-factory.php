<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter;

use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Noop_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Size_Property_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\String_Property_Converter;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Converter_Registry_Factory {
	/**
	 * Every Style_Schema property whose value is a single Size leaf (the schema prop is a Size_Prop_Type,
	 * or a Union with a Size member like `gap` — a size PropValue validates against the union). All are
	 * handled uniformly by Size_Property_Converter + Size_Value_Parser; per-property unit sets are not
	 * enforced here because Size_Prop_Type::validate accepts any all_supported_units() unit.
	 */
	const SIZE_PROPERTIES = [
		'width',
		'height',
		'min-width',
		'min-height',
		'max-width',
		'max-height',
		'inset-block-start',
		'inset-inline-end',
		'inset-block-end',
		'inset-inline-start',
		'scroll-margin-top',
		'font-size',
		'letter-spacing',
		'word-spacing',
		'column-gap',
		'line-height',
		'outline-width',
		'outline-offset',
		'opacity',
		'gap',
	];

	/**
	 * Hardcoded Style_Schema properties with no real converter yet (colors, numbers, objects, unions,
	 * shorthands). They still get a Noop_Converter so they keep routing to custom_css. Combined with the
	 * real-converter families via covered_properties() to form the exhaustive covered set. Intentionally
	 * NOT derived from Style_Schema: a coverage test diffs the live schema against the covered set so
	 * adding a schema property without coverage fails CI until it is added here.
	 */
	const NOOP_PROPERTIES = [
		'object-position',
		'z-index',
		'color',
		'column-count',
		'stroke',
		'padding',
		'margin',
		'border-radius',
		'border-width',
		'border-color',
		'outline-color',
		'background',
		'box-shadow',
		'filter',
		'backdrop-filter',
		'transform',
		'transition',
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
	 * The exhaustive covered set: every family with a real converter plus the remaining no-ops. Single
	 * source of truth for the coverage test, with no property listed twice.
	 *
	 * @return string[]
	 */
	public static function covered_properties(): array {
		return array_merge( self::STRING_PROPERTIES, self::SIZE_PROPERTIES, self::NOOP_PROPERTIES );
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

		foreach ( self::SIZE_PROPERTIES as $property ) {
			$converters[ $property ] = new Size_Property_Converter( $property );
		}

		return $converters;
	}
}
