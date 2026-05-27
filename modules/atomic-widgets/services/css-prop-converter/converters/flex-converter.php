<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Converters;

use Elementor\Modules\AtomicWidgets\PropTypes\Flex_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Prop_Converter_Base;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers\Size_Value_Parser;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Flex_Converter extends Prop_Converter_Base {

	private const PROPERTIES = [
		'flex',
		'flex-grow',
		'flex-shrink',
		'flex-basis',
	];

	private const DEFAULT_BASIS_PX = [ 'size' => 0, 'unit' => 'px' ];
	private const AUTO_BASIS = [ 'size' => '', 'unit' => 'auto' ];

	public function get_supported_properties(): array {
		return self::PROPERTIES;
	}

	public function convert( array $declarations ): array {
		$shape = [];
		$unconverted = [];

		foreach ( $declarations as $declaration ) {
			$parsed = $this->parse_declaration( $declaration );

			if ( null === $parsed ) {
				$unconverted[] = $this->unconverted(
					$declaration['property'],
					$declaration['value'],
					$this->failure_hint( $declaration['property'] )
				);
				continue;
			}

			$shape = array_merge( $shape, $parsed );
		}

		if ( empty( $shape ) ) {
			return [
				'props' => [],
				'unconverted' => $unconverted,
			];
		}

		return [
			'props' => [ 'flex' => Flex_Prop_Type::generate( $shape ) ],
			'unconverted' => $unconverted,
		];
	}

	private function parse_declaration( array $declaration ): ?array {
		$value = trim( $declaration['value'] );

		switch ( $declaration['property'] ) {
			case 'flex':
				return $this->expand_shorthand( $value );
			case 'flex-grow':
				return $this->parse_numeric_member( $value, 'flexGrow' );
			case 'flex-shrink':
				return $this->parse_numeric_member( $value, 'flexShrink' );
			case 'flex-basis':
				return $this->parse_basis_member( $value );
		}

		return null;
	}

	private function parse_numeric_member( string $value, string $key ): ?array {
		if ( ! is_numeric( $value ) ) {
			return null;
		}

		return [ $key => Number_Prop_Type::generate( (float) $value ) ];
	}

	private function parse_basis_member( string $value ): ?array {
		$basis = Size_Value_Parser::parse( $value );

		if ( null === $basis ) {
			return null;
		}

		return [ 'flexBasis' => Size_Prop_Type::generate( $basis ) ];
	}

	private function expand_shorthand( string $value ): ?array {
		$keyword = $this->keyword_shape( strtolower( $value ) );

		if ( null !== $keyword ) {
			return $keyword;
		}

		$parts = preg_split( '/\s+/', $value );

		switch ( count( $parts ) ) {
			case 1:
				return $this->expand_one_part( $parts[0] );
			case 2:
				return $this->expand_two_parts( $parts );
			case 3:
				return $this->expand_three_parts( $parts );
		}

		return null;
	}

	private function keyword_shape( string $lowercase_value ): ?array {
		if ( 'none' === $lowercase_value ) {
			return $this->flex_shape( 0, 0, self::AUTO_BASIS );
		}

		if ( 'auto' === $lowercase_value ) {
			return $this->flex_shape( 1, 1, self::AUTO_BASIS );
		}

		return null;
	}

	private function expand_one_part( string $part ): ?array {
		if ( is_numeric( $part ) ) {
			return $this->flex_shape( (float) $part, 1, self::DEFAULT_BASIS_PX );
		}

		$basis = Size_Value_Parser::parse( $part );

		if ( null === $basis ) {
			return null;
		}

		return $this->flex_shape( 1, 1, $basis );
	}

	private function expand_two_parts( array $parts ): ?array {
		if ( ! is_numeric( $parts[0] ) ) {
			return null;
		}

		if ( is_numeric( $parts[1] ) ) {
			return $this->flex_shape( (float) $parts[0], (float) $parts[1], self::DEFAULT_BASIS_PX );
		}

		$basis = Size_Value_Parser::parse( $parts[1] );

		if ( null === $basis ) {
			return null;
		}

		return $this->flex_shape( (float) $parts[0], 1, $basis );
	}

	private function expand_three_parts( array $parts ): ?array {
		if ( ! is_numeric( $parts[0] ) || ! is_numeric( $parts[1] ) ) {
			return null;
		}

		$basis = Size_Value_Parser::parse( $parts[2] );

		if ( null === $basis ) {
			return null;
		}

		return $this->flex_shape( (float) $parts[0], (float) $parts[1], $basis );
	}

	private function flex_shape( float $grow, float $shrink, array $basis ): array {
		return [
			'flexGrow' => Number_Prop_Type::generate( $grow ),
			'flexShrink' => Number_Prop_Type::generate( $shrink ),
			'flexBasis' => Size_Prop_Type::generate( $basis ),
		];
	}

	private function failure_hint( string $property ): string {
		switch ( $property ) {
			case 'flex':
				return 'flex shorthand value could not be parsed; rendered via custom_css.';
			case 'flex-basis':
				return 'flex-basis value could not be parsed; rendered via custom_css.';
		}

		return sprintf( '%s expects a number; rendered via custom_css.', $property );
	}
}
