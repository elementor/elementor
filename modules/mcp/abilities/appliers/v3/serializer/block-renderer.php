<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Responsive_Key_Resolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders a {@see V3_Block_Accumulator} back into a CSS string that
 * {@see \Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper} can consume.
 *
 * Layout: base declarations, then `&:hover|focus|active { ... }`, then named style targets
 * as `<target> { ... } <target>:<state> { ... }`, then `@media(--breakpoint) { ... }` blocks
 * with the same nesting inside.
 */
class Block_Renderer {

	const DEFAULT_TARGET_SELECTOR = '&';

	public function render( V3_Block_Accumulator $blocks ): string {
		$grouped = $blocks->all();
		$scoped = $blocks->scoped();
		$parts = [];

		$rendered_default = $this->render_breakpoint( $grouped, $scoped, Responsive_Key_Resolver::BASE_BREAKPOINT );
		if ( '' !== $rendered_default ) {
			$parts[] = $rendered_default;
		}

		foreach ( $this->breakpoints( $grouped, $scoped ) as $breakpoint ) {
			if ( Responsive_Key_Resolver::BASE_BREAKPOINT === $breakpoint ) {
				continue;
			}

			$rendered = $this->render_breakpoint( $grouped, $scoped, $breakpoint );
			if ( '' === $rendered ) {
				continue;
			}
			$parts[] = sprintf( '@media(--%s) { %s }', $breakpoint, $rendered );
		}

		return implode( ' ', $parts );
	}

	/**
	 * @return string[]
	 */
	private function breakpoints( array $grouped, array $scoped ): array {
		$breakpoints = array_keys( $grouped );

		foreach ( $scoped as $target_blocks ) {
			$breakpoints = array_merge( $breakpoints, array_keys( $target_blocks ) );
		}

		return array_values( array_unique( array_map( 'strval', $breakpoints ) ) );
	}

	private function render_breakpoint( array $grouped, array $scoped, string $breakpoint ): string {
		$parts = [];

		$unscoped = $this->render_state_group( $grouped[ $breakpoint ] ?? [], self::DEFAULT_TARGET_SELECTOR, false );
		if ( '' !== $unscoped ) {
			$parts[] = $unscoped;
		}

		foreach ( $scoped as $target => $target_blocks ) {
			$rendered = $this->render_state_group( $target_blocks[ $breakpoint ] ?? [], (string) $target, true );
			if ( '' !== $rendered ) {
				$parts[] = $rendered;
			}
		}

		return implode( ' ', $parts );
	}

	private function render_state_group( array $state_group, string $selector, bool $wrap_base ): string {
		$parts = [];

		$base = $state_group[''] ?? [];
		unset( $state_group[''] );
		if ( ! empty( $base ) ) {
			$declarations = $this->render_declarations( $base );
			$parts[] = $wrap_base ? sprintf( '%s { %s }', $selector, $declarations ) : $declarations;
		}

		foreach ( $state_group as $state => $declarations ) {
			if ( empty( $declarations ) ) {
				continue;
			}
			$parts[] = sprintf( '%s:%s { %s }', $selector, $state, $this->render_declarations( $declarations ) );
		}

		return implode( ' ', $parts );
	}

	private function render_declarations( array $declarations ): string {
		$parts = [];
		foreach ( $declarations as $property => $value ) {
			$parts[] = sprintf( '%s: %s;', $property, $value );
		}

		return implode( ' ', $parts );
	}
}
