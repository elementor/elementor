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
		return $this->render_targets( [ self::DEFAULT_TARGET_SELECTOR => $blocks ], self::DEFAULT_TARGET_SELECTOR );
	}

	/**
	 * @param array<string, V3_Block_Accumulator> $targets        Alias => blocks of that style target.
	 * @param string                              $default_target Alias rendered without a wrapping block.
	 */
	public function render_targets( array $targets, string $default_target ): string {
		$parts = [];

		foreach ( $this->breakpoints( $targets ) as $breakpoint ) {
			$rendered = $this->render_breakpoint( $targets, $default_target, $breakpoint );

			if ( '' === $rendered ) {
				continue;
			}

			$parts[] = Responsive_Key_Resolver::BASE_BREAKPOINT === $breakpoint
				? $rendered
				: sprintf( '@media(--%s) { %s }', $breakpoint, $rendered );
		}

		return implode( ' ', $parts );
	}

	/**
	 * @param array<string, V3_Block_Accumulator> $targets
	 * @return string[] The base breakpoint first, then the others in first-seen order.
	 */
	private function breakpoints( array $targets ): array {
		$breakpoints = [ Responsive_Key_Resolver::BASE_BREAKPOINT ];

		foreach ( $targets as $blocks ) {
			$breakpoints = array_merge( $breakpoints, array_map( 'strval', array_keys( $blocks->all() ) ) );
		}

		return array_values( array_unique( $breakpoints ) );
	}

	/**
	 * @param array<string, V3_Block_Accumulator> $targets
	 */
	private function render_breakpoint( array $targets, string $default_target, string $breakpoint ): string {
		$parts = [];

		foreach ( $targets as $alias => $blocks ) {
			$state_group = $blocks->all()[ $breakpoint ] ?? [];
			$is_default = (string) $alias === $default_target;
			$rendered = $this->render_state_group( $state_group, $is_default ? self::DEFAULT_TARGET_SELECTOR : (string) $alias, ! $is_default );

			if ( '' !== $rendered ) {
				$parts[] = $rendered;
			}
		}

		return implode( ' ', $parts );
	}

	/**
	 * @param array<string, array<string, string>> $state_group
	 */
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
