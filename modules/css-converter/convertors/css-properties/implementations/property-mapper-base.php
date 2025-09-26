<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Contracts\Property_Mapper_Interface;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Property_Mapper_Base implements Property_Mapper_Interface {
	
	public function supports( string $property, $value = null ): bool {
		return in_array( $property, $this->get_supported_properties(), true );
	}

	/**
	 * 🚫 ATOMIC-ONLY ENFORCEMENT: This method is FORBIDDEN
	 * 
	 * This method creates string fallbacks which violates atomic-only compliance.
	 * Use create_v4_property_with_type() with specific atomic types instead.
	 * 
	 * @throws \Exception Always throws to prevent string fallbacks
	 */
	protected function create_v4_property( string $property, $value ): array {
		throw new \Exception( 
			"ATOMIC-ONLY VIOLATION: create_v4_property() is forbidden. " .
			"Use create_v4_property_with_type() with specific atomic types. " .
			"Property: {$property}, Value: " . var_export( $value, true )
		);
	}


	protected function create_v4_property_with_type( string $property, string $type, $value ): array {
		$atomic_value = $this->create_atomic_structure( $type, $value );
		$validated_value = $this->validate_with_atomic_widgets( $type, $atomic_value );
		
		return $this->build_property_response( $property, $validated_value ?? $atomic_value );
	}

	private function create_atomic_structure( string $type, $value ): array {
		return [
			'$$type' => $type,
			'value' => $value
		];
	}

	private function build_property_response( string $property, array $atomic_value ): array {
		return [
			'property' => $property,
			'value' => $atomic_value
		];
	}
	
	protected function validate_with_atomic_widgets( string $type, array $atomic_value ): ?array {
		$validation_result = $this->validate_atomic_type_safely( $type, $atomic_value );
		
		if ( $this->is_validation_successful( $validation_result ) ) {
			return $validation_result;
		}
		
		$this->handle_validation_failure( $type );
		return null;
	}

	private function validate_atomic_type_safely( string $type, array $atomic_value ): ?array {
		if ( ! $this->is_supported_atomic_type( $type ) ) {
			return null;
		}
		
		return $this->validate_atomic_type( $type, $atomic_value );
	}

	private function is_validation_successful( $result ): bool {
		return null !== $result && is_array( $result );
	}

	private function is_supported_atomic_type( string $type ): bool {
		$supported_types = [ 'size', 'dimensions', 'color', 'border-radius', 'box-shadow', 'string' ];
		return in_array( $type, $supported_types, true );
	}

	private function handle_validation_failure( string $type ): void {
		error_log( "Atomic widget validation failed for type: {$type}" );
	}

	private function validate_atomic_type( string $type, array $atomic_value ): ?array {
		switch ( $type ) {
			case 'size':
				return $this->validate_size_type( $atomic_value );
			case 'dimensions':
				return $this->validate_dimensions_type( $atomic_value );
			case 'color':
				return $this->validate_color_type( $atomic_value );
			case 'border-radius':
				return $this->validate_border_radius_type( $atomic_value );
			case 'box-shadow':
				return $this->validate_box_shadow_type( $atomic_value );
			case 'string':
				return $this->validate_string_type( $atomic_value );
		}
		return null;
	}

	private function validate_size_type( array $atomic_value ): ?array {
		$prop_type = \Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type::make();
		if ( $prop_type->validate( $atomic_value ) ) {
			return $prop_type->sanitize( $atomic_value );
		}
		return null;
	}

	private function validate_dimensions_type( array $atomic_value ): ?array {
		$prop_type = \Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type::make();
		if ( $prop_type->validate( $atomic_value ) ) {
			return $prop_type->sanitize( $atomic_value );
		}
		return null;
	}

	private function validate_color_type( array $atomic_value ): ?array {
		$prop_type = \Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type::make();
		if ( $prop_type->validate( $atomic_value ) ) {
			return $prop_type->sanitize( $atomic_value );
		}
		return null;
	}

	private function validate_border_radius_type( array $atomic_value ): ?array {
		$prop_type = \Elementor\Modules\AtomicWidgets\PropTypes\Border_Radius_Prop_Type::make();
		if ( $prop_type->validate( $atomic_value ) ) {
			return $prop_type->sanitize( $atomic_value );
		}
		return null;
	}

	private function validate_box_shadow_type( array $atomic_value ): ?array {
		$prop_type = \Elementor\Modules\AtomicWidgets\PropTypes\Box_Shadow_Prop_Type::make();
		if ( $prop_type->validate( $atomic_value ) ) {
			return $prop_type->sanitize( $atomic_value );
		}
		return null;
	}

	private function validate_string_type( array $atomic_value ): ?array {
		$prop_type = \Elementor\Modules\AtomicWidgets\PropTypes\String_Prop_Type::make();
		if ( $prop_type->validate( $atomic_value ) ) {
			return $prop_type->sanitize( $atomic_value );
		}
		return null;
	}

	private function log_validation_error( string $type, \Exception $e ): void {
		error_log( "Atomic widget validation failed for type $type: " . $e->getMessage() );
	}

	protected function parse_size_value( string $value ): array {
		$value = trim( $value );
		
		if ( preg_match( '/^(-?\d*\.?\d+)(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax)?$/i', $value, $matches ) ) {
			$size = (float) $matches[1];
			$unit = $matches[2] ?? 'px';
			
			return [
				'size' => $size,
				'unit' => strtolower( $unit )
			];
		}
		
		return [
			'size' => 0.0,
			'unit' => 'px'
		];
	}

	protected function parse_color_value( string $value ): string {
		$value = trim( $value );
		
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

		return $named_colors[ strtolower( $value ) ] ?? $value;
	}

	protected function is_valid_css_value( $value ): bool {
		return is_string( $value ) && ! empty( trim( $value ) );
	}


	abstract public function get_supported_properties(): array;
	abstract public function map_to_v4_atomic( string $property, $value ): ?array;
}
