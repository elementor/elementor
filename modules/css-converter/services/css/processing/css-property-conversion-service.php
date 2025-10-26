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

	private function can_convert_to_schema( ?object $mapper ): bool {
		return null !== $mapper && method_exists( $mapper, 'convert_to_schema' );
	}

	/**
	 * Convert multiple CSS properties to v4 atomic format with collision detection
	 */
	public function convert_properties_to_v4_atomic( array $properties ): array {
		// ✅ CRITICAL FIX: Expand shorthand properties before conversion

		$expanded_properties = \Elementor\Modules\CssConverter\Services\Css\Processing\CSS_Shorthand_Expander::expand_shorthand_properties( $properties );

		$converted = [];

		foreach ( $expanded_properties as $property => $value ) {

			$mapper = $this->resolve_property_mapper_safely( $property, $value );
			if ( ! $mapper ) {
				continue;
			}

			$result = $this->convert_property_to_v4_atomic( $property, $value );
			if ( ! $result ) {
				continue;
			}

			if ( $result && $mapper ) {
				// Get the v4 property name
				$v4_property_name = method_exists( $mapper, 'get_v4_property_name' )
					? $mapper->get_v4_property_name( $property )
					: $property;

				// ✅ CRITICAL FIX: Handle margin merging to prevent overwriting
				if ( 'margin' === $v4_property_name && isset( $converted[ $v4_property_name ] ) ) {

					$converted[ $v4_property_name ] = $this->merge_dimensions_values(
						$converted[ $v4_property_name ],
						$result
					);
				} else {
					$converted[ $v4_property_name ] = $result;
				}
			}
		}

		return $converted;
	}
	/**
	 * Merge two dimensions atomic structures (margin, padding)
	 */
	private function merge_dimensions_values( array $existing, array $new ): array {
		// Both should be dimensions type with value containing directional properties
		if ( ! isset( $existing['$$type'] ) || $existing['$$type'] !== 'dimensions' ||
			! isset( $new['$$type'] ) || $new['$$type'] !== 'dimensions' ) {
			return $new; // Fallback to new value
		}

		$merged_value = $existing['value'] ?? [];
		$new_value = $new['value'] ?? [];

		// Merge directional values, with new values taking precedence
		foreach ( $new_value as $direction => $size_data ) {
			if ( null !== $size_data ) {
				$merged_value[ $direction ] = $size_data;
			}
		}

		return [
			'$$type' => 'dimensions',
			'value' => $merged_value,
		];
	}

	private function attempt_schema_conversion( object $mapper, string $property, $value ): ?array {
		if ( method_exists( $mapper, 'convert_to_schema' ) ) {
			$schema_result = $mapper->convert_to_schema( $property, $value );

			if ( $this->is_valid_schema_result( $schema_result ) ) {
				$this->record_conversion_success();
				return $schema_result;
			}
		}

		$this->record_conversion_failure( $property, $value, 'Schema conversion failed' );
		return null;
	}

	private function is_valid_schema_result( $result ): bool {
		return ! empty( $result ) && is_array( $result );
	}
	private function record_conversion_success(): void {
		++$this->conversion_stats['properties_converted'];
	}

	private function record_conversion_failure( string $property, $value, string $reason ): void {
		++$this->conversion_stats['properties_failed'];
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
	 * @param mixed  $value CSS property value
	 * @return array|null Converted property in v4 atomic format, or null if conversion failed
	 */
	public function convert_property_to_v4_atomic( string $property, $value ): ?array {
		// DEBUG: Track font-family processing
		if ( 'font-family' === $property ) {
		}

		if ( $property === 'transform' ) {
		}

		// Add debugging for letter-spacing and text-transform
		if ( in_array( $property, [ 'letter-spacing', 'text-transform' ], true ) ) {
		}

		$mapper = $this->resolve_property_mapper_safely( $property, $value );

		// DEBUG: Track font-family mapper resolution
		if ( 'font-family' === $property ) {
		}

		if ( in_array( $property, [ 'letter-spacing', 'text-transform' ], true ) ) {
		}

		if ( $this->can_convert_to_v4_atomic( $mapper ) ) {
			$result = $this->attempt_v4_atomic_conversion( $mapper, $property, $value );

			if ( in_array( $property, [ 'letter-spacing', 'text-transform' ], true ) ) {
			}

			// DEBUG: Track font-family conversion result
			if ( 'font-family' === $property ) {
				if ( $result ) {
				}
			}

			return $result;
		}

		// DEBUG: Track font-family conversion failure
		if ( 'font-family' === $property ) {
		}

		$this->record_conversion_failure( $property, $value, 'No v4 mapper available' );
		return null;
	}

	/**
	 * Convert a single CSS property to Elementor v4 atomic format with mapped property name
	 *
	 * @param string $property CSS property name
	 * @param mixed  $value CSS property value
	 * @return array|null Array with 'property_name' and 'converted_value', or null if conversion failed
	 */
	public function convert_property_to_v4_atomic_with_name( string $property, $value ): ?array {
		$mapper = $this->resolve_property_mapper_safely( $property, $value );

		if ( $this->can_convert_to_v4_atomic( $mapper ) ) {
			$converted_value = $this->attempt_v4_atomic_conversion( $mapper, $property, $value );

			if ( $converted_value ) {
				// Get the mapped property name (e.g., background-color -> background, border-top-left-radius -> border-radius)
				// Support both method names for backwards compatibility
				$mapped_property_name = $property;
				if ( method_exists( $mapper, 'get_v4_property_name' ) ) {
					$mapped_property_name = $mapper->get_v4_property_name( $property );
				} elseif ( method_exists( $mapper, 'get_target_property_name' ) ) {
					$mapped_property_name = $mapper->get_target_property_name( $property );
				}

				return [
					'property_name' => $mapped_property_name,
					'converted_value' => $converted_value,
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
		if ( $property === 'transform' ) {
		}

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
	 * Check if a CSS property is supported for conversion
	 *
	 * @param string $property CSS property name
	 * @param mixed  $value CSS property value
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
	 * @param mixed  $value CSS property value
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

	private function is_border_width_prop_type( array $property ): bool {
		return isset( $property['$$type'] ) && 'border-width' === $property['$$type'];
	}

	private function is_border_radius_prop_type( array $property ): bool {
		return isset( $property['$$type'] ) && 'border-radius' === $property['$$type'];
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
			'value' => $merged_value,
		];
	}

	/**
	 * Merge two Border_Width_Prop_Type structures
	 */
	private function merge_border_width_prop_types( array $existing, array $new ): array {
		// Both should have the same $$type: 'border-width'
		if ( ! $this->is_border_width_prop_type( $existing ) || ! $this->is_border_width_prop_type( $new ) ) {
			return $new; // Fallback to new if not both border-width
		}

		// Merge the value arrays, with new values taking precedence
		$merged_value = array_merge(
			$existing['value'] ?? [],
			$new['value'] ?? []
		);

		return [
			'$$type' => 'border-width',
			'value' => $merged_value,
		];
	}

	/**
	 * Merge two Border_Radius_Prop_Type structures
	 */
	private function merge_border_radius_prop_types( array $existing, array $new ): array {
		// Both should have the same $$type: 'border-radius'
		if ( ! $this->is_border_radius_prop_type( $existing ) || ! $this->is_border_radius_prop_type( $new ) ) {
			return $new; // Fallback to new if not both border-radius
		}

		// Merge the value arrays, with new values taking precedence
		$merged_value = array_merge(
			$existing['value'] ?? [],
			$new['value'] ?? []
		);

		return [
			'$$type' => 'border-radius',
			'value' => $merged_value,
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
