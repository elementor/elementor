<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Converters;

use Elementor\Modules\AtomicWidgets\PropTypes\Box_Shadow_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Shadow_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Prop_Converter_Base;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers\Color_Value_Parser;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers\Size_Value_Parser;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Box_Shadow_Converter extends Prop_Converter_Base {

	public function get_supported_properties(): array {
		return [ 'box-shadow' ];
	}

	public function convert( array $declarations ): array {
		$shadows = [];
		$unconverted = [];

		foreach ( $declarations as $declaration ) {
			$items = $this->split_shadows( $declaration['value'] );

			if ( empty( $items ) ) {
				$unconverted[] = $this->unconverted(
					$declaration['property'],
					$declaration['value'],
					'box-shadow value could not be parsed; rendered via custom_css.'
				);
				continue;
			}

			$parsed_items = [];
			$failed = false;

			foreach ( $items as $raw_item ) {
				$shadow = $this->parse_shadow( $raw_item );

				if ( null === $shadow ) {
					$failed = true;
					break;
				}

				$parsed_items[] = $shadow;
			}

			if ( $failed || empty( $parsed_items ) ) {
				$unconverted[] = $this->unconverted(
					$declaration['property'],
					$declaration['value'],
					'box-shadow item could not be parsed; rendered via custom_css.'
				);
				continue;
			}

			$shadows = array_merge( $shadows, $parsed_items );
		}

		if ( empty( $shadows ) ) {
			return [
				'props' => [],
				'unconverted' => $unconverted,
			];
		}

		return [
			'props' => [
				'box-shadow' => Box_Shadow_Prop_Type::generate( $shadows ),
			],
			'unconverted' => $unconverted,
		];
	}

	private function split_shadows( string $value ): array {
		$items = [];
		$buffer = '';
		$depth = 0;
		$length = strlen( $value );

		for ( $i = 0; $i < $length; $i++ ) {
			$char = $value[ $i ];

			if ( '(' === $char ) {
				$depth++;
			} elseif ( ')' === $char ) {
				$depth = max( 0, $depth - 1 );
			}

			if ( ',' === $char && 0 === $depth ) {
				$items[] = trim( $buffer );
				$buffer = '';
				continue;
			}

			$buffer .= $char;
		}

		if ( '' !== trim( $buffer ) ) {
			$items[] = trim( $buffer );
		}

		return $items;
	}

	private function parse_shadow( string $item ): ?array {
		$tokens = $this->tokenize( $item );

		if ( count( $tokens ) < 2 ) {
			return null;
		}

		$position = null;

		if ( strtolower( $tokens[0] ) === 'inset' ) {
			$position = 'inset';
			array_shift( $tokens );
		} elseif ( strtolower( end( $tokens ) ) === 'inset' ) {
			$position = 'inset';
			array_pop( $tokens );
		}

		$color = null;
		$size_tokens = [];

		foreach ( $tokens as $token ) {
			$parsed_color = Color_Value_Parser::parse( $token );

			if ( null !== $parsed_color && null === $color ) {
				$color = $parsed_color;
				continue;
			}

			$size_tokens[] = $token;
		}

		if ( count( $size_tokens ) < 2 || count( $size_tokens ) > 4 ) {
			return null;
		}

		$sizes = [];

		foreach ( $size_tokens as $token ) {
			$parsed = Size_Value_Parser::parse( $token );

			if ( null === $parsed ) {
				return null;
			}

			$sizes[] = $parsed;
		}

		$shape = [
			'hOffset' => Size_Prop_Type::generate( $sizes[0] ),
			'vOffset' => Size_Prop_Type::generate( $sizes[1] ),
			'blur' => Size_Prop_Type::generate( $sizes[2] ?? [ 'size' => 0, 'unit' => 'px' ] ),
			'spread' => Size_Prop_Type::generate( $sizes[3] ?? [ 'size' => 0, 'unit' => 'px' ] ),
			'color' => Color_Prop_Type::generate( $color ?? 'rgba(0, 0, 0, 1)' ),
		];

		if ( null !== $position ) {
			$shape['position'] = String_Prop_Type::generate( $position );
		}

		return Shadow_Prop_Type::generate( $shape );
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
}
