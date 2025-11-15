<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Processor implements Css_Processor_Interface {

	public function get_processor_name(): string {
		return 'global_classes';
	}

	public function get_priority(): int {
		return 81; // After HTML class modifications (80), before style collection
	}

	public function supports_context( Css_Processing_Context $context ): bool {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		return ! empty( $css_rules );
	}

	public function process( Css_Processing_Context $context ): Css_Processing_Context {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		$widgets = $context->get_widgets();

		$class_extractor = new \Elementor\Modules\CssConverter\Services\Widgets\Widget_Class_Extractor();
		$used_classes = $class_extractor->extract_all_classes_from_widgets( $widgets );
		
		if ( in_array( 'brxe-section', $used_classes, true ) ) {
			error_log( 'CSS_CONVERTER_DEBUG: brxe-section found in used_classes: YES' );
		} else {
			error_log( 'CSS_CONVERTER_DEBUG: brxe-section found in used_classes: NO' );
		}
		
		if ( in_array( 'intro-section', $used_classes, true ) ) {
			error_log( 'CSS_CONVERTER_DEBUG: intro-section found in used_classes: YES' );
		} else {
			error_log( 'CSS_CONVERTER_DEBUG: intro-section found in used_classes: NO' );
		}

		$provider = \Elementor\Modules\CssConverter\Services\GlobalClasses\Unified\Global_Classes_Service_Provider::instance();

		$custom_css_collector = $context->get_metadata( 'custom_css_collector' );
		if ( $custom_css_collector ) {
			$provider->set_custom_css_collector( $custom_css_collector );
		}

		$detection_service = $provider->get_detection_service();

		$brxe_section_rules_in_css = 0;
		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';
			if ( strpos( $selector, 'brxe-section' ) !== false ) {
				$brxe_section_rules_in_css++;
				if ( $brxe_section_rules_in_css <= 5 ) {
					error_log( 'CSS_CONVERTER_DEBUG: CSS rule with .brxe-section found: ' . $selector );
					$properties_count = count( $rule['properties'] ?? [] );
					error_log( 'CSS_CONVERTER_DEBUG: .brxe-section rule properties count: ' . $properties_count );
				}
			}
		}
		error_log( 'CSS_CONVERTER_DEBUG: Total CSS rules with .brxe-section: ' . $brxe_section_rules_in_css );
		error_log( 'CSS_CONVERTER_DEBUG: Total CSS rules passed to detection: ' . count( $css_rules ) );

		$all_detected = $detection_service->detect_css_class_selectors( $css_rules );
		error_log( 'CSS_CONVERTER_DEBUG: All detected classes count: ' . count( $all_detected ) );
		if ( isset( $all_detected['brxe-section'] ) ) {
			error_log( 'CSS_CONVERTER_DEBUG: brxe-section found in all_detected: YES' );
			$detected_properties = count( $all_detected['brxe-section']['properties'] ?? [] );
			error_log( 'CSS_CONVERTER_DEBUG: brxe-section detected properties count: ' . $detected_properties );
		} else {
			error_log( 'CSS_CONVERTER_DEBUG: brxe-section found in all_detected: NO' );
		}

		$filtered_detected = $detection_service->filter_classes_by_usage( $all_detected, $used_classes );
		error_log( 'CSS_CONVERTER_DEBUG: Filtered detected classes count: ' . count( $filtered_detected ) );
		if ( isset( $filtered_detected['brxe-section'] ) ) {
			error_log( 'CSS_CONVERTER_DEBUG: brxe-section found in filtered_detected: YES' );
		} else {
			error_log( 'CSS_CONVERTER_DEBUG: brxe-section found in filtered_detected: NO' );
		}
		
		if ( isset( $filtered_detected['intro-section'] ) ) {
			error_log( 'CSS_CONVERTER_DEBUG: intro-section found in filtered_detected: YES' );
		} else {
			error_log( 'CSS_CONVERTER_DEBUG: intro-section found in filtered_detected: NO' );
		}

		$global_classes_result = $this->process_global_classes_with_duplicate_detection_from_detected( $filtered_detected, $context );
		
		error_log( 'CSS_CONVERTER_DEBUG: Global classes result count: ' . count( $global_classes_result['global_classes'] ?? [] ) );
		if ( isset( $global_classes_result['global_classes']['brxe-section'] ) ) {
			error_log( 'CSS_CONVERTER_DEBUG: brxe-section found in global_classes_result: YES' );
			$brxe_properties = count( $global_classes_result['global_classes']['brxe-section']['properties'] ?? [] );
			error_log( 'CSS_CONVERTER_DEBUG: brxe-section global class properties count: ' . $brxe_properties );
		} else {
			error_log( 'CSS_CONVERTER_DEBUG: brxe-section found in global_classes_result: NO' );
			if ( ! empty( $global_classes_result['class_name_mappings'] ) && isset( $global_classes_result['class_name_mappings']['brxe-section'] ) ) {
				error_log( 'CSS_CONVERTER_DEBUG: brxe-section mapped to: ' . $global_classes_result['class_name_mappings']['brxe-section'] );
			}
		}
		
		if ( isset( $global_classes_result['global_classes']['intro-section'] ) ) {
			error_log( 'CSS_CONVERTER_DEBUG: intro-section found in global_classes_result: YES' );
		} else {
			error_log( 'CSS_CONVERTER_DEBUG: intro-section found in global_classes_result: NO' );
			if ( ! empty( $global_classes_result['class_name_mappings'] ) && isset( $global_classes_result['class_name_mappings']['intro-section'] ) ) {
				error_log( 'CSS_CONVERTER_DEBUG: intro-section mapped to: ' . $global_classes_result['class_name_mappings']['intro-section'] );
				$mapped_name = $global_classes_result['class_name_mappings']['intro-section'];
				if ( isset( $global_classes_result['global_classes'][ $mapped_name ] ) ) {
					error_log( 'CSS_CONVERTER_DEBUG: Mapped name found in global_classes: YES' );
				} else {
					error_log( 'CSS_CONVERTER_DEBUG: Mapped name found in global_classes: NO' );
				}
			}
		}

		// PHASE 4: Handle overflow classes (apply directly to widgets as local styles)
		$overflow_styles_when_maximum_number_of_global_classes_has_been_reached = $global_classes_result['overflow_styles_when_maximum_number_of_global_classes_has_been_reached'] ?? [];

		error_log( 'GLOBAL_CLASSES_PROCESSOR: PHASE 4 - Overflow classes from result: ' . count( $overflow_styles_when_maximum_number_of_global_classes_has_been_reached ) );
		if ( ! empty( $overflow_styles_when_maximum_number_of_global_classes_has_been_reached ) ) {
			error_log( 'GLOBAL_CLASSES_PROCESSOR: Overflow classes count: ' . count( $overflow_styles_when_maximum_number_of_global_classes_has_been_reached ) );
			foreach ( array_keys( $overflow_styles_when_maximum_number_of_global_classes_has_been_reached ) as $overflow_class ) {
				if ( strpos( $overflow_class, 'brxw-intro-02' ) !== false ) {
					error_log( 'GLOBAL_CLASSES_PROCESSOR: Overflow class: ' . $overflow_class . ', atomic_props: ' . ( ! empty( $overflow_styles_when_maximum_number_of_global_classes_has_been_reached[ $overflow_class ]['atomic_props'] ) ? 'YES' : 'NO' ) . ', custom_css: ' . ( ! empty( $overflow_styles_when_maximum_number_of_global_classes_has_been_reached[ $overflow_class ]['custom_css'] ) ? substr( $overflow_styles_when_maximum_number_of_global_classes_has_been_reached[ $overflow_class ]['custom_css'], 0, 100 ) : 'NO' ) );
				}
			}
			// Store overflow styles for direct application to widgets (not as global classes)
			$context->set_metadata( 'overflow_styles_when_maximum_number_of_global_classes_has_been_reached', $overflow_styles_when_maximum_number_of_global_classes_has_been_reached );
			$verify_set = $context->get_metadata( 'overflow_styles_when_maximum_number_of_global_classes_has_been_reached', [] );
			error_log( 'GLOBAL_CLASSES_PROCESSOR: Verified overflow set in context, count: ' . count( $verify_set ) );
			if ( isset( $overflow_styles_when_maximum_number_of_global_classes_has_been_reached['intro-section'] ) ) {
				error_log( 'CSS_CONVERTER_DEBUG: intro-section found in overflow_styles: YES' );
			}
		} else {
			error_log( 'GLOBAL_CLASSES_PROCESSOR: PHASE 4 - No overflow classes to set' );
		}

		// Store results in context
		$context->set_metadata( 'global_classes', $global_classes_result['global_classes'] );
		$context->set_metadata( 'class_name_mappings', $global_classes_result['class_name_mappings'] );
		$context->set_metadata( 'custom_css_rules', $global_classes_result['custom_css_rules'] );
		$context->set_metadata( 'debug_duplicate_detection', $global_classes_result['debug_duplicate_detection'] );

		// Add statistics
		$context->add_statistic( 'global_classes_created', count( $global_classes_result['global_classes'] ) );
		$context->add_statistic( 'global_classes_filtered_out', count( $all_detected ) - count( $filtered_detected ) );
		$context->add_statistic( 'global_classes_overflow_styles_when_maximum_number_of_global_classes_has_been_reached', count( $overflow_styles_when_maximum_number_of_global_classes_has_been_reached ) );
		$context->add_statistic( 'class_name_mappings_created', count( $global_classes_result['class_name_mappings'] ) );

		return $context;
	}

	public function get_statistics_keys(): array {
		return [
			'global_classes_created',
			'global_classes_filtered_out',
			'global_classes_overflow_styles_when_maximum_number_of_global_classes_has_been_reached',
			'class_name_mappings_created',
		];
	}

	private function process_global_classes_with_duplicate_detection_from_detected( array $detected_classes, Css_Processing_Context $context ): array {
		$provider = \Elementor\Modules\CssConverter\Services\GlobalClasses\Unified\Global_Classes_Service_Provider::instance();

		if ( ! $provider->is_available() ) {
			return [
				'global_classes' => [],
				'class_name_mappings' => [],
				'overflow_classes' => [],
				'debug_duplicate_detection' => [
					'error' => 'Global Classes Service Provider not available',
				],
			];
		}

		$integration_service = $provider->get_integration_service();
		$conversion_service = $provider->get_conversion_service();
		$registration_service = $provider->get_registration_service();

		$css_variable_definitions = $context->get_metadata( 'css_variable_definitions', [] );

		// Convert detected classes to atomic props
		$converted = $conversion_service->convert_to_atomic_props( $detected_classes, $css_variable_definitions );

		if ( empty( $converted ) ) {
			return [
				'global_classes' => [],
				'class_name_mappings' => [],
				'overflow_classes' => [],
				'debug_duplicate_detection' => [
					'message' => 'No properties could be converted to atomic format',
				],
			];
		}

		// Register with Elementor (includes overflow handling)
		error_log( 'GLOBAL_CLASSES_PROCESSOR: Calling register_with_elementor with ' . count( $converted ) . ' classes' );
		if ( isset( $converted['brxw-intro-02'] ) ) {
			error_log( 'GLOBAL_CLASSES_PROCESSOR: brxw-intro-02 in converted classes: YES' );
		}
		$result = $registration_service->register_with_elementor( $converted );
		error_log( 'GLOBAL_CLASSES_PROCESSOR: Registration result: ' . print_r( $result, true ) );
		
		if ( ! empty( $result['class_name_mappings'] ) ) {
			foreach ( $result['class_name_mappings'] as $original => $mapped ) {
				if ( strpos( $original, 'brxw-intro-02' ) !== false || strpos( $mapped, 'brxw-intro-02' ) !== false ) {
					error_log( 'GLOBAL_CLASSES_PROCESSOR: Mapping: ' . $original . ' => ' . $mapped );
				}
			}
		}

		// Build global_classes array with FINAL class names (after duplicate processing)
		$class_name_mappings = $result['class_name_mappings'] ?? [];
		$global_classes = $this->build_global_classes_with_final_names( $detected_classes, $class_name_mappings );

		// Collect custom CSS rules using the same logic as process_css_rules
		$custom_css_rules = [];
		foreach ( $converted as $original_class_name => $class_data ) {
			$custom_css = $class_data['custom_css'] ?? '';

			if ( ! empty( $custom_css ) ) {
				$final_class_name = $class_name_mappings[ $original_class_name ] ?? $original_class_name;
				$custom_css_rules[ $final_class_name ] = [
					'selector' => ".elementor .{$final_class_name}",
					'css' => $custom_css,
					'original_class' => $original_class_name,
				];
			}
		}

		return [
			'global_classes' => $global_classes,
			'class_name_mappings' => $class_name_mappings,
			'overflow_styles_when_maximum_number_of_global_classes_has_been_reached' => $result['overflow_styles_when_maximum_number_of_global_classes_has_been_reached'] ?? [],
			'custom_css_rules' => $custom_css_rules,
			'debug_duplicate_detection' => $result['debug_duplicate_detection'] ?? [],
		];
	}

	private function process_global_classes_with_duplicate_detection( array $css_rules ): array {
		$provider = \Elementor\Modules\CssConverter\Services\GlobalClasses\Unified\Global_Classes_Service_Provider::instance();

		if ( ! $provider->is_available() ) {
			return [
				'global_classes' => [],
				'class_name_mappings' => [],
				'debug_duplicate_detection' => null,
			];
		}

		// Process CSS rules to create global classes
		$integration_service = $provider->get_integration_service();
		$result = $integration_service->process_css_rules( $css_rules );

		$custom_css_rules = $result['custom_css_rules'] ?? [];

		return [
			'global_classes' => $result['global_classes'] ?? [],
			'class_name_mappings' => $result['class_name_mappings'] ?? [],
			'custom_css_rules' => $custom_css_rules,
			'debug_duplicate_detection' => $result['debug_duplicate_detection'] ?? null,
		];
	}

	private function build_global_classes_with_final_names( array $detected_classes, array $class_name_mappings ): array {
		$global_classes = [];

		foreach ( $detected_classes as $original_class_name => $class_data ) {
			$final_class_name = $class_name_mappings[ $original_class_name ] ?? $original_class_name;
			$global_classes[ $final_class_name ] = $class_data;
		}

		return $global_classes;
	}
}
