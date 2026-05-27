<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Converters;

use Elementor\Modules\AtomicWidgets\PropTypes\Box_Shadow_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Shadow_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Prop_Converter_Base;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers\Color_Value_Parser;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers\Css_Tokenizer;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers\Size_Value_Parser;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Box_Shadow_Converter extends Prop_Converter_Base {

	private const DEFAULT_SIZE = [ 'size' => 0, 'unit' => 'px' ];
	private const DEFAULT_COLOR = 'rgba(0, 0, 0, 1)';
	private const INSET = 'inset';

	public function get_supported_properties(): array {
		return [ 'box-shadow' ];
	}

	public function convert( array $declarations ): array {
		$shadows = [];
		$unconverted = [];

		foreach ( $declarations as $declaration ) {
			$parsed = $this->parse_value( $declaration['value'] );

			if ( null === $parsed ) {
				$unconverted[] = $this->unconverted(
					$declaration['property'],
					$declaration['value'],
					'box-shadow value could not be parsed; rendered via custom_css.'
				);
				continue;
			}

			$shadows = array_merge( $shadows, $parsed );
		}

		if ( empty( $shadows ) ) {
			return [
				'props' => [],
				'unconverted' => $unconverted,
			];
		}

		return [
			'props' => [ 'box-shadow' => Box_Shadow_Prop_Type::generate( $shadows ) ],
			'unconverted' => $unconverted,
		];
	}

	private function parse_value( string $value ): ?array {
		$items = Css_Tokenizer::split( $value, ',' );

		if ( empty( $items ) ) {
			return null;
		}

		$shadows = [];

		foreach ( $items as $item ) {
			$shadow = $this->parse_shadow_item( $item );

			if ( null === $shadow ) {
				return null;
			}

			$shadows[] = $shadow;
		}

		return $shadows;
	}

	private function parse_shadow_item( string $item ): ?array {
		$tokens = Css_Tokenizer::words( $item );

		if ( count( $tokens ) < 2 ) {
			return null;
		}

		$position = $this->extract_inset( $tokens );
		$color = $this->extract_color( $tokens );
		$sizes = $this->extract_sizes( $tokens );

		if ( null === $sizes ) {
			return null;
		}

		return $this->build_shadow_shape( $sizes, $color, $position );
	}

	private function extract_inset( array &$tokens ): ?string {
		if ( strtolower( $tokens[0] ) === self::INSET ) {
			array_shift( $tokens );
			return self::INSET;
		}

		if ( strtolower( end( $tokens ) ) === self::INSET ) {
			array_pop( $tokens );
			return self::INSET;
		}

		return null;
	}

	private function extract_color( array &$tokens ): ?string {
		foreach ( $tokens as $index => $token ) {
			$parsed = Color_Value_Parser::parse( $token );

			if ( null !== $parsed ) {
				array_splice( $tokens, $index, 1 );
				return $parsed;
			}
		}

		return null;
	}

	private function extract_sizes( array $tokens ): ?array {
		$count = count( $tokens );

		if ( $count < 2 || $count > 4 ) {
			return null;
		}

		return Size_Value_Parser::parse_list( $tokens );
	}

	private function build_shadow_shape( array $sizes, ?string $color, ?string $position ): array {
		$shape = [
			'hOffset' => Size_Prop_Type::generate( $sizes[0] ),
			'vOffset' => Size_Prop_Type::generate( $sizes[1] ),
			'blur' => Size_Prop_Type::generate( $sizes[2] ?? self::DEFAULT_SIZE ),
			'spread' => Size_Prop_Type::generate( $sizes[3] ?? self::DEFAULT_SIZE ),
			'color' => Color_Prop_Type::generate( $color ?? self::DEFAULT_COLOR ),
		];

		if ( null !== $position ) {
			$shape['position'] = String_Prop_Type::generate( $position );
		}

		return Shadow_Prop_Type::generate( $shape );
	}
}
