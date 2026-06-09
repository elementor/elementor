<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter;

use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Border_Radius_Property_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Color_Property_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Dimensions_Property_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Filter_Property_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Noop_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Number_Property_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Size_Property_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Span_Property_Converter;
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
		'grid-auto-rows',
		'grid-auto-columns',
	];

	/**
	 * Size properties that also accept a unitless number (a multiplier, e.g. `line-height: 1.1`). The
	 * value is kept verbatim as a `custom` unit so it renders without a unit; every other size property
	 * declines a unitless non-zero value to custom_css.
	 */
	const UNITLESS_SIZE_PROPERTIES = [
		'line-height',
	];

	/**
	 * Every Style_Schema property backed by a Number_Prop_Type. Handled uniformly by
	 * Number_Property_Converter (strict numeric, no units/functions).
	 */
	const NUMBER_PROPERTIES = [
		'z-index',
		'column-count',
		'order',
	];

	/**
	 * Every Style_Schema property backed by a plain Color_Prop_Type. Handled uniformly by
	 * Color_Property_Converter (raw passthrough; any non-empty value is a valid color).
	 */
	const COLOR_PROPERTIES = [
		'color',
		'border-color',
		'outline-color',
	];

	/**
	 * Every Style_Schema property backed by a Span_Prop_Type (grid placement). Handled uniformly by
	 * Span_Property_Converter, with the validation regex sourced from the live schema.
	 */
	const SPAN_PROPERTIES = [
		'grid-column',
		'grid-row',
	];

	/**
	 * Union props whose string member accepts a raw value (e.g. Union(String | Grid_Track_Size)). A
	 * free-string String_Property_Converter emits a `string` PropValue that validates against the union's
	 * String member, covering `1fr 1fr`, `repeat(3, 1fr)`, `minmax(...)`, named lines, etc. The structured
	 * member is intentionally not produced (raw passthrough, mirroring color). NOT wired via
	 * STRING_PROPERTIES because the schema entry is a Union and has no get_enum().
	 */
	const STRING_PASSTHROUGH_PROPERTIES = [
		'grid-template-columns',
		'grid-template-rows',
	];

	/**
	 * Box shorthands backed by Union(Dimensions | Size). Handled uniformly by
	 * Dimensions_Property_Converter (single value -> Size; 2-4 values -> logical Dimensions).
	 */
	const DIMENSIONS_PROPERTIES = [
		'padding',
		'margin',
	];

	/**
	 * Props that each own a bespoke single-property converter (no shared family). Listed here for the
	 * covered set; each is wired explicitly in real_converters() (unlike the family arrays above, the
	 * members do not share a converter class, so there is no uniform loop). Distinct from
	 * NOOP_PROPERTIES, which have no real converter yet.
	 *
	 * - border-radius: Union(Border_Radius | Size); single value -> Size, 2-4 values -> logical
	 *   Border_Radius. Elliptical "/" values decline to custom_css (no two-radii-per-corner shape).
	 */
	const OTHER_PROPERTIES = [
		'border-radius',
	];

	/**
	 * Filter-function lists backed by Array(Css_Filter_Func) (filter, backdrop-filter). Handled
	 * uniformly by Filter_Property_Converter + Filter_Value_Parser; the two share inner items and
	 * differ only by the wrapping $$type, which is sourced from the live schema.
	 */
	const FILTER_PROPERTIES = [
		'filter',
		'backdrop-filter',
	];

	/**
	 * Hardcoded Style_Schema properties with no real converter yet (objects, unions, shorthands). They
	 * still get a Noop_Converter so they keep routing to custom_css. Combined with the real-converter
	 * families via covered_properties() to form the exhaustive covered set. Intentionally NOT derived
	 * from Style_Schema: a coverage test diffs the live schema against the covered set so adding a schema
	 * property without coverage fails CI until it is added here.
	 */
	const NOOP_PROPERTIES = [
		'object-position',
		'stroke',
		'border-width',
		'background',
		'box-shadow',
		'transform',
		'transition',
		'flex',
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
		return array_merge(
			self::STRING_PROPERTIES,
			self::SIZE_PROPERTIES,
			self::NUMBER_PROPERTIES,
			self::COLOR_PROPERTIES,
			self::SPAN_PROPERTIES,
			self::STRING_PASSTHROUGH_PROPERTIES,
			self::DIMENSIONS_PROPERTIES,
			self::FILTER_PROPERTIES,
			self::OTHER_PROPERTIES,
			self::NOOP_PROPERTIES
		);
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
			$allow_unitless = in_array( $property, self::UNITLESS_SIZE_PROPERTIES, true );
			$converters[ $property ] = new Size_Property_Converter( $property, $allow_unitless );
		}

		foreach ( self::NUMBER_PROPERTIES as $property ) {
			$converters[ $property ] = new Number_Property_Converter( $property );
		}

		foreach ( self::COLOR_PROPERTIES as $property ) {
			$converters[ $property ] = new Color_Property_Converter( $property );
		}

		foreach ( self::SPAN_PROPERTIES as $property ) {
			$converters[ $property ] = new Span_Property_Converter( $property, $schema[ $property ]->get_regex() );
		}

		foreach ( self::STRING_PASSTHROUGH_PROPERTIES as $property ) {
			$converters[ $property ] = new String_Property_Converter( $property );
		}

		foreach ( self::DIMENSIONS_PROPERTIES as $property ) {
			$converters[ $property ] = new Dimensions_Property_Converter( $property );
		}

		$converters['border-radius'] = new Border_Radius_Property_Converter( 'border-radius' );

		foreach ( self::FILTER_PROPERTIES as $property ) {
			$converters[ $property ] = new Filter_Property_Converter( $property, $schema[ $property ]->get_key() );
		}

		return $converters;
	}
}
