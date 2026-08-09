<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Re-serializes CSS fragments that could not be mapped to V3 settings, back into a
 * single CSS string suitable for V3's `custom_css`. Wraps state fragments as `&:state`
 * and non-desktop breakpoints as `@media(--breakpoint) { ... }`.
 */
class Unmapped_Css_Serializer {

	const BASE_BREAKPOINT = 'desktop';

	public function serialize_declaration( string $breakpoint, ?string $state, string $property, string $value ): string {
		$decl = $property . ': ' . $value . ';';

		if ( null !== $state ) {
			$decl = '&:' . $state . ' { ' . $decl . ' }';
		}

		return $this->serialize_breakpoint_block( $breakpoint, $decl );
	}

	public function serialize_nested_block( string $breakpoint, string $selector, string $css ): string {
		$inner = '&' . $selector . ' { ' . trim( $css ) . ' }';

		return $this->serialize_breakpoint_block( $breakpoint, $inner );
	}

	public function serialize_breakpoint_block( string $breakpoint, string $css ): string {
		$css = trim( $css );
		if ( '' === $css ) {
			return '';
		}

		if ( self::BASE_BREAKPOINT === $breakpoint ) {
			return $css;
		}

		return '@media(--' . $breakpoint . ') { ' . $css . ' }';
	}

	/**
	 * @param string[] $parts
	 */
	public function join( array $parts ): string {
		$parts = array_values( array_filter( array_map( 'trim', $parts ) ) );

		return implode( ' ', $parts );
	}
}
