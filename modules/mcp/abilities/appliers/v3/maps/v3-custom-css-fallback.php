<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Responsive_Key_Resolver;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders the declarations a style target cannot store as custom CSS scoped to that target.
 * Pro replaces `selector` with the widget wrapper at render.
 *
 * Rule shape: `{ target, state, breakpoint, declarations: property => value }`.
 */
class V3_Custom_Css_Fallback {

	const WRAPPER_PLACEHOLDER = 'selector';

	/**
	 * @var array<string, string|null>
	 */
	private array $selectors;

	/**
	 * @var array<string, string>
	 */
	private array $media_queries;

	/**
	 * @param array<string, string|null> $selectors     Target alias => DOM selector inside the wrapper.
	 * @param array<string, string>      $media_queries Breakpoint name => media query condition.
	 */
	public function __construct( array $selectors, array $media_queries ) {
		$this->selectors = $selectors;
		$this->media_queries = $media_queries;
	}

	/**
	 * @return array<string, string|null>
	 */
	public static function selectors_of( Compiled_V3_Map $map ): array {
		return array_map( fn( Compiled_Style_Target $target ) => $target->get_selector(), $map->get_targets() );
	}

	/**
	 * @return array<string, string>
	 */
	public static function site_media_queries(): array {
		$queries = [];

		foreach ( Plugin::$instance->breakpoints->get_active_breakpoints() as $name => $breakpoint ) {
			$queries[ $name ] = sprintf( '(%s-width: %dpx)', $breakpoint->get_direction(), $breakpoint->get_value() );
		}

		return $queries;
	}

	public function render( array $rules, string $verbatim_css = '' ): string {
		$lines = [];

		foreach ( $rules as $rule ) {
			$selector = $this->selectors[ $rule['target'] ] ?? null;

			if ( null === $selector || empty( $rule['declarations'] ) || ! $this->has_media_query( $rule['breakpoint'] ) ) {
				continue;
			}

			$lines[] = $this->render_rule( $rule, $selector );
		}

		$lines[] = trim( $verbatim_css );

		return implode( "\n", array_filter( $lines ) );
	}

	private function has_media_query( string $breakpoint ): bool {
		return Responsive_Key_Resolver::BASE_BREAKPOINT === $breakpoint || isset( $this->media_queries[ $breakpoint ] );
	}

	private function render_rule( array $rule, string $selector ): string {
		$declarations = [];

		foreach ( $rule['declarations'] as $property => $value ) {
			$declarations[] = $property . ': ' . $value . ';';
		}

		$block = sprintf( '%s { %s }', $this->full_selector( $selector, $rule['state'] ), implode( ' ', $declarations ) );

		if ( Responsive_Key_Resolver::BASE_BREAKPOINT === $rule['breakpoint'] ) {
			return $block;
		}

		return sprintf( '@media %s { %s }', $this->media_queries[ $rule['breakpoint'] ], $block );
	}

	private function full_selector( string $selector, ?string $state ): string {
		$full = '' === $selector ? self::WRAPPER_PLACEHOLDER : self::WRAPPER_PLACEHOLDER . ' ' . $selector;

		return null === $state ? $full : $full . ':' . $state;
	}
}
