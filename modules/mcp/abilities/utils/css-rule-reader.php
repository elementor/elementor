<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Css_Declaration_Parser;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Splits a stylesheet into style rules with their `@media` condition. Other at-rules
 * (`@keyframes`, `@font-face`, `@supports`, ...) are skipped.
 */
class Css_Rule_Reader {

	const MEDIA_AT_RULE = '@media';

	private Css_Declaration_Parser $declaration_parser;

	public function __construct() {
		$this->declaration_parser = new Css_Declaration_Parser();
	}

	/**
	 * @return array<int, array{media: string, selectors: string[], declarations: array<int, array{property: string, value: string}>}>
	 */
	public function read( string $css ): array {
		$rules = [];
		$this->read_block( (string) preg_replace( '#/\*.*?\*/#s', '', $css ), '', $rules );

		return $rules;
	}

	private function read_block( string $css, string $media, array &$rules ): void {
		$cursor = 0;
		$open = strpos( $css, '{', $cursor );

		for ( ; false !== $open; $open = strpos( $css, '{', $cursor ) ) {
			$close = $this->find_closing( $css, $open, '{', '}' );

			if ( null === $close ) {
				return;
			}

			$prelude = $this->strip_preceding_statements( substr( $css, $cursor, $open - $cursor ) );
			$body = substr( $css, $open + 1, $close - $open - 1 );
			$cursor = $close + 1;

			if ( str_starts_with( $prelude, self::MEDIA_AT_RULE ) ) {
				$this->read_block( $body, trim( substr( $prelude, strlen( self::MEDIA_AT_RULE ) ) ), $rules );
				continue;
			}

			if ( str_starts_with( $prelude, '@' ) ) {
				continue;
			}

			$rules[] = [
				'media' => $media,
				'selectors' => $this->split_selectors( $prelude ),
				'declarations' => $this->declaration_parser->parse_declarations( $body ),
			];
		}
	}

	private function strip_preceding_statements( string $prelude ): string {
		$last_statement_end = strrpos( $prelude, ';' );

		return trim( false === $last_statement_end ? $prelude : substr( $prelude, $last_statement_end + 1 ) );
	}

	/**
	 * @return string[] Selectors with all whitespace removed.
	 */
	private function split_selectors( string $selector_list ): array {
		$selectors = [];
		$depth = 0;
		$current = '';

		foreach ( str_split( $selector_list ) as $char ) {
			if ( ',' === $char && 0 === $depth ) {
				$selectors[] = $current;
				$current = '';
				continue;
			}

			$depth += ( '(' === $char ) - ( ')' === $char );
			$current .= $char;
		}

		$selectors[] = $current;

		return array_map( fn( $selector ) => (string) preg_replace( '/\s+/', '', $selector ), $selectors );
	}

	public function find_closing( string $text, int $open_position, string $open_char, string $close_char ): ?int {
		$depth = 0;
		$length = strlen( $text );

		for ( $position = $open_position; $position < $length; $position++ ) {
			if ( $open_char === $text[ $position ] ) {
				++$depth;
			} elseif ( $close_char === $text[ $position ] && 0 === --$depth ) {
				return $position;
			}
		}

		return null;
	}
}
