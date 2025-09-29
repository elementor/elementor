<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Class_Property_Mapper_Factory;
use Elementor\Modules\CssConverter\Exceptions\Class_Conversion_Exception;

/**
 * CSS Property Conversion Service
 * 
 * Handles general CSS property conversion using the unified property mapper system.
 * This service is used by both class conversion and widget conversion pipelines.
 */
class Css_Property_Conversion_Service {
	private $property_mapper_registry;
	private $conversion_stats;

	public function __construct() {
		$this->property_mapper_registry = Class_Property_Mapper_Factory::get_registry();
		$this->reset_stats();
	}

	/**
	 * Convert a single CSS property to Elementor schema format
	 *
	 * @param string $property CSS property name
	 * @param mixed $value CSS property value
	 * @return array|null Converted property in Elementor schema format, or null if conversion failed
	 */
	// TODO: Replace with atomic widgets approach
	public function convert_property_to_schema( string $property, $value ): ?array {
		$mapper = $this->resolve_property_mapper_safely( $property, $value );
		
		if ( $this->can_convert_to_schema( $mapper ) ) {
			return $this->attempt_schema_conversion( $mapper, $property, $value );
		}
		
		$this->record_conversion_failure( $property, $value, 'No mapper available' );
		return null;
	}

	private function resolve_property_mapper_safely( string $property, $value ): ?object {
		if ( ! $this->property_mapper_registry ) {
			return null;
		}
		
		return $this->property_mapper_registry->resolve( $property, $value );
	}


	private function record_conversion_success(): void {
		$this->conversion_stats['properties_converted']++;
	}

	private function record_conversion_failure( string $property, $value, string $reason ): void {
		$this->conversion_stats['properties_failed']++;
		$this->conversion_stats['unsupported_properties'][] = [
			'property' => $property,
			'value' => $value,
			'reason' => $reason,
		];
	}

	/**
	 * Convert a single CSS property to Elementor v4 atomic format
	 *
	 * @param string $property CSS property name
	 * @param mixed $value CSS property value
	 * @return array|null Converted property in v4 atomic format, or null if conversion failed
	 */
	public function convert_property_to_v4_atomic( string $property, $value ): ?array {
		$mapper = $this->resolve_property_mapper_safely( $property, $value );
		
		if ( $this->can_convert_to_v4_atomic( $mapper ) ) {
			return $this->attempt_v4_atomic_conversion( $mapper, $property, $value );
		}
		
		$this->record_conversion_failure( $property, $value, 'No v4 mapper available' );
		return null;
	}

	/**
	 * Convert a single CSS property to Elementor v4 atomic format with mapped property name
	 *
	 * @param string $property CSS property name
	 * @param mixed $value CSS property value
	 * @return array|null Array with 'property_name' and 'converted_value', or null if conversion failed
	 */
	public function convert_property_to_v4_atomic_with_name( string $property, $value ): ?array {
		$mapper = $this->resolve_property_mapper_safely( $property, $value );
		
		if ( $this->can_convert_to_v4_atomic( $mapper ) ) {
			$converted_value = $this->attempt_v4_atomic_conversion( $mapper, $property, $value );
			
			if ( $converted_value ) {
				// Get the mapped property name (e.g., border-top-left-radius -> border-radius)
				$mapped_property_name = method_exists( $mapper, 'get_v4_property_name' ) 
					? $mapper->get_v4_property_name( $property )
					: $property;
				
				return [
					'property_name' => $mapped_property_name,
					'converted_value' => $converted_value
				];
			}
		}
		
		$this->record_conversion_failure( $property, $value, 'No v4 mapper available' );
		return null;
	}

	private function can_convert_to_v4_atomic( ?object $mapper ): bool {
		return null !== $mapper && method_exists( $mapper, 'map_to_v4_atomic' );
	}

	private function attempt_v4_atomic_conversion( object $mapper, string $property, $value ): ?array {
		$v4_result = $mapper->map_to_v4_atomic( $property, $value );
		
		if ( $this->is_valid_v4_result( $v4_result ) ) {
			$this->record_conversion_success();
			return $v4_result;
		}
		
		$this->record_conversion_failure( $property, $value, 'V4 atomic conversion failed' );
		return null;
	}

	private function is_valid_v4_result( $result ): bool {
		return ! empty( $result ) && is_array( $result );
	}

	/**
	 * Convert multiple CSS properties to schema format
	 *
	 * @param array $properties Array of ['property' => 'value'] pairs
	 * @return array Array of converted properties
	 */
	// TODO: Replace with atomic widgets approach
	public function convert_properties_to_schema( array $properties ): array {
		$converted = [];
		
		foreach ( $properties as $property => $value ) {
			$result = $this->convert_property_to_schema( $property, $value );
			if ( $result ) {
				$converted[ $property ] = $result;
			}
		}
		
		return $converted;
	}

	/**
	 * Convert multiple CSS properties to v4 atomic format
	 *
	 * @param array $properties Array of ['property' => 'value'] pairs
	 * @return array Array of converted properties
	 */
	public function convert_properties_to_v4_atomic( array $properties ): array {
		$converted = [];
		
		foreach ( $properties as $property => $value ) {
			$mapper = $this->resolve_property_mapper_safely( $property, $value );
			$result = $this->convert_property_to_v4_atomic( $property, $value );
			
			if ( $result && $mapper ) {
				// ✅ ATOMIC-COMPLIANT: Use mapper's property name method
				$v4_property_name = method_exists( $mapper, 'get_v4_property_name' ) 
					? $mapper->get_v4_property_name( $property )
					: $property;
				
				// ✅ CRITICAL FIX: Merge Dimensions_Prop_Type structures for multiple margin properties
				if ( isset( $converted[ $v4_property_name ] ) && $this->is_dimensions_prop_type( $result ) && $this->is_dimensions_prop_type( $converted[ $v4_property_name ] ) ) {
					$converted[ $v4_property_name ] = $this->merge_dimensions_prop_types( $converted[ $v4_property_name ], $result );
				} else {
					$converted[ $v4_property_name ] = $result;
				}
			}
		}
		
		return $converted;
	}

	/**
	 * Check if a CSS property is supported for conversion
	 *
	 * @param string $property CSS property name
	 * @param mixed $value CSS property value
	 * @return bool True if supported, false otherwise
	 */
	public function is_property_supported( string $property, $value ): bool {
		$mapper = $this->property_mapper_registry->resolve( $property, $value );
		return $mapper && method_exists( $mapper, 'map_to_v4_atomic' );
	}

	/**
	 * Check if a CSS property supports v4 atomic conversion
	 *
	 * @param string $property CSS property name
	 * @param mixed $value CSS property value
	 * @return bool True if v4 conversion is supported, false otherwise
	 */
	public function supports_v4_conversion( string $property, $value ): bool {
		$mapper = $this->property_mapper_registry->resolve( $property, $value );
		return $mapper && method_exists( $mapper, 'map_to_v4_atomic' );
	}

	/**
	 * Get conversion statistics
	 *
	 * @return array Conversion statistics
	 */
	public function get_conversion_stats(): array {
		return $this->conversion_stats;
	}

	/**
	 * Reset conversion statistics
	 */
	public function reset_stats(): void {
		$this->conversion_stats = [
			'properties_converted' => 0,
			'properties_failed' => 0,
			'unsupported_properties' => [],
		];
	}

	/**
	 * Check if a property result is a Dimensions_Prop_Type
	 */
	private function is_dimensions_prop_type( array $property ): bool {
		return isset( $property['$$type'] ) && 'dimensions' === $property['$$type'];
	}

	/**
	 * Merge two Dimensions_Prop_Type structures
	 */
	private function merge_dimensions_prop_types( array $existing, array $new ): array {
		// Both should have the same $$type: 'dimensions'
		if ( ! $this->is_dimensions_prop_type( $existing ) || ! $this->is_dimensions_prop_type( $new ) ) {
			return $new; // Fallback to new if not both dimensions
		}

		// Merge the value arrays, with new values taking precedence
		$merged_value = array_merge(
			$existing['value'] ?? [],
			$new['value'] ?? []
		);

		return [
			'$$type' => 'dimensions',
			'value' => $merged_value
		];
	}

	/**
	 * Get list of supported CSS properties
	 *
	 * @return array List of supported CSS properties
	 */
	public function get_supported_properties(): array {
		$supported = [];
		$all_mappers = $this->property_mapper_registry->get_all_mappers();
		
		foreach ( $all_mappers as $mapper ) {
			if ( method_exists( $mapper, 'get_supported_properties' ) ) {
				$supported = array_merge( $supported, $mapper->get_supported_properties() );
			}
		}
		
		return array_unique( $supported );
	}
}
