<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Custom_Css_Sanitizer {

	private const BLOCKED_VALUE_NEEDLES = [
		'javascript:',
		'vbscript:',
		'data:text/html',
	];

	private const MAX_CSS_HEX_ESCAPE_LENGTH = 6;

	public static function make(): self {
		return new self();
	}

	public function sanitize_encoded( $encoded ): ?string {
		if ( ! is_string( $encoded ) || '' === $encoded ) {
			return null;
		}

		$decoded = Utils::decode_string( $encoded, null );

		if ( ! is_string( $decoded ) ) {
			return null;
		}

		$sanitized = $this->sanitize( $decoded );

		if ( '' === $sanitized ) {
			return null;
		}

		return Utils::encode_string( $sanitized );
	}

	public function sanitize( string $css ): string {
		$css = $this->prepare( $css );
		$css = $this->remove_html_injection_vectors( $css );
		$css = $this->remove_blocked_declarations( $css );

		return trim( $this->remove_execution_vectors( $css ) );
	}

	private function prepare( string $css ): string {
		$css = $this->normalize_encoding( $css );

		return str_replace( "\0", '', $css );
	}

	private function normalize_encoding( string $css ): string {
		if ( function_exists( 'wp_check_invalid_utf8' ) ) {
			return wp_check_invalid_utf8( $css );
		}

		return $css;
	}

	private function remove_html_injection_vectors( string $css ): string {
		$css = preg_replace( '/<\/style\b[^>]*>/i', '', $css );
		$css = preg_replace( '/<script\b[^>]*>.*?<\/script>/is', '', $css );
		$css = preg_replace( '/<script\b[^>]*>/i', '', $css );

		if ( function_exists( 'strip_tags' ) ) {
			$css = strip_tags( $css );
		}

		return $css ?? '';
	}

	private function remove_blocked_declarations( string $css ): string {
		$css = preg_replace( '/\bbehavior\s*:[^;}]*/i', '', $css );
		$css = preg_replace( '/-moz-binding\s*:[^;}]*/i', '', $css );

		return $css ?? '';
	}

	private function remove_execution_vectors( string $css ): string {
		$decoded = $this->decode_css_escapes( $css );

		if ( ! $this->contains_execution_vectors( $decoded ) ) {
			return $css;
		}

		$decoded = $this->neutralize_blocked_value_needles( $decoded );

		return $this->remove_expression_calls( $decoded );
	}

	private function contains_execution_vectors( string $css ): bool {
		foreach ( self::BLOCKED_VALUE_NEEDLES as $needle ) {
			if ( false !== stripos( $css, $needle ) ) {
				return true;
			}
		}

		return (bool) preg_match( '/\bexpression\s*\(/i', $css );
	}

	private function decode_css_escapes( string $css ): string {
		$length = strlen( $css );
		$decoded = '';
		$index = 0;

		while ( $index < $length ) {
			if ( '\\' !== $css[ $index ] ) {
				$decoded .= $css[ $index ];
				$index++;

				continue;
			}

			if ( $index + 1 >= $length ) {
				$decoded .= '\\';
				break;
			}

			$next = $css[ $index + 1 ];

			if ( '\\' === $next ) {
				$decoded .= '\\\\';
				$index += 2;

				continue;
			}

			if ( $this->is_css_escaped_newline( $next ) ) {
				$index += 2;

				if ( "\r" === $next && $index < $length && "\n" === $css[ $index ] ) {
					$index++;
				}

				continue;
			}

			if ( ctype_xdigit( $next ) ) {
				[ $decoded_char, $index ] = $this->decode_hex_escape_at( $css, $index, $length );
				$decoded .= $decoded_char;

				continue;
			}

			$decoded .= $next;
			$index += 2;
		}

		return $decoded;
	}

	private function decode_hex_escape_at( string $css, int $index, int $length ): array {
		$hex = '';
		$hex_end = $index + 1;
		$hex_digit_count = 0;

		while (
			$hex_end < $length
			&& $hex_digit_count < self::MAX_CSS_HEX_ESCAPE_LENGTH
			&& ctype_xdigit( $css[ $hex_end ] )
		) {
			$hex .= $css[ $hex_end ];
			$hex_end++;
			$hex_digit_count++;
		}

		if ( $hex_end < $length && $this->is_css_escape_terminator_whitespace( $css[ $hex_end ] ) ) {
			$hex_end++;
		}

		return [
			$this->code_point_to_utf8( (int) hexdec( $hex ) ),
			$hex_end,
		];
	}

	private function is_css_escaped_newline( string $char ): bool {
		return "\n" === $char || "\r" === $char || "\f" === $char;
	}

	private function is_css_escape_terminator_whitespace( string $char ): bool {
		return ' ' === $char || "\t" === $char || "\n" === $char || "\r" === $char || "\f" === $char;
	}

	private function code_point_to_utf8( int $code_point ): string {
		if ( $code_point <= 0 ) {
			return '';
		}

		if ( function_exists( 'mb_chr' ) ) {
			$character = mb_chr( $code_point, 'UTF-8' );

			return false !== $character ? $character : '';
		}

		if ( $code_point < 0x80 ) {
			return chr( $code_point );
		}

		return '';
	}

	private function neutralize_blocked_value_needles( string $css ): string {
		foreach ( self::BLOCKED_VALUE_NEEDLES as $needle ) {
			$pattern = '/' . preg_quote( $needle, '/' ) . '/i';
			$css = preg_replace( $pattern, '', $css );
		}

		return $css ?? '';
	}

	private function remove_expression_calls( string $css ): string {
		$offset = 0;

		while ( preg_match( '/\bexpression\s*\(/i', $css, $matches, PREG_OFFSET_CAPTURE, $offset ) ) {
			$match_start = $matches[0][1];
			$open_paren = $match_start + strlen( $matches[0][0] ) - 1;
			$end = $this->find_closing_paren( $css, $open_paren );

			if ( null === $end ) {
				$css = substr_replace( $css, '', $match_start, strlen( $matches[0][0] ) );
				$offset = $match_start;

				continue;
			}

			$css = substr_replace( $css, '', $match_start, $end - $match_start + 1 );
			$offset = $match_start;
		}

		return $css;
	}

	private function find_closing_paren( string $css, int $open_paren_index ): ?int {
		$depth = 0;
		$length = strlen( $css );
		$in_string = false;
		$string_char = '';

		for ( $i = $open_paren_index; $i < $length; $i++ ) {
			$char = $css[ $i ];

			if ( $in_string ) {
				if ( $string_char === $char && ! $this->is_escaped( $css, $i ) ) {
					$in_string = false;
				}

				continue;
			}

			if ( "'" === $char || '"' === $char ) {
				$in_string = true;
				$string_char = $char;

				continue;
			}

			if ( '(' === $char ) {
				$depth++;

				continue;
			}

			if ( ')' === $char ) {
				$depth--;

				if ( 0 === $depth ) {
					return $i;
				}
			}
		}

		return null;
	}

	private function is_escaped( string $css, int $index ): bool {
		$slashes = 0;

		for ( $i = $index - 1; $i >= 0 && '\\' === $css[ $i ]; $i-- ) {
			$slashes++;
		}

		return 1 === $slashes % 2;
	}
}
