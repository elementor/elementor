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
 * Rule shape: `{ target, state, breakpoint, media, declarations: property => value }`, where `media`
 * is the condition of a media query that is not a site breakpoint, or null. Rules render desktop
 * first, then in the order of `$media_queries`, then custom media, so later rules win the cascade.
 */
class V3_Custom_Css_Fallback {

	const WRAPPER_PLACEHOLDER = 'selector';

	const MAX_WIDTH_DIRECTION = 'max';

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
	 * @param array<string, string>      $media_queries Breakpoint name => media query condition, in cascade order.
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
		$breakpoints = Plugin::$instance->breakpoints->get_active_breakpoints();

		uasort( $breakpoints, fn( $a, $b ) => self::cascade_position( $a ) <=> self::cascade_position( $b ) );

		return array_map(
			fn( $breakpoint ) => sprintf( '(%s-width: %dpx)', $breakpoint->get_direction(), $breakpoint->get_value() ),
			$breakpoints
		);
	}

	private static function cascade_position( $breakpoint ): int {
		return self::MAX_WIDTH_DIRECTION === $breakpoint->get_direction() ? -$breakpoint->get_value() : $breakpoint->get_value();
	}

	public function render( array $rules ): string {
		$lines = [];

		foreach ( $this->in_cascade_order( $rules ) as $rule ) {
			$selector = $this->selectors[ $rule['target'] ] ?? null;

			if ( null === $selector || empty( $rule['declarations'] ) || ! $this->has_media_query( $rule ) ) {
				continue;
			}

			$lines[] = $this->render_rule( $rule, $selector );
		}

		return implode( "\n", $lines );
	}

	private function in_cascade_order( array $rules ): array {
		$ranks = array_flip( array_merge( [ Responsive_Key_Resolver::BASE_BREAKPOINT ], array_keys( $this->media_queries ) ) );
		$custom_media_rank = count( $ranks );
		$ranked = [];

		foreach ( array_values( $rules ) as $index => $rule ) {
			$rank = null === ( $rule['media'] ?? null ) ? ( $ranks[ $rule['breakpoint'] ] ?? $custom_media_rank ) : $custom_media_rank;
			$ranked[] = [ $rank, $index, $rule ];
		}

		sort( $ranked );

		return array_column( $ranked, 2 );
	}

	private function has_media_query( array $rule ): bool {
		return null !== ( $rule['media'] ?? null )
			|| Responsive_Key_Resolver::BASE_BREAKPOINT === $rule['breakpoint']
			|| isset( $this->media_queries[ $rule['breakpoint'] ] );
	}

	private function render_rule( array $rule, string $selector ): string {
		$declarations = [];

		foreach ( $rule['declarations'] as $property => $value ) {
			$declarations[] = $property . ': ' . $value . ';';
		}

		$block = sprintf( '%s { %s }', $this->full_selector( $selector, $rule['state'] ), implode( ' ', $declarations ) );

		$media = $rule['media'] ?? $this->media_queries[ $rule['breakpoint'] ] ?? null;

		return null === $media ? $block : sprintf( '@media %s { %s }', $media, $block );
	}

	private function full_selector( string $selector, ?string $state ): string {
		$full = '' === $selector ? self::WRAPPER_PLACEHOLDER : self::WRAPPER_PLACEHOLDER . ' ' . $selector;

		return null === $state ? $full : $full . ':' . $state;
	}
}
