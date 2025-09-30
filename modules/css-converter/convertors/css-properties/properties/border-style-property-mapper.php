<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Border_Style_Property_Mapper extends Atomic_Property_Mapper_Base {

	private const VALID_BORDER_STYLES = [
		'none',
		'hidden',
		'dotted',
		'dashed',
		'solid',
		'double',
		'groove',
		'ridge',
		'inset',
		'outset',
	];

	public function get_supported_properties(): array {
		return [
			'border-style',
			'border-top-style',
			'border-right-style',
			'border-bottom-style',
			'border-left-style',
		];
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		// ❌ ATOMIC WIDGETS LIMITATION: Individual border-style properties not supported
		// Only 'border-style' shorthand is supported in atomic widgets style schema
		if ( in_array( $property, [ 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style' ], true ) ) {
			return null; // Individual properties not supported by atomic widgets
		}
		
		if ( empty( $value ) || ! is_string( $value ) ) {
			return null;
		}

		$style_value = $this->parse_style_value( $value );
		if ( null === $style_value ) {
			return null;
		}

		return String_Prop_Type::make()->generate( $style_value );
	}

	private function parse_style_value( string $value ): ?string {
		$value = trim( strtolower( $value ) );

		if ( empty( $value ) ) {
			return null;
		}

		if ( 'inherit' === $value || 'initial' === $value || 'unset' === $value ) {
			return $value;
		}

		if ( in_array( $value, self::VALID_BORDER_STYLES, true ) ) {
			return $value;
		}

		return null;
	}

	public function supports( string $property, $value = null ): bool {
		return in_array( $property, $this->get_supported_properties(), true );
	}
}
