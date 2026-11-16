<?php

namespace Elementor\Modules\DefaultStyles;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Default_Styles_Sections {

	public const SECTION_PROPS = [
		'layout' => [
			'display',
			'flex-direction',
			'flex-wrap',
			'justify-content',
			'align-items',
			'align-content',
			'align-self',
			'gap',
			'order',
			'grid-column',
			'grid-row',
			'grid-auto-rows',
			'grid-auto-columns',
		],
		'spacing' => [ 'margin', 'padding' ],
		'size' => [
			'width',
			'min-width',
			'max-width',
			'height',
			'min-height',
			'max-height',
			'overflow',
			'aspect-ratio',
			'object-fit',
		],
		'position' => [ 'position', 'z-index', 'scroll-margin-top' ],
		'typography' => [
			'font-family',
			'font-weight',
			'font-size',
			'text-align',
			'color',
			'line-height',
			'letter-spacing',
			'word-spacing',
			'column-count',
			'text-decoration',
			'text-transform',
			'direction',
			'font-style',
			'stroke',
		],
		'background' => [ 'background' ],
		'border' => [ 'border-radius', 'border-width', 'border-color', 'border-style' ],
		'effects' => [
			'mix-blend-mode',
			'box-shadow',
			'opacity',
			'transform',
			'filter',
			'backdrop-filter',
			'transform-origin',
			'transition',
		],
	];

	public static function for_variants( array $variants ): array {
		$touched_props = [];
		$has_custom_css = false;

		foreach ( $variants as $variant ) {
			$touched_props = array_merge(
				$touched_props,
				array_keys( $variant['props'] ?? [] ),
				$variant['null_props'] ?? []
			);

			$has_custom_css = $has_custom_css || ! empty( $variant['custom_css'] );
		}

		$sections = [];

		foreach ( self::SECTION_PROPS as $section => $props ) {
			if ( array_intersect( $props, $touched_props ) ) {
				$sections[] = $section;
			}
		}

		if ( $has_custom_css ) {
			$sections[] = 'custom_css';
		}

		return $sections;
	}
}
