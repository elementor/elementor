<?php

namespace Elementor\Modules\CssConverter\Services\GlobalClasses\Unified;

use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Conversion_Service {

	private Css_Property_Conversion_Service $property_conversion_service;

	public function __construct( Css_Property_Conversion_Service $property_conversion_service = null ) {
		$this->property_conversion_service = $property_conversion_service ?: new Css_Property_Conversion_Service();
	}

	public function convert_to_atomic_props( array $detected_classes ): array {
		$converted_classes = [];

		foreach ( $detected_classes as $class_name => $class_data ) {
			$atomic_props = $this->convert_properties_to_atomic(
				$class_data['properties']
			);

			// DEBUG: Log conversion results
			error_log( "CSS Converter: Converting class '{$class_name}' to atomic props" );
			error_log( "CSS Converter: Properties count: " . count( $class_data['properties'] ) );
			error_log( "CSS Converter: Atomic props count: " . count( $atomic_props ) );
			
			if ( empty( $atomic_props ) ) {
				error_log( "CSS Converter: Skipping class '{$class_name}' - no atomic props converted" );
				continue;
			}

			$converted_classes[ $class_name ] = [
				'atomic_props' => $atomic_props,
				'source' => $class_data['source'],
				'original_selector' => $class_data['selector'],
			];
			
			error_log( "CSS Converter: Successfully converted class '{$class_name}'" );
		}

		return $converted_classes;
	}

	private function convert_properties_to_atomic( array $properties ): array {
		$atomic_props = [];

		foreach ( $properties as $property_data ) {
			$property = $property_data['property'] ?? '';
			$value = $property_data['value'] ?? '';

			if ( empty( $property ) || empty( $value ) ) {
				continue;
			}

			$converted = $this->property_conversion_service->convert_property_to_v4_atomic(
				$property,
				$value
			);

			if ( $converted && isset( $converted['$$type'] ) ) {
				$atomic_props[ $property ] = $converted;
			}
		}

		return $atomic_props;
	}

	public function get_conversion_stats( array $detected_classes ): array {
		$total_classes = count( $detected_classes );
		$converted_classes = 0;
		$skipped_classes = 0;
		$total_properties = 0;
		$converted_properties = 0;
		$skipped_properties = 0;

		foreach ( $detected_classes as $class_name => $class_data ) {
			$properties = $class_data['properties'] ?? [];
			$total_properties += count( $properties );

			$atomic_props = $this->convert_properties_to_atomic( $properties );

			if ( empty( $atomic_props ) ) {
				++$skipped_classes;
				$skipped_properties += count( $properties );
			} else {
				++$converted_classes;
				$converted_properties += count( $atomic_props );
				$skipped_properties += count( $properties ) - count( $atomic_props );
			}
		}

		return [
			'total_classes' => $total_classes,
			'converted_classes' => $converted_classes,
			'skipped_classes' => $skipped_classes,
			'total_properties' => $total_properties,
			'converted_properties' => $converted_properties,
			'skipped_properties' => $skipped_properties,
			'conversion_rate' => $total_properties > 0 ? round( ( $converted_properties / $total_properties ) * 100, 2 ) : 0,
		];
	}

	public function validate_atomic_props( array $atomic_props ): array {
		$validation_result = [
			'valid' => true,
			'errors' => [],
		];

		foreach ( $atomic_props as $property => $atomic_prop ) {
			if ( ! is_array( $atomic_prop ) ) {
				$validation_result['valid'] = false;
				$validation_result['errors'][] = "Property '{$property}' is not an array";
				continue;
			}

			if ( ! isset( $atomic_prop['$$type'] ) ) {
				$validation_result['valid'] = false;
				$validation_result['errors'][] = "Property '{$property}' missing $$type";
				continue;
			}

			if ( ! isset( $atomic_prop['value'] ) ) {
				$validation_result['valid'] = false;
				$validation_result['errors'][] = "Property '{$property}' missing value";
				continue;
			}
		}

		return $validation_result;
	}
}
