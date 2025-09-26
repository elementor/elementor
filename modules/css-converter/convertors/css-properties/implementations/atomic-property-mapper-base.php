<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Contracts\Property_Mapper_Interface;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Atomic_Property_Mapper_Base implements Property_Mapper_Interface {
	
	public function supports( string $property, $value = null ): bool {
		return in_array( $property, $this->get_supported_properties(), true );
	}

	protected function create_atomic_size_value( string $property, array $parsed_size ): array {
		$atomic_value = \Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type::generate( $parsed_size );
		
		return [
			'property' => $property,
			'value' => $atomic_value
		];
	}

	protected function create_atomic_dimensions_value( string $property, array $dimensions ): array {
		$atomic_dimensions = [];
		foreach ( $dimensions as $logical_side => $size_data ) {
			$atomic_dimensions[ $logical_side ] = \Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type::generate( $size_data );
		}

		$atomic_value = \Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type::generate( $atomic_dimensions );
		
		return [
			'property' => $property,
			'value' => $atomic_value
		];
	}

	protected function create_atomic_color_value( string $property, string $color ): array {
		$atomic_value = \Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type::generate( $color );
		
		return [
			'property' => $property,
			'value' => $atomic_value
		];
	}

	protected function create_atomic_string_value( string $property, string $value ): array {
		$atomic_value = \Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type::generate( $value );
		
		return [
			'property' => $property,
			'value' => $atomic_value
		];
	}

	protected function parse_size_value( string $value ): ?array {
		$value = trim( $value );
		
		if ( empty( $value ) ) {
			return $this->create_zero_size_value();
		}

		if ( $this->is_css_keyword( $value ) ) {
			return $this->create_keyword_size_value( $value );
		}

		if ( preg_match( '/^(-?\d*\.?\d+)(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax)?$/i', $value, $matches ) ) {
			$size = (float) $matches[1];
			$unit = $matches[2] ?? 'px';
			
			return [
				'size' => $size,
				'unit' => strtolower( $unit )
			];
		}

		if ( '0' === $value ) {
			return $this->create_zero_size_value();
		}

		return $this->handle_unparseable_size_value();
	}

	protected function is_css_keyword( string $value ): bool {
		$keywords = [ 'auto', 'inherit', 'initial', 'unset', 'revert', 'revert-layer' ];
		return in_array( strtolower( $value ), $keywords, true );
	}

	protected function parse_shorthand_to_logical_properties( string $value ): ?array {
		$values = preg_split( '/\s+/', trim( $value ) );
		$count = count( $values );

		switch ( $count ) {
			case 1:
				$parsed = $this->parse_size_value( $values[0] );
				if ( null === $parsed ) {
					return $this->handle_unparseable_shorthand();
				}
				return [
					'block-start' => $parsed,
					'inline-end' => $parsed,
					'block-end' => $parsed,
					'inline-start' => $parsed,
				];

			case 2:
				$vertical = $this->parse_size_value( $values[0] );
				$horizontal = $this->parse_size_value( $values[1] );
				if ( null === $vertical || null === $horizontal ) {
					return $this->handle_unparseable_shorthand();
				}
				return [
					'block-start' => $vertical,
					'inline-end' => $horizontal,
					'block-end' => $vertical,
					'inline-start' => $horizontal,
				];

			case 3:
				$top = $this->parse_size_value( $values[0] );
				$horizontal = $this->parse_size_value( $values[1] );
				$bottom = $this->parse_size_value( $values[2] );
				if ( null === $top || null === $horizontal || null === $bottom ) {
					return $this->handle_unparseable_shorthand();
				}
				return [
					'block-start' => $top,
					'inline-end' => $horizontal,
					'block-end' => $bottom,
					'inline-start' => $horizontal,
				];

			case 4:
				$block_start = $this->parse_size_value( $values[0] );
				$inline_end = $this->parse_size_value( $values[1] );
				$block_end = $this->parse_size_value( $values[2] );
				$inline_start = $this->parse_size_value( $values[3] );
				if ( null === $block_start || null === $inline_end || null === $block_end || null === $inline_start ) {
					return $this->handle_unparseable_shorthand();
				}
				return [
					'block-start' => $block_start,
					'inline-end' => $inline_end,
					'block-end' => $block_end,
					'inline-start' => $inline_start,
				];

			default:
				return $this->handle_invalid_shorthand();
		}
	}


	abstract public function get_supported_properties(): array;

	private function create_zero_size_value(): array {
		return [
			'size' => 0.0,
			'unit' => 'px'
		];
	}

	private function create_keyword_size_value( string $value ): array {
		return [
			'size' => $value,
			'unit' => 'custom'
		];
	}

	private function handle_unparseable_size_value(): ?array {
		return null;
	}

	private function handle_unparseable_shorthand(): ?array {
		return null;
	}

	private function handle_invalid_shorthand(): ?array {
		return null;
	}
}
