<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Block_Accumulator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders a {@see V3_Block_Accumulator} back into a CSS string that
 * {@see \Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper} can consume.
 *
 * Layout: base declarations, then `&:hover|focus|active { ... }`, then
 * `@media(--breakpoint) { ... }` blocks with the same nesting inside.
 */
class Block_Renderer {

	const BASE_BREAKPOINT = 'desktop';

	public function render( V3_Block_Accumulator $blocks ): string {
		$grouped = $blocks->all();
		$parts = [];

		$default = $grouped[ self::BASE_BREAKPOINT ] ?? [];
		unset( $grouped[ self::BASE_BREAKPOINT ] );

		$rendered_default = $this->render_state_group( $default );
		if ( '' !== $rendered_default ) {
			$parts[] = $rendered_default;
		}

		foreach ( $grouped as $breakpoint => $state_group ) {
			$rendered = $this->render_state_group( $state_group );
			if ( '' === $rendered ) {
				continue;
			}
			$parts[] = sprintf( '@media(--%s) { %s }', $breakpoint, $rendered );
		}

		return implode( ' ', $parts );
	}

	/**
	 * @param array<string, array<string, string>> $state_group
	 */
	private function render_state_group( array $state_group ): string {
		$parts = [];

		$base = $state_group[''] ?? [];
		unset( $state_group[''] );
		if ( ! empty( $base ) ) {
			$parts[] = $this->render_declarations( $base );
		}

		foreach ( $state_group as $state => $declarations ) {
			if ( empty( $declarations ) ) {
				continue;
			}
			$parts[] = sprintf( '&:%s { %s }', $state, $this->render_declarations( $declarations ) );
		}

		return implode( ' ', $parts );
	}

	/**
	 * @param array<string, string> $declarations
	 */
	private function render_declarations( array $declarations ): string {
		$parts = [];
		foreach ( $declarations as $property => $value ) {
			$parts[] = sprintf( '%s: %s;', $property, $value );
		}

		return implode( ' ', $parts );
	}
}
