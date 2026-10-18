<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Block_Scanner_Trait;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Css_Declaration_Parser;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Responsive_Key_Resolver;
use Elementor\Modules\Mcp\Abilities\Utils\Style_Variants_Merger;
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

	use Css_Block_Scanner_Trait;

	const WRAPPER_PLACEHOLDER = 'selector';

	const MAX_WIDTH_DIRECTION = 'max';

	const MEDIA_PRELUDE_PATTERN = '/^@media\s*(?P<condition>.+)$/is';

	const IMPORTANT = '!important';

	const IMPORTANT_PATTERN = '/\s*!\s*important\s*$/i';
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

	public static function for_map( Compiled_V3_Map $map ): self {
		return new self( self::selectors_of( $map ), self::site_media_queries() );
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
			$declarations[] = $property . ': ' . self::without_important( (string) $value ) . ' ' . self::IMPORTANT . ';';
		}

		$block = sprintf( '%s { %s }', $this->full_selector( $selector, $rule['state'] ), implode( ' ', $declarations ) );

		$media = $rule['media'] ?? $this->media_queries[ $rule['breakpoint'] ] ?? null;

		return null === $media ? $block : sprintf( '@media %s { %s }', $media, $block );
	}

	/**
	 * A target can span several nodes (`.shop_table, address`); each one is scoped to the wrapper.
	 */
	private function full_selector( string $selector, ?string $state ): string {
		$parts = array_map(
			function ( string $part ) use ( $state ) {
				$full = '' === $part ? self::WRAPPER_PLACEHOLDER : self::WRAPPER_PLACEHOLDER . ' ' . $part;

				return null === $state ? $full : $full . ':' . $state;
			},
			array_map( 'trim', explode( ',', $selector ) )
		);

		return implode( ', ', $parts );
	}

	/**
	 * @return array<string, array{target: string, state: string|null}> Normalized rendered selector => target and state.
	 */
	private function rendered_selectors(): array {
		$rendered = [];

		foreach ( array_filter( $this->selectors, 'is_string' ) as $alias => $selector ) {
			foreach ( array_merge( [ null ], Style_Variants_Merger::PSEUDO_STATES ) as $state ) {
				$rendered[ self::normalize_selector( $this->full_selector( $selector, $state ) ) ] = [
					'target' => (string) $alias,
					'state' => $state,
				];
			}
		}

		return $rendered;
	}

	private static function normalize_selector( string $selector ): string {
		return preg_replace( '/\s*,\s*/', ', ', self::collapse_whitespace( $selector ) ) ?? $selector;
	}

	/**
	 * Reverse of {@see self::render()}. A rule whose selector belongs to no target, like one a user
	 * typed in the editor, is returned as written in `unmatched`.
	 *
	 * @return array{rules: array[], unmatched: string[]}
	 */
	public function parse( string $css ): array {
		$rules = [];
		$unmatched = [];

		foreach ( $this->statements( $css ) as $statement ) {
			$parsed = $this->parse_statement( $statement['prelude'], $statement['body'] );

			if ( null === $parsed ) {
				$unmatched[] = $statement['raw'];
				continue;
			}

			array_push( $rules, ...$parsed );
		}

		return [
			'rules' => $rules,
			'unmatched' => $unmatched,
		];
	}

	/**
	 * Same target, state and media: incoming declarations override existing ones of the same property.
	 */
	public static function merge( array $existing, array $incoming ): array {
		$merged = [];

		foreach ( array_merge( $existing, $incoming ) as $rule ) {
			$key = implode( '|', [ $rule['target'], $rule['state'] ?? '', $rule['breakpoint'], $rule['media'] ?? '' ] );

			if ( isset( $merged[ $key ] ) ) {
				$merged[ $key ]['declarations'] = array_merge( $merged[ $key ]['declarations'], $rule['declarations'] );
				continue;
			}

			$merged[ $key ] = $rule;
		}

		return array_values( $merged );
	}

	/**
	 * Removes unchanged copies of `$statements` from `$css`, so a rule read back as written is not
	 * reported as an unknown style target when it is sent again.
	 *
	 * @param string   $css
	 * @param string[] $statements
	 */
	public static function without_statements( string $css, array $statements ): string {
		if ( empty( $statements ) ) {
			return $css;
		}

		return trim( str_replace( array_map( [ self::class, 'collapse_whitespace' ], $statements ), '', self::collapse_whitespace( $css ) ) );
	}

	/**
	 * @return array<int, array{prelude: string, body: string, raw: string}>
	 */
	private function statements( string $css ): array {
		$statements = [];
		$length = strlen( $css );
		$position = 0;
		$brace = $this->find_unquoted( $css, $position, $length, [ '{' ] );

		while ( null !== $brace ) {
			$block_end = $this->find_block_end( $css, $brace + 1, $length );

			if ( null === $block_end ) {
				break;
			}

			$statements[] = [
				'prelude' => trim( substr( $css, $position, $brace - $position ) ),
				'body' => trim( substr( $css, $brace + 1, $block_end - $brace - 2 ) ),
				'raw' => trim( substr( $css, $position, $block_end - $position ) ),
			];
			$position = $block_end;
			$brace = $this->find_unquoted( $css, $position, $length, [ '{' ] );
		}

		$rest = trim( substr( $css, $position ) );

		if ( '' !== $rest ) {
			$statements[] = [
				'prelude' => '',
				'body' => '',
				'raw' => $rest,
			];
		}

		return $statements;
	}

	private function parse_statement( string $prelude, string $body ): ?array {
		if ( 1 !== preg_match( self::MEDIA_PRELUDE_PATTERN, $prelude, $matches ) ) {
			$rule = $this->parse_rule( $prelude, $body, Responsive_Key_Resolver::BASE_BREAKPOINT, null );

			return null === $rule ? null : [ $rule ];
		}

		$condition = trim( $matches['condition'] );
		$breakpoint = array_search( self::collapse_whitespace( $condition ), array_map( [ self::class, 'collapse_whitespace' ], $this->media_queries ), true );
		$rules = [];

		foreach ( $this->statements( $body ) as $statement ) {
			$rule = false === $breakpoint
				? $this->parse_rule( $statement['prelude'], $statement['body'], Responsive_Key_Resolver::BASE_BREAKPOINT, $condition )
				: $this->parse_rule( $statement['prelude'], $statement['body'], (string) $breakpoint, null );

			if ( null === $rule ) {
				return null;
			}

			$rules[] = $rule;
		}

		return empty( $rules ) ? null : $rules;
	}

	private function parse_rule( string $prelude, string $body, string $breakpoint, ?string $media ): ?array {
		$match = false === strpos( $body, '{' ) ? $this->rendered_selectors()[ self::normalize_selector( $prelude ) ] ?? null : null;
		$declarations = ( new Css_Declaration_Parser() )->parse_declarations( $body );

		if ( null === $match || empty( $declarations ) ) {
			return null;
		}

		return [
			'target' => $match['target'],
			'state' => $match['state'],
			'breakpoint' => $breakpoint,
			'media' => $media,
			'declarations' => array_map( [ self::class, 'without_important' ], array_column( $declarations, 'value', 'property' ) ),
		];
	}

	private static function without_important( string $value ): string {
		return trim( preg_replace( self::IMPORTANT_PATTERN, '', $value ) ?? $value );
	}

	private static function collapse_whitespace( string $css ): string {
		return trim( preg_replace( '/\s+/', ' ', $css ) ?? $css );
	}
}
