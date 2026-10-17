<?php

namespace Elementor\Modules\DataFlow;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Binding_Locator {
	const ATTRIBUTE = 'data-e-bind';
	const VOID_ELEMENTS = [ 'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr' ];
	const TOGGLE_ATTRIBUTES = [ 'autofocus', 'checked', 'disabled', 'hidden', 'inert', 'multiple', 'open', 'readonly', 'required', 'selected' ];
	const FALSY_VALUES = [ '', '0', 'false', 'null' ];

	public static function locate( string $html, array $bindings ): string {
		if ( empty( $bindings ) || false === strpos( $html, Binding_Collector::MARK ) ) {
			return $html;
		}

		$targets_by_element = [];
		$html = self::extract_targets( $html, $bindings, $targets_by_element );
		$html = self::tag_elements( $html, $targets_by_element );

		return self::strip_leftover_markers( $html );
	}

	private static function extract_targets( string $html, array $bindings, array &$targets_by_element ): string {
		$processor = new \WP_HTML_Tag_Processor( $html );
		$open_elements = [];
		$text_counts = [];
		$ordinal = -1;

		while ( $processor->next_token() ) {
			$type = $processor->get_token_type();

			if ( '#tag' === $type ) {
				if ( $processor->is_tag_closer() ) {
					array_pop( $open_elements );

					continue;
				}

				$ordinal++;
				self::extract_attribute_targets( $processor, $bindings, $ordinal, $targets_by_element );

				if ( ! in_array( strtolower( $processor->get_tag() ), self::VOID_ELEMENTS, true ) && ! $processor->has_self_closing_flag() ) {
					$open_elements[] = $ordinal;
				}

				continue;
			}

			if ( '#text' !== $type || empty( $open_elements ) ) {
				continue;
			}

			$host = end( $open_elements );
			$index = $text_counts[ $host ] ?? 0;
			$text_counts[ $host ] = $index + 1;

			self::extract_text_target( $processor, $bindings, $host, $index, $targets_by_element );
		}

		return $processor->get_updated_html();
	}

	private static function extract_text_target( \WP_HTML_Tag_Processor $processor, array $bindings, int $host, int $index, array &$targets_by_element ): void {
		$text = $processor->get_modifiable_text();

		if ( false === strpos( $text, Binding_Collector::MARK ) ) {
			return;
		}

		$parsed = self::parse( $text, $bindings );

		if ( null === $parsed ) {
			return;
		}

		$processor->set_modifiable_text( $parsed['plain'] );
		$targets_by_element[ $host ][] = [ 'kind' => 'text', 'index' => $index, 'parts' => $parsed['parts'] ];
	}

	private static function extract_attribute_targets( \WP_HTML_Tag_Processor $processor, array $bindings, int $ordinal, array &$targets_by_element ): void {
		foreach ( $processor->get_attribute_names_with_prefix( '' ) ?? [] as $name ) {
			$value = $processor->get_attribute( $name );

			if ( ! is_string( $value ) || false === strpos( $value, Binding_Collector::MARK ) ) {
				continue;
			}

			$parsed = self::parse( $value, $bindings );

			if ( null === $parsed ) {
				continue;
			}

			$is_toggle = in_array( $name, self::TOGGLE_ATTRIBUTES, true ) && 1 === count( $parsed['parts'] );

			if ( $is_toggle ) {
				self::apply_toggle( $processor, $name, $parsed['plain'] );
			} else {
				$processor->set_attribute( $name, $parsed['plain'] );
			}

			$targets_by_element[ $ordinal ][] = [
				'kind' => $is_toggle ? 'toggle' : 'attr',
				'name' => $name,
				'parts' => $parsed['parts'],
			];
		}
	}

	private static function apply_toggle( \WP_HTML_Tag_Processor $processor, string $name, string $value ): void {
		if ( in_array( strtolower( trim( $value ) ), self::FALSY_VALUES, true ) ) {
			$processor->remove_attribute( $name );

			return;
		}

		$processor->set_attribute( $name, true );
	}

	/**
	 * @return array{plain: string, parts: array}|null
	 */
	private static function parse( string $text, array $bindings ): ?array {
		if ( ! preg_match_all( Binding_Collector::pattern(), $text, $matches, PREG_SET_ORDER | PREG_OFFSET_CAPTURE ) ) {
			return null;
		}

		$parts = [];
		$plain = '';
		$cursor = 0;

		foreach ( $matches as $match ) {
			$binding = $bindings[ (int) $match[1][0] ] ?? null;
			$offset = $match[0][1];

			if ( null === $binding ) {
				continue;
			}

			$static = substr( $text, $cursor, $offset - $cursor );

			if ( '' !== $static ) {
				$parts[] = $static;
			}

			$parts[] = $binding;
			$plain .= $static . $match[2][0];
			$cursor = $offset + strlen( $match[0][0] );
		}

		if ( empty( $parts ) ) {
			return null;
		}

		$tail = substr( $text, $cursor );

		if ( '' !== $tail ) {
			$parts[] = $tail;
		}

		return [ 'plain' => $plain . $tail, 'parts' => $parts ];
	}

	private static function tag_elements( string $html, array $targets_by_element ): string {
		if ( empty( $targets_by_element ) ) {
			return $html;
		}

		$processor = new \WP_HTML_Tag_Processor( $html );
		$ordinal = -1;

		while ( $processor->next_tag() ) {
			$ordinal++;

			if ( isset( $targets_by_element[ $ordinal ] ) ) {
				$processor->set_attribute( self::ATTRIBUTE, wp_json_encode( $targets_by_element[ $ordinal ] ) );
			}
		}

		return $processor->get_updated_html();
	}

	private static function strip_leftover_markers( string $html ): string {
		return preg_replace( Binding_Collector::pattern(), '$2', $html ) ?? $html;
	}
}
