<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Css_Declaration_Parser;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Responsive_Key_Resolver;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Keeps the declarations a style target cannot store in a delimited section of the widget's
 * `custom_css`, one rule per line, so later writes can update them without touching CSS the
 * user wrote by hand. Pro replaces `selector` with the widget wrapper at render.
 *
 * Rule shape: `{ target, state, breakpoint, declarations: property => value, replaces: property[] }`,
 * where `replaces` lists properties a later write now owns and drops from the section. Media
 * query blocks the map cannot route are kept verbatim on the section's last line.
 */
class V3_Custom_Css_Fallback {

	const SECTION_START = '/* elementor-mcp-style-fallback */';

	const SECTION_END = '/* /elementor-mcp-style-fallback */';

	const WRAPPER_PLACEHOLDER = 'selector';

	/**
	 * @var array<string, string|null>
	 */
	private array $selectors;

	/**
	 * @var array<string, string>
	 */
	private array $media_queries;

	private Css_Declaration_Parser $declaration_parser;

	/**
	 * @param array<string, string|null> $selectors     Target alias => DOM selector inside the wrapper.
	 * @param array<string, string>      $media_queries Breakpoint name => media query condition.
	 */
	public function __construct( array $selectors, array $media_queries ) {
		$this->selectors = $selectors;
		$this->media_queries = $media_queries;
		$this->declaration_parser = new Css_Declaration_Parser();
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

	public function merge( string $custom_css, array $rules, string $verbatim_css = '' ): string {
		$merged = $this->index( $this->read( $custom_css ) );
		$verbatim = '' === trim( $verbatim_css ) ? $this->read_verbatim( $custom_css ) : self::single_line( $verbatim_css );

		foreach ( $rules as $rule ) {
			$key = self::key( $rule );
			$kept = array_diff_key( $merged[ $key ]['declarations'] ?? [], array_flip( $rule['replaces'] ), $rule['declarations'] );

			$merged[ $key ] = array_merge( $rule, [
				'declarations' => array_merge( $kept, $rule['declarations'] ),
				'replaces' => [],
			] );
		}

		$lines = array_filter( [ $this->render( $merged ), $verbatim ] );

		return $this->with_section( $this->strip_section( $custom_css ), implode( "\n", $lines ) );
	}

	public function read_verbatim( string $custom_css ): string {
		$lines = array_filter(
			array_map( 'trim', explode( "\n", $this->section_of( $custom_css ) ) ),
			fn( string $line ) => '' !== $line && null === $this->parse_line( $line )
		);

		return implode( ' ', $lines );
	}

	private static function single_line( string $css ): string {
		return trim( preg_replace( '/\s+/', ' ', $css ) ?? $css );
	}

	/**
	 * @return array<int, array{target: string, state: string|null, breakpoint: string, declarations: array<string, string>, replaces: string[]}>
	 */
	public function read( string $custom_css ): array {
		$rules = [];

		foreach ( explode( "\n", $this->section_of( $custom_css ) ) as $line ) {
			$rule = $this->parse_line( trim( $line ) );

			if ( null !== $rule ) {
				$rules[] = $rule;
			}
		}

		return $rules;
	}

	private function render( array $rules ): string {
		$lines = [];

		foreach ( $rules as $rule ) {
			$selector = $this->selectors[ $rule['target'] ] ?? null;

			if ( null === $selector || empty( $rule['declarations'] ) || ! $this->has_media_query( $rule['breakpoint'] ) ) {
				continue;
			}

			$lines[] = $this->render_rule( $rule, $selector );
		}

		return implode( "\n", $lines );
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

	private function parse_line( string $line ): ?array {
		if ( ! preg_match( '/^(?:@media (.+?) \{ )?(selector[^{]*) \{ (.*?) \}(?: \})?$/', $line, $matches ) ) {
			return null;
		}

		$breakpoint = '' === $matches[1] ? Responsive_Key_Resolver::BASE_BREAKPOINT : array_search( $matches[1], $this->media_queries, true );
		$target = $this->target_of( $matches[2] );

		if ( false === $breakpoint || null === $target ) {
			return null;
		}

		return [
			'target' => $target['alias'],
			'state' => $target['state'],
			'breakpoint' => (string) $breakpoint,
			'declarations' => array_column( $this->declaration_parser->parse_declarations( $matches[3] ), 'value', 'property' ),
			'replaces' => [],
		];
	}

	/**
	 * @return array{alias: string, state: string|null}|null
	 */
	private function target_of( string $full_selector ): ?array {
		foreach ( $this->selectors as $alias => $selector ) {
			if ( null === $selector ) {
				continue;
			}

			$base = $this->full_selector( $selector, null );

			if ( $base === $full_selector ) {
				return [
					'alias' => (string) $alias,
					'state' => null,
				];
			}

			if ( 0 === strpos( $full_selector, $base . ':' ) ) {
				return [
					'alias' => (string) $alias,
					'state' => substr( $full_selector, strlen( $base ) + 1 ),
				];
			}
		}

		return null;
	}

	private function index( array $rules ): array {
		$indexed = [];

		foreach ( $rules as $rule ) {
			$indexed[ self::key( $rule ) ] = $rule;
		}

		return $indexed;
	}

	private static function key( array $rule ): string {
		return $rule['target'] . '|' . ( $rule['state'] ?? '' ) . '|' . $rule['breakpoint'];
	}

	private function section_of( string $custom_css ): string {
		$start = strpos( $custom_css, self::SECTION_START );
		$end = strpos( $custom_css, self::SECTION_END );

		if ( false === $start || false === $end || $end < $start ) {
			return '';
		}

		return substr( $custom_css, $start + strlen( self::SECTION_START ), $end - $start - strlen( self::SECTION_START ) );
	}

	private function strip_section( string $custom_css ): string {
		$section = $this->section_of( $custom_css );

		if ( '' === $section && false === strpos( $custom_css, self::SECTION_START ) ) {
			return trim( $custom_css );
		}

		return trim( str_replace( self::SECTION_START . $section . self::SECTION_END, '', $custom_css ) );
	}

	private function with_section( string $custom_css, string $section ): string {
		if ( '' === $section ) {
			return $custom_css;
		}

		$wrapped = self::SECTION_START . "\n" . $section . "\n" . self::SECTION_END;

		return '' === $custom_css ? $wrapped : $custom_css . "\n" . $wrapped;
	}
}
