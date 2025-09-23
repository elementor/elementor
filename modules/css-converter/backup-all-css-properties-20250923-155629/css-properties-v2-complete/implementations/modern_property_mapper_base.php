<?php
namespace Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Implementations;

use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Contracts\Atomic_Property_Mapper_Interface;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Modern_Property_Mapper_Base implements Atomic_Property_Mapper_Interface {

	protected function create_atomic_property_with_type( string $property, string $type, $value ): array {
		return [
			'property' => $property,
			'value' => [
				'$$type' => $type,
				'value' => $value,
			],
		];
	}

	protected function validate_against_atomic_schema( string $property, array $result ): bool {
		if ( ! isset( $result['value']['$$type'] ) || ! isset( $result['value']['value'] ) ) {
			return false;
		}

		$atomic_widgets = $this->get_supported_atomic_widgets();
		if ( empty( $atomic_widgets ) ) {
			return false;
		}

		return $this->validate_prop_type_structure( $result['value']['$$type'], $result['value']['value'] );
	}

	protected function get_atomic_widget_for_property( string $property ): ?string {
		$supported_widgets = $this->get_supported_atomic_widgets();
		return $supported_widgets[0] ?? null;
	}

	protected function get_prop_type_for_property( string $property ): ?string {
		$required_prop_types = $this->get_required_prop_types();
		return $required_prop_types[0] ?? null;
	}

	protected function convert_v4_to_v3_schema( ?array $v4_result ): ?array {
		if ( null === $v4_result ) {
			return null;
		}

		return [
			$v4_result['property'] => $v4_result['value'],
		];
	}

	protected function parse_size_value( string $value ): ?array {
		$value = trim( $value );
		
		if ( empty( $value ) || 'auto' === $value || 'inherit' === $value ) {
			return null;
		}

		if ( preg_match( '/^(\d*\.?\d+)(px|em|rem|%|vh|vw|vmin|vmax)?$/i', $value, $matches ) ) {
			$size = (float) $matches[1];
			$unit = $matches[2] ?? 'px';
			
			return [
				'size' => $size,
				'unit' => strtolower( $unit ),
			];
		}

		return null;
	}

	protected function parse_color_value( string $value ): ?string {
		$value = trim( $value );
		
		if ( empty( $value ) ) {
			return null;
		}

		if ( preg_match( '/^#([a-f0-9]{3}|[a-f0-9]{6})$/i', $value ) ) {
			return strtolower( $value );
		}

		if ( preg_match( '/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i', $value, $matches ) ) {
			$r = str_pad( dechex( (int) $matches[1] ), 2, '0', STR_PAD_LEFT );
			$g = str_pad( dechex( (int) $matches[2] ), 2, '0', STR_PAD_LEFT );
			$b = str_pad( dechex( (int) $matches[3] ), 2, '0', STR_PAD_LEFT );
			return '#' . $r . $g . $b;
		}

		$named_colors = [
			'red' => '#ff0000',
			'green' => '#008000',
			'blue' => '#0000ff',
			'white' => '#ffffff',
			'black' => '#000000',
			'transparent' => 'transparent',
		];

		return $named_colors[ strtolower( $value ) ] ?? null;
	}

	protected function parse_dimensions_shorthand( string $value ): ?array {
		$values = preg_split( '/\s+/', trim( $value ) );
		$count = count( $values );

		if ( 0 === $count || $count > 4 ) {
			return null;
		}

		$parsed_values = [];
		foreach ( $values as $val ) {
			$parsed = $this->parse_size_value( $val );
			if ( null === $parsed ) {
				return null;
			}
			$parsed_values[] = $parsed;
		}

		switch ( $count ) {
			case 1:
				return [
					'block-start' => ['$$type' => 'size', 'value' => $parsed_values[0]],
					'inline-end' => ['$$type' => 'size', 'value' => $parsed_values[0]],
					'block-end' => ['$$type' => 'size', 'value' => $parsed_values[0]],
					'inline-start' => ['$$type' => 'size', 'value' => $parsed_values[0]],
				];
			case 2:
				return [
					'block-start' => ['$$type' => 'size', 'value' => $parsed_values[0]],
					'inline-end' => ['$$type' => 'size', 'value' => $parsed_values[1]],
					'block-end' => ['$$type' => 'size', 'value' => $parsed_values[0]],
					'inline-start' => ['$$type' => 'size', 'value' => $parsed_values[1]],
				];
			case 3:
				return [
					'block-start' => ['$$type' => 'size', 'value' => $parsed_values[0]],
					'inline-end' => ['$$type' => 'size', 'value' => $parsed_values[1]],
					'block-end' => ['$$type' => 'size', 'value' => $parsed_values[2]],
					'inline-start' => ['$$type' => 'size', 'value' => $parsed_values[1]],
				];
			case 4:
				return [
					'block-start' => ['$$type' => 'size', 'value' => $parsed_values[0]],
					'inline-end' => ['$$type' => 'size', 'value' => $parsed_values[1]],
					'block-end' => ['$$type' => 'size', 'value' => $parsed_values[2]],
					'inline-start' => ['$$type' => 'size', 'value' => $parsed_values[3]],
				];
		}

		return null;
	}

	private function validate_prop_type_structure( string $type, $value ): bool {
		switch ( $type ) {
			case 'string':
				return is_string( $value );
			case 'size':
				return is_array( $value ) && 
					   isset( $value['size'] ) && 
					   isset( $value['unit'] ) && 
					   is_numeric( $value['size'] ) && 
					   is_string( $value['unit'] );
			case 'color':
				return is_string( $value );
			case 'dimensions':
				return is_array( $value ) && 
					   isset( $value['block-start'] ) && 
					   isset( $value['inline-end'] ) && 
					   isset( $value['block-end'] ) && 
					   isset( $value['inline-start'] );
			default:
				return true;
		}
	}

	public function validate_atomic_output( array $output ): bool {
		return $this->validate_against_atomic_schema( 
			$output['property'] ?? '', 
			$output 
		);
	}

	public function map_to_schema( string $property, $value ): ?array {
		return $this->convert_v4_to_v3_schema( 
			$this->map_to_v4_atomic( $property, $value ) 
		);
	}
}
