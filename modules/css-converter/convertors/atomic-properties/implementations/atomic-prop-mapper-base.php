<?php

namespace Elementor\Modules\CssConverter\Convertors\AtomicProperties\Implementations;

use Elementor\Modules\CssConverter\Convertors\AtomicProperties\Contracts\Atomic_Prop_Mapper_Interface;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Atomic_Prop_Mapper_Base implements Atomic_Prop_Mapper_Interface {
	protected $supported_properties = [];
	protected $atomic_prop_type = '';
	protected $supported_css_units = [];

	public function get_supported_properties(): array {
		return $this->supported_properties;
	}

	public function supports_property( string $property ): bool {
		return in_array( $property, $this->supported_properties, true );
	}

	public function get_atomic_prop_type(): string {
		return $this->atomic_prop_type;
	}

	public function get_supported_css_units(): array {
		return $this->supported_css_units;
	}

	public function validate_atomic_output( array $output ): bool {
		if ( ! isset( $output['$$type'] ) || ! isset( $output['value'] ) ) {
			return false;
		}

		return $output['$$type'] === $this->get_atomic_prop_type();
	}

	abstract public function map_css_to_atomic( string $css_value ): ?array;

	protected function create_atomic_prop( $value ): array {
		return [
			'$$type' => $this->get_atomic_prop_type(),
			'value' => $value
		];
	}

	protected function parse_size_value( string $css_value ): ?array {
		$css_value = trim( $css_value );
		
		if ( 'auto' === $css_value ) {
			return [ 'size' => '', 'unit' => 'auto' ];
		}

		if ( preg_match( '/^(-?\d*\.?\d+)(px|em|rem|%|vh|vw|vmin|vmax|ch|ex)$/i', $css_value, $matches ) ) {
			return [
				'size' => (float) $matches[1],
				'unit' => strtolower( $matches[2] )
			];
		}

		if ( is_numeric( $css_value ) ) {
			return [
				'size' => (float) $css_value,
				'unit' => 'px'
			];
		}

		return null;
	}

	protected function normalize_color_value( string $css_value ): ?string {
		$css_value = trim( $css_value );
		
		if ( preg_match( '/^#([a-f0-9]{3}|[a-f0-9]{6})$/i', $css_value ) ) {
			return strtolower( $css_value );
		}

		if ( preg_match( '/^rgba?\([^)]+\)$/i', $css_value ) ) {
			return $css_value;
		}

		if ( preg_match( '/^hsla?\([^)]+\)$/i', $css_value ) ) {
			return $css_value;
		}

		$named_colors = [
			'transparent', 'black', 'white', 'red', 'green', 'blue',
			'yellow', 'cyan', 'magenta', 'gray', 'grey'
		];

		if ( in_array( strtolower( $css_value ), $named_colors, true ) ) {
			return strtolower( $css_value );
		}

		return null;
	}

	protected function parse_dimensions_shorthand( string $css_value ): ?array {
		$values = preg_split( '/\s+/', trim( $css_value ) );
		$count = count( $values );

		if ( 0 === $count || $count > 4 ) {
			return null;
		}

		$parsed_values = [];
		foreach ( $values as $value ) {
			$parsed = $this->parse_size_value( $value );
			if ( null === $parsed ) {
				return null;
			}
			$parsed_values[] = $parsed;
		}

		switch ( $count ) {
			case 1:
				return [
					'top' => $parsed_values[0],
					'right' => $parsed_values[0],
					'bottom' => $parsed_values[0],
					'left' => $parsed_values[0],
				];
			case 2:
				return [
					'top' => $parsed_values[0],
					'right' => $parsed_values[1],
					'bottom' => $parsed_values[0],
					'left' => $parsed_values[1],
				];
			case 3:
				return [
					'top' => $parsed_values[0],
					'right' => $parsed_values[1],
					'bottom' => $parsed_values[2],
					'left' => $parsed_values[1],
				];
			case 4:
				return [
					'top' => $parsed_values[0],
					'right' => $parsed_values[1],
					'bottom' => $parsed_values[2],
					'left' => $parsed_values[3],
				];
		}

		return null;
	}
}
