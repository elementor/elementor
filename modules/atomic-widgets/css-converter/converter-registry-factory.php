<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter;

use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Noop_Converter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Converter_Registry_Factory {
	/**
	 * The exhaustive, hardcoded set of Style_Schema properties the converter covers. It is
	 * intentionally NOT derived from Style_Schema: a coverage test diffs the live schema against
	 * this list so adding a schema property without coverage fails CI until it is added here.
	 */
	const COVERED_PROPERTIES = [
		'width',
		'height',
		'min-width',
		'min-height',
		'max-width',
		'max-height',
		'overflow',
		'aspect-ratio',
		'object-fit',
		'object-position',
		'position',
		'inset-block-start',
		'inset-inline-end',
		'inset-block-end',
		'inset-inline-start',
		'z-index',
		'scroll-margin-top',
		'font-family',
		'font-weight',
		'font-size',
		'color',
		'letter-spacing',
		'word-spacing',
		'column-count',
		'column-gap',
		'line-height',
		'text-align',
		'font-style',
		'text-decoration',
		'text-transform',
		'direction',
		'stroke',
		'all',
		'cursor',
		'padding',
		'margin',
		'border-radius',
		'border-width',
		'border-color',
		'border-style',
		'outline-width',
		'outline-color',
		'outline-style',
		'outline-offset',
		'background',
		'mix-blend-mode',
		'box-shadow',
		'opacity',
		'filter',
		'backdrop-filter',
		'transform',
		'transition',
		'display',
		'flex-direction',
		'gap',
		'flex-wrap',
		'flex',
		'grid-template-columns',
		'grid-template-rows',
		'grid-auto-flow',
		'grid-auto-rows',
		'grid-auto-columns',
		'grid-column',
		'grid-row',
		'justify-content',
		'justify-items',
		'align-content',
		'align-items',
		'align-self',
		'order',
		'content',
		'appearance',
		'clip-path',
	];

	public static function create(): Converter_Registry {
		$registry = new Converter_Registry();

		foreach ( self::COVERED_PROPERTIES as $property ) {
			$registry->register( new Noop_Converter( $property ) );
		}

		return $registry;
	}
}
