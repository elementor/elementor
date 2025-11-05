<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Class_Property_Mapper_Factory;
use Elementor\Modules\CssConverter\Exceptions\Class_Conversion_Exception;
use Elementor\Modules\CssConverter\Services\Css\Processing\CSS_Shorthand_Expander;
use Elementor\Modules\CssConverter\Services\Css\Atomic_Property_Validator;
use Elementor\Modules\CssConverter\Services\Css\Custom_Css_Collector;

/**
 * CSS Property Conversion Service
 *
 * Handles general CSS property conversion using the unified property mapper system.
 * This service is used by both class conversion and widget conversion pipelines.
 */
class Css_Property_Conversion_Service {
	private $property_mapper_registry;
	private $conversion_stats;
	private $validator;
	private $custom_css_collector;

	public function __construct( Custom_Css_Collector $custom_css_collector = null ) {
		$this->property_mapper_registry = Class_Property_Mapper_Factory::get_registry();
		$this->validator = new Atomic_Property_Validator();
		$this->custom_css_collector = $custom_css_collector ?? new Custom_Css_Collector();
		$this->reset_stats();
	}

	/**
	 * Convert a CSS property to atomic format with custom CSS fallback
	 *
	 * @param string $property CSS property name
	 * @param string $value CSS property value
	 * @param string $widget_id Widget ID for custom CSS collection
	 * @param bool   $important Whether the property has !important flag
	 * @return array|null Converted property in atomic format, or null if sent to custom CSS
	 */
	private function add_to_custom_css( string $widget_id, string $property, string $value, bool $important, string $reason ): void {
		// DEBUG: Track position absolute being added
		if ( $property === 'position' && $value === 'absolute' ) {
			$debug_file = WP_CONTENT_DIR . '/position-absolute-trace.log';
			file_put_contents( $debug_file, "\n" . str_repeat( '!', 80 ) . "\n", FILE_APPEND );
			file_put_contents( $debug_file, "POSITION ABSOLUTE BEING ADDED\n", FILE_APPEND );
			file_put_contents( $debug_file, 'Time: ' . date( 'Y-m-d H:i:s' ) . "\n", FILE_APPEND );
			file_put_contents( $debug_file, "Widget ID: {$widget_id}\n", FILE_APPEND );
			file_put_contents( $debug_file, "Property: {$property}\n", FILE_APPEND );
			file_put_contents( $debug_file, "Value: {$value}\n", FILE_APPEND );
			file_put_contents( $debug_file, "Reason: {$reason}\n", FILE_APPEND );

			$backtrace = debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS, 8 );
			file_put_contents( $debug_file, "STACK TRACE:\n", FILE_APPEND );
			foreach ( $backtrace as $i => $trace ) {
				$file = basename( $trace['file'] ?? 'unknown' );
				$line = $trace['line'] ?? 'unknown';
				$function = $trace['function'] ?? 'unknown';
				$class = isset( $trace['class'] ) ? $trace['class'] . '::' : '';
				file_put_contents( $debug_file, "  [{$i}] {$file}:{$line} {$class}{$function}()\n", FILE_APPEND );
			}
			file_put_contents( $debug_file, str_repeat( '!', 80 ) . "\n", FILE_APPEND );
		}

		$this->custom_css_collector->add_property( $widget_id, $property, $value, $important );

		$tracking_log = WP_CONTENT_DIR . '/css-property-tracking.log';
		file_put_contents(
			$tracking_log,
			date( '[H:i:s] ' ) . "CSS_PROPERTY_CONVERSION: {$property}: {$value} → Custom CSS ({$reason})\n",
			FILE_APPEND
		);
	}

	public function get_custom_css_collector(): Custom_Css_Collector {
		return $this->custom_css_collector;
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
		$expanded_properties = CSS_Shorthand_Expander::expand_shorthand_properties( $properties );

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
				$v4_property_name = method_exists( $mapper, 'get_v4_property_name' )
					? $mapper->get_v4_property_name( $property )
					: $property;

				$is_dimensions_property = in_array( $v4_property_name, [ 'margin', 'padding' ], true );

				if ( $is_dimensions_property && isset( $converted[ $v4_property_name ] ) ) {
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
	public function convert_property_to_v4_atomic( string $property, $value, string $widget_id = null, bool $important = false ): ?array {
		if ( strpos( $property, '--' ) === 0 ) {
			return null;
		}

		if ( $property === 'align-self' ) {
			$log_file = WP_CONTENT_DIR . '/align-self-debug.log';
			file_put_contents( $log_file, "\n  📍 CSS_PROPERTY_CONVERSION_SERVICE::convert_property_to_v4_atomic()\n", FILE_APPEND );
			file_put_contents( $log_file, "    Property: {$property}\n", FILE_APPEND );
			file_put_contents( $log_file, "    Value: '{$value}'\n", FILE_APPEND );
			file_put_contents( $log_file, '    Widget ID: ' . ( $widget_id ?? 'null' ) . "\n", FILE_APPEND );
			file_put_contents( $log_file, '    Validator exists: ' . ( $this->validator ? 'YES' : 'NO' ) . "\n", FILE_APPEND );
		}

		if ( $widget_id && $this->validator ) {
			if ( ! $this->validator->is_property_supported( $property ) ) {
				if ( $property === 'align-self' ) {
					$log_file = WP_CONTENT_DIR . '/align-self-debug.log';
					file_put_contents( $log_file, "    ❌ VALIDATOR: Property NOT supported in atomic schema\n", FILE_APPEND );
				}
				$this->add_to_custom_css( $widget_id, $property, $value, $important, 'Property not in atomic schema' );
				return null;
			}

			if ( $property === 'align-self' ) {
				$log_file = WP_CONTENT_DIR . '/align-self-debug.log';
				file_put_contents( $log_file, "    ✅ VALIDATOR: Property IS supported\n", FILE_APPEND );
				file_put_contents( $log_file, "    → Checking if value '{$value}' is supported...\n", FILE_APPEND );
			}

			if ( ! $this->validator->is_value_supported( $property, $value ) ) {
				$reason = $this->validator->get_unsupported_reason( $property, $value );

				if ( $property === 'align-self' ) {
					$log_file = WP_CONTENT_DIR . '/align-self-debug.log';
					file_put_contents( $log_file, "    ❌ VALIDATOR: Value '{$value}' NOT supported\n", FILE_APPEND );
					file_put_contents( $log_file, "    Reason: {$reason}\n", FILE_APPEND );
					file_put_contents( $log_file, "    → Will be sent to custom CSS\n", FILE_APPEND );
				}

				$this->add_to_custom_css( $widget_id, $property, $value, $important, $reason );
				return null;
			}

			if ( $property === 'align-self' ) {
				$log_file = WP_CONTENT_DIR . '/align-self-debug.log';
				file_put_contents( $log_file, "    ✅ VALIDATOR: Value '{$value}' IS supported\n", FILE_APPEND );
			}
		}

		$mapper = $this->resolve_property_mapper_safely( $property, $value );

		if ( $property === 'align-self' ) {
			$log_file = WP_CONTENT_DIR . '/align-self-debug.log';
			file_put_contents( $log_file, '    Mapper resolved: ' . ( $mapper ? get_class( $mapper ) : 'NULL' ) . "\n", FILE_APPEND );
		}

		if ( $this->can_convert_to_v4_atomic( $mapper ) ) {
			if ( $property === 'align-self' ) {
				$log_file = WP_CONTENT_DIR . '/align-self-debug.log';
				file_put_contents( $log_file, "    ✅ Mapper CAN convert to v4 atomic\n", FILE_APPEND );
				file_put_contents( $log_file, "    → Attempting conversion...\n", FILE_APPEND );
			}

			try {
				$result = $this->attempt_v4_atomic_conversion( $mapper, $property, $value );

				if ( $property === 'align-self' ) {
					$log_file = WP_CONTENT_DIR . '/align-self-debug.log';
					if ( $result ) {
						file_put_contents( $log_file, "    ✅ MAPPER CONVERSION SUCCESS\n", FILE_APPEND );
						file_put_contents( $log_file, '    Result: ' . json_encode( $result, JSON_PRETTY_PRINT ) . "\n", FILE_APPEND );
					} else {
						file_put_contents( $log_file, "    ❌ MAPPER CONVERSION FAILED (returned null/false)\n", FILE_APPEND );
					}
				}

				// DEBUG: Track position absolute being converted to atomic props
				if ( $property === 'position' && $value === 'absolute' && $result ) {
					$debug_file = WP_CONTENT_DIR . '/position-absolute-trace.log';
					file_put_contents( $debug_file, "\n" . str_repeat( '#', 80 ) . "\n", FILE_APPEND );
					file_put_contents( $debug_file, "POSITION ABSOLUTE CONVERTED TO ATOMIC PROPS\n", FILE_APPEND );
					file_put_contents( $debug_file, 'Time: ' . date( 'Y-m-d H:i:s' ) . "\n", FILE_APPEND );
					file_put_contents( $debug_file, "Widget ID: {$widget_id}\n", FILE_APPEND );
					file_put_contents( $debug_file, "Property: {$property}\n", FILE_APPEND );
					file_put_contents( $debug_file, "Value: {$value}\n", FILE_APPEND );
					file_put_contents( $debug_file, 'Atomic Result: ' . json_encode( $result, JSON_PRETTY_PRINT ) . "\n", FILE_APPEND );

					$backtrace = debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS, 8 );
					file_put_contents( $debug_file, "STACK TRACE:\n", FILE_APPEND );
					foreach ( $backtrace as $i => $trace ) {
						$file = basename( $trace['file'] ?? 'unknown' );
						$line = $trace['line'] ?? 'unknown';
						$function = $trace['function'] ?? 'unknown';
						$class = isset( $trace['class'] ) ? $trace['class'] . '::' : '';
						file_put_contents( $debug_file, "  [{$i}] {$file}:{$line} {$class}{$function}()\n", FILE_APPEND );
					}
					file_put_contents( $debug_file, str_repeat( '#', 80 ) . "\n", FILE_APPEND );
				}

				if ( $result ) {
					return $result;
				}
			} catch ( \Exception $e ) {
				if ( $property === 'align-self' ) {
					$log_file = WP_CONTENT_DIR . '/align-self-debug.log';
					file_put_contents( $log_file, '    ❌ EXCEPTION during conversion: ' . $e->getMessage() . "\n", FILE_APPEND );
				}

				if ( $widget_id ) {
					$this->add_to_custom_css( $widget_id, $property, $value, $important, 'Conversion failed: ' . $e->getMessage() );
				}
				return null;
			}
		} elseif ( $property === 'align-self' ) {
				$log_file = WP_CONTENT_DIR . '/align-self-debug.log';
				file_put_contents( $log_file, "    ❌ Mapper CANNOT convert to v4 atomic\n", FILE_APPEND );
		}

		if ( $property === 'align-self' ) {
			$log_file = WP_CONTENT_DIR . '/align-self-debug.log';
			file_put_contents( $log_file, "    → Reached end of conversion (no result)\n", FILE_APPEND );
			file_put_contents( $log_file, '    → ' . ( $widget_id ? 'Will be sent to custom CSS' : 'Will be dropped (no widget_id)' ) . "\n", FILE_APPEND );
		}

		if ( $widget_id ) {
			$this->add_to_custom_css( $widget_id, $property, $value, $important, 'No property mapper found' );
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
