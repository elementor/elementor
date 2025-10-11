<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Border_Color_Property_Mapper extends Atomic_Property_Mapper_Base {

	public function get_supported_properties(): array {
		return [
			'border-color',
			'border-top-color',
			'border-right-color',
			'border-bottom-color',
			'border-left-color',
		];
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		// ❌ ATOMIC WIDGETS LIMITATION: Individual border-color properties not supported
		// Only 'border-color' shorthand is supported in atomic widgets style schema
		if ( in_array( $property, [ 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color' ], true ) ) {
			return null; // Individual properties not supported by atomic widgets
		}
		
		if ( empty( $value ) || ! is_string( $value ) ) {
			return null;
		}

		$color_value = $this->parse_color_value( $value );
		if ( null === $color_value ) {
			return null;
		}

		return Color_Prop_Type::make()->generate( $color_value );
	}

	private function parse_color_value( string $value ): ?string {
		$value = trim( $value );

		if ( empty( $value ) ) {
			return null;
		}

		if ( 'transparent' === $value ) {
			return 'rgba(0,0,0,0)';
		}

		if ( 'inherit' === $value || 'initial' === $value || 'unset' === $value ) {
			return $value;
		}

		if ( preg_match( '/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/', $value ) ) {
			return $value;
		}

		if ( preg_match( '/^rgba?\(/', $value ) ) {
			return $value;
		}

		if ( preg_match( '/^hsla?\(/', $value ) ) {
			return $value;
		}

		$named_colors = [
			'red', 'green', 'blue', 'white', 'black', 'yellow', 'cyan', 'magenta',
			'silver', 'gray', 'maroon', 'olive', 'lime', 'aqua', 'teal', 'navy',
			'fuchsia', 'purple', 'orange', 'pink', 'brown', 'gold', 'violet'
		];

		if ( in_array( strtolower( $value ), $named_colors, true ) ) {
			return $value;
		}

		return null;
	}

	public function supports( string $property, $value = null ): bool {
		return in_array( $property, $this->get_supported_properties(), true );
	}
}
