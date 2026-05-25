<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter;

use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers\Color_Value_Parser;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers\Size_Value_Parser;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Declaration_Classifier {

	private const LINE_STYLES = [
		'none', 'hidden', 'dotted', 'dashed', 'solid', 'double',
		'groove', 'ridge', 'inset', 'outset',
	];

	private const BORDER_FAMILIES = [
		'border' => [
			'width' => 'border-width',
			'style' => 'border-style',
			'color' => 'border-color',
		],
		'outline' => [
			'width' => 'outline-width',
			'style' => 'outline-style',
			'color' => 'outline-color',
		],
	];

	public static function make(): self {
		return new self();
	}

	public function split( string $css ): array {
		$css = $this->strip_dangerous( $css );
		$declarations = [];

		foreach ( explode( ';', $css ) as $chunk ) {
			$chunk = trim( $chunk );

			if ( '' === $chunk ) {
				continue;
			}

			$colon = strpos( $chunk, ':' );

			if ( false === $colon || 0 === $colon ) {
				continue;
			}

			$property = strtolower( trim( substr( $chunk, 0, $colon ) ) );
			$value = trim( substr( $chunk, $colon + 1 ) );

			if ( '' === $property || '' === $value ) {
				continue;
			}

			if ( ! preg_match( '/^[a-z-]+$/', $property ) ) {
				continue;
			}

			if ( isset( self::BORDER_FAMILIES[ $property ] ) ) {
				$expanded = $this->expand_border_shorthand( $property, $value );

				if ( null !== $expanded ) {
					foreach ( $expanded as $decl ) {
						$declarations[] = $decl;
					}
					continue;
				}
			}

			$declarations[] = [
				'property' => $property,
				'value' => $value,
			];
		}

		return $declarations;
	}

	private function expand_border_shorthand( string $family, string $value ): ?array {
		$tokens = $this->tokenize( $value );

		if ( empty( $tokens ) ) {
			return null;
		}

		$mapping = self::BORDER_FAMILIES[ $family ];
		$assigned = [];

		foreach ( $tokens as $token ) {
			$kind = $this->classify_border_token( $token );

			if ( null === $kind ) {
				return null;
			}

			if ( isset( $assigned[ $kind ] ) ) {
				return null;
			}

			$assigned[ $kind ] = $token;
		}

		$declarations = [];

		foreach ( $assigned as $kind => $token ) {
			$declarations[] = [
				'property' => $mapping[ $kind ],
				'value' => $token,
			];
		}

		return $declarations;
	}

	private function classify_border_token( string $token ): ?string {
		if ( in_array( strtolower( $token ), self::LINE_STYLES, true ) ) {
			return 'style';
		}

		if ( null !== Color_Value_Parser::parse( $token ) ) {
			return 'color';
		}

		if ( null !== Size_Value_Parser::parse( $token ) ) {
			return 'width';
		}

		return null;
	}

	private function tokenize( string $value ): array {
		$tokens = [];
		$buffer = '';
		$depth = 0;
		$length = strlen( $value );

		for ( $i = 0; $i < $length; $i++ ) {
			$char = $value[ $i ];

			if ( '(' === $char ) {
				$depth++;
				$buffer .= $char;
				continue;
			}

			if ( ')' === $char ) {
				$depth = max( 0, $depth - 1 );
				$buffer .= $char;
				continue;
			}

			if ( ( ' ' === $char || "\t" === $char ) && 0 === $depth ) {
				if ( '' !== $buffer ) {
					$tokens[] = $buffer;
					$buffer = '';
				}
				continue;
			}

			$buffer .= $char;
		}

		if ( '' !== $buffer ) {
			$tokens[] = $buffer;
		}

		return $tokens;
	}

	private function strip_dangerous( string $css ): string {
		$css = preg_replace( '#/\*.*?\*/#s', '', $css );
		$css = str_ireplace( [ 'expression(', 'javascript:', '@import' ], '', $css );

		return $css;
	}
}
