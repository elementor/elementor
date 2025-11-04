<?php

namespace Elementor\Modules\CssConverter\Services\GlobalClasses\Unified;

use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service;
use Elementor\Modules\CssConverter\Services\Css\Custom_Css_Collector;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Conversion_Service {

	private Css_Property_Conversion_Service $property_conversion_service;
	private Custom_Css_Collector $custom_css_collector;

	public function __construct( Css_Property_Conversion_Service $property_conversion_service = null, Custom_Css_Collector $custom_css_collector = null ) {
		$this->custom_css_collector = $custom_css_collector ?: new Custom_Css_Collector();
		$this->property_conversion_service = $property_conversion_service ?: new Css_Property_Conversion_Service( $this->custom_css_collector );
	}

	public function convert_to_atomic_props( array $detected_classes ): array {
		$converted_classes = [];

		foreach ( $detected_classes as $class_name => $class_data ) {
			
			$result = $this->convert_properties_to_atomic_with_fallback(
				$class_data['properties'],
				$class_name
			);

			$atomic_props = $result['atomic_props'];
			$custom_css = $result['custom_css'];

			// Include class even if only custom CSS (no atomic props)
			if ( ! empty( $atomic_props ) || ! empty( $custom_css ) ) {
				$converted_classes[ $class_name ] = [
					'atomic_props' => $atomic_props,
					'custom_css' => $custom_css,
					'source' => $class_data['source'],
					'original_selector' => $class_data['selector'],
				];
			}
		}

		return $converted_classes;
	}

	private function convert_properties_to_atomic_with_fallback( array $properties, string $class_name ): array {
		$atomic_props = [];
		
		foreach ( $properties as $property_data ) {
			$property = $property_data['property'] ?? '';
			$value = $property_data['value'] ?? '';
			$important = $property_data['important'] ?? false;

			if ( empty( $property ) || empty( $value ) ) {
				continue;
			}

			$converted = $this->property_conversion_service->convert_property_to_v4_atomic(
				$property,
				$value,
				$class_name,
				$important
			);

			if ( $converted && isset( $converted['$$type'] ) ) {
				$atomic_props[ $property ] = $converted;
			}
		}

		// Get custom CSS for this class
		$has_custom = $this->custom_css_collector->has_custom_css( $class_name );
		error_log( "CUSTOM_CSS_DEBUG: convert_properties_to_atomic_with_fallback - class_name={$class_name}, has_custom={$has_custom}" );
		
		$custom_css = $has_custom 
			? $this->custom_css_collector->get_custom_css_for_widget( $class_name )
			: '';
		
		error_log( "CUSTOM_CSS_DEBUG: convert_properties_to_atomic_with_fallback - class_name={$class_name}, custom_css=" . ( $custom_css ?: 'EMPTY' ) );

		return [
			'atomic_props' => $atomic_props,
			'custom_css' => $custom_css,
		];
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

			// DEBUG: Log conversion attempts
			if ( $converted && isset( $converted['$$type'] ) ) {
				$atomic_props[ $property ] = $converted;
			} else {
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
