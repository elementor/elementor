<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Converters;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Prop_Converter_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class String_Converter extends Prop_Converter_Base {

	private const ENUMS = [
		'display' => [
			'block', 'inline', 'inline-block', 'flex', 'inline-flex',
			'grid', 'inline-grid', 'flow-root', 'none', 'contents',
		],
		'position' => [ 'static', 'relative', 'absolute', 'fixed', 'sticky' ],
		'overflow' => [ 'visible', 'hidden', 'auto' ],
		'object-fit' => [ 'fill', 'cover', 'contain', 'none', 'scale-down' ],
		'font-weight' => [
			'100', '200', '300', '400', '500', '600', '700', '800', '900',
			'normal', 'bold', 'bolder', 'lighter',
		],
		'font-style' => [ 'normal', 'italic', 'oblique' ],
		'text-align' => [ 'start', 'center', 'end', 'justify' ],
		'text-transform' => [ 'none', 'capitalize', 'uppercase', 'lowercase' ],
		'direction' => [ 'ltr', 'rtl' ],
		'cursor' => [ 'pointer' ],
		'border-style' => [
			'none', 'hidden', 'dotted', 'dashed', 'solid', 'double',
			'groove', 'ridge', 'inset', 'outset',
		],
		'outline-style' => [
			'none', 'hidden', 'dotted', 'dashed', 'solid', 'double',
			'groove', 'ridge', 'inset', 'outset',
		],
		'flex-direction' => [ 'row', 'row-reverse', 'column', 'column-reverse' ],
		'flex-wrap' => [ 'wrap', 'nowrap', 'wrap-reverse' ],
		'justify-content' => [
			'center', 'start', 'end', 'flex-start', 'flex-end', 'left', 'right',
			'normal', 'space-between', 'space-around', 'space-evenly', 'stretch',
		],
		'justify-items' => [
			'normal', 'stretch', 'center', 'start', 'end', 'flex-start',
			'flex-end', 'left', 'right', 'anchor-center',
		],
		'align-content' => [
			'center', 'start', 'end', 'space-between', 'space-around', 'space-evenly',
		],
		'align-items' => [
			'normal', 'stretch', 'center', 'start', 'end', 'flex-start',
			'flex-end', 'self-start', 'self-end', 'anchor-center',
		],
		'align-self' => [
			'auto', 'normal', 'center', 'start', 'end', 'self-start', 'self-end',
			'flex-start', 'flex-end', 'anchor-center', 'baseline',
			'first baseline', 'last baseline', 'stretch',
		],
		'mix-blend-mode' => [
			'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
			'color-dodge', 'saturation', 'color',
		],
		'appearance' => [ 'none', 'auto' ],
	];

	private const FREE_STRINGS = [
		'font-family',
		'text-decoration',
		'aspect-ratio',
		'clip-path',
		'content',
	];

	private const NORMALIZATIONS = [
		'text-align' => [
			'left' => 'start',
			'right' => 'end',
		],
	];

	public function get_supported_properties(): array {
		return array_merge( array_keys( self::ENUMS ), self::FREE_STRINGS );
	}

	public function convert( array $declarations ): array {
		$props = [];
		$unconverted = [];

		foreach ( $declarations as $declaration ) {
			$property = $declaration['property'];
			$value = trim( $declaration['value'] );

			if ( in_array( $property, self::FREE_STRINGS, true ) ) {
				$props[ $property ] = String_Prop_Type::generate( $value );
				continue;
			}

			$normalized = self::NORMALIZATIONS[ $property ][ strtolower( $value ) ] ?? $value;

			if ( ! in_array( $normalized, self::ENUMS[ $property ], true ) ) {
				$unconverted[] = $this->unconverted(
					$property,
					$declaration['value'],
					sprintf( 'Value is not in the %s enum; rendered via custom_css.', $property )
				);
				continue;
			}

			$props[ $property ] = String_Prop_Type::generate( $normalized );
		}

		return [
			'props' => $props,
			'unconverted' => $unconverted,
		];
	}
}
