<?php
namespace Elementor\Modules\CssConverter\Services\AtomicWidgetsV2;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Property_Mapper_Factory;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CSS_To_Atomic_Props_Converter {

	private Property_Mapper_Factory $property_mapper_factory;

	public function __construct() {
		$this->property_mapper_factory = new Property_Mapper_Factory();
	}

	public function convert_css_to_atomic_prop( string $property, $value ): ?array {
		
		if ( empty( $property ) || $value === null || $value === '' ) {
			return null;
		}

		$mapper = $this->get_property_mapper( $property );
		if ( ! $mapper ) {
			return null;
		}

		$result = $mapper->map_to_v4_atomic( $property, $value );
		return $result;
	}

	public function convert_multiple_css_props( array $css_properties ): array {
		// ✅ CRITICAL FIX: Expand shorthand properties before conversion
		// This ensures class-based CSS shorthand (like border: 1px solid #dee2e6) gets expanded
		// to individual properties (border-width, border-style, border-color) just like inline CSS
		require_once __DIR__ . '/../css/processing/css-shorthand-expander.php';
		
		$expanded_properties = \Elementor\Modules\CssConverter\Services\Css\Processing\CSS_Shorthand_Expander::expand_shorthand_properties( $css_properties );
		
		$atomic_props = [];

		foreach ( $expanded_properties as $property => $value ) {
			
			$atomic_prop = $this->convert_css_to_atomic_prop( $property, $value );
			if ( $atomic_prop ) {
				$target_property = $this->get_target_property_name( $property );
				
				// ✅ CRITICAL FIX: Merge dimensions properties instead of overwriting
				if ( isset( $atomic_props[ $target_property ] ) && $this->is_dimensions_property( $atomic_prop ) ) {
					
					$atomic_props[ $target_property ] = $this->merge_dimensions_properties( 
						$atomic_props[ $target_property ], 
						$atomic_prop 
					);
					
				} else {
					$atomic_props[ $target_property ] = $atomic_prop;
				}
			} else {
			}
		}

		return $atomic_props;
	}

	private function get_target_property_name( string $property ): string {
		$mapper = $this->get_property_mapper( $property );
		
		if ( $mapper && method_exists( $mapper, 'get_target_property_name' ) ) {
			return $mapper->get_target_property_name( $property );
		}
		
		return $property;
	}

	public function is_supported_property( string $property ): bool {
		$mapper = $this->get_property_mapper( $property );
		return $mapper !== null;
	}

	public function get_supported_properties(): array {
		return $this->property_mapper_factory->get_supported_properties();
	}

	public function validate_atomic_prop( array $atomic_prop ): bool {
		if ( ! isset( $atomic_prop['$$type'] ) || ! isset( $atomic_prop['value'] ) ) {
			return false;
		}

		return $this->validate_atomic_prop_structure( $atomic_prop );
	}

	private function get_property_mapper( string $property ) {
		return $this->property_mapper_factory->get_mapper( $property );
	}

	private function is_dimensions_property( array $atomic_prop ): bool {
		return isset( $atomic_prop['$$type'] ) && $atomic_prop['$$type'] === 'dimensions';
	}

	private function merge_dimensions_properties( array $existing, array $new ): array {
		// Both properties should be dimensions type
		if ( ! $this->is_dimensions_property( $existing ) || ! $this->is_dimensions_property( $new ) ) {
			return $new; // Fallback to overwrite if not dimensions
		}

		$merged_value = $existing['value'] ?? [];
		$new_value = $new['value'] ?? [];

		// Merge the directional values, preserving existing values and adding new ones
		foreach ( ['block-start', 'block-end', 'inline-start', 'inline-end'] as $direction ) {
			if ( isset( $new_value[ $direction ] ) && $new_value[ $direction ] !== null ) {
				// New value takes precedence
				$merged_value[ $direction ] = $new_value[ $direction ];
			}
			// Keep existing value if no new value provided
			// Ensure all directions are present (with null if not set)
			if ( ! isset( $merged_value[ $direction ] ) ) {
				$merged_value[ $direction ] = null;
			}
		}

		return [
			'$$type' => 'dimensions',
			'value' => $merged_value
		];
	}

	private function validate_atomic_prop_structure( array $atomic_prop ): bool {
		$type = $atomic_prop['$$type'];
		$value = $atomic_prop['value'];

		switch ( $type ) {
			case 'size':
				return $this->validate_size_prop( $value );
			case 'color':
				return $this->validate_color_prop( $value );
			case 'dimensions':
				return $this->validate_dimensions_prop( $value );
			case 'string':
				return is_string( $value );
			case 'background':
				return $this->validate_background_prop( $value );
			case 'box-shadow':
				return $this->validate_box_shadow_prop( $value );
			case 'border-radius':
				return $this->validate_border_radius_prop( $value );
			default:
				return true; // Allow unknown types for extensibility
		}
	}

	private function validate_size_prop( $value ): bool {
		if ( ! is_array( $value ) ) {
			return false;
		}

		return isset( $value['size'] ) && 
			   isset( $value['unit'] ) && 
			   is_numeric( $value['size'] ) && 
			   is_string( $value['unit'] );
	}

	private function validate_color_prop( $value ): bool {
		return is_string( $value ) && preg_match( '/^#[0-9a-fA-F]{6}$/', $value );
	}

	private function validate_dimensions_prop( $value ): bool {
		if ( ! is_array( $value ) ) {
			return false;
		}

		$logical_properties = ['block-start', 'inline-end', 'block-end', 'inline-start'];
		
		foreach ( $logical_properties as $prop ) {
			if ( isset( $value[ $prop ] ) ) {
				if ( ! $this->validate_nested_atomic_prop( $value[ $prop ], 'size' ) ) {
					return false;
				}
			}
		}

		return true;
	}

	private function validate_background_prop( $value ): bool {
		if ( ! is_array( $value ) ) {
			return false;
		}

		// Basic background validation - can be extended
		return true;
	}

	private function validate_box_shadow_prop( $value ): bool {
		if ( ! is_array( $value ) ) {
			return false;
		}

		// Validate array of shadow objects
		foreach ( $value as $shadow ) {
			if ( ! $this->validate_nested_atomic_prop( $shadow, 'shadow' ) ) {
				return false;
			}
		}

		return true;
	}

	private function validate_border_radius_prop( $value ): bool {
		if ( ! is_array( $value ) ) {
			return false;
		}

		$corner_properties = ['start-start', 'start-end', 'end-start', 'end-end'];
		
		foreach ( $corner_properties as $corner ) {
			if ( isset( $value[ $corner ] ) ) {
				if ( ! $this->validate_nested_atomic_prop( $value[ $corner ], 'size' ) ) {
					return false;
				}
			}
		}

		return true;
	}

	private function validate_nested_atomic_prop( $prop, string $expected_type ): bool {
		if ( ! is_array( $prop ) ) {
			return false;
		}

		if ( ! isset( $prop['$$type'] ) || $prop['$$type'] !== $expected_type ) {
			return false;
		}

		return isset( $prop['value'] );
	}
}
