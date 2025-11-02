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
		file_put_contents( '/tmp/global_classes_debug.log', "GLOBAL_CLASSES_PROCESSOR: Starting process method\n", FILE_APPEND );
		$css_rules = $context->get_metadata( 'css_rules', [] );
		$widgets = $context->get_widgets();

		// PHASE 1: Extract classes actually used in widgets
		$class_extractor = new \Elementor\Modules\CssConverter\Services\Widgets\Widget_Class_Extractor();
		$used_classes = $class_extractor->extract_all_classes_from_widgets( $widgets );

		file_put_contents( '/tmp/global_classes_debug.log', 'Found ' . count( $used_classes ) . ' classes in widgets: ' . implode( ', ', array_slice( $used_classes, 0, 10 ) ) . ( count( $used_classes ) > 10 ? '...' : '' ) . "\n", FILE_APPEND );

		// PHASE 2: Detect and filter CSS classes
		$provider = \Elementor\Modules\CssConverter\Services\GlobalClasses\Unified\Global_Classes_Service_Provider::instance();
		$detection_service = $provider->get_detection_service();

		$all_detected = $detection_service->detect_css_class_selectors( $css_rules );

		// DEBUG: Check for specific classes we expect
		$sample_css_selectors = array_slice( array_keys( $all_detected ), 0, 10 );
		$sample_widget_classes = array_slice( $used_classes, 0, 10 );

		file_put_contents( '/tmp/global_classes_debug.log', 'Sample CSS selectors: ' . implode( ', ', $sample_css_selectors ) . "\n", FILE_APPEND );
		file_put_contents( '/tmp/global_classes_debug.log', 'Sample widget classes: ' . implode( ', ', $sample_widget_classes ) . "\n", FILE_APPEND );

		// Check for specific loading/copy classes
		$has_loading_in_css = isset( $all_detected['loading'] ) || isset( $all_detected['loading--loaded'] ) || isset( $all_detected['loading--loaded-2'] );
		$has_loading_in_widgets = in_array( 'loading', $used_classes, true ) || in_array( 'loading--loaded', $used_classes, true ) || in_array( 'loading--loaded-2', $used_classes, true );
		$has_copy_in_css = isset( $all_detected['copy'] );
		$has_copy_in_widgets = in_array( 'copy', $used_classes, true );

		file_put_contents( '/tmp/global_classes_debug.log', 'Loading in CSS: ' . ( $has_loading_in_css ? 'YES' : 'NO' ) . ', in widgets: ' . ( $has_loading_in_widgets ? 'YES' : 'NO' ) . "\n", FILE_APPEND );
		file_put_contents( '/tmp/global_classes_debug.log', 'Copy in CSS: ' . ( $has_copy_in_css ? 'YES' : 'NO' ) . ', in widgets: ' . ( $has_copy_in_widgets ? 'YES' : 'NO' ) . "\n", FILE_APPEND );

		$filtered_detected = $detection_service->filter_classes_by_usage( $all_detected, $used_classes );

		file_put_contents( '/tmp/global_classes_debug.log', 'Detected ' . count( $all_detected ) . ' classes, filtered to ' . count( $filtered_detected ) . " used classes\n", FILE_APPEND );
		file_put_contents( '/tmp/global_classes_debug.log', 'Filtered classes: ' . implode( ', ', array_keys( $filtered_detected ) ) . "\n", FILE_APPEND );

		// Debug the loading class properties
		if ( isset( $filtered_detected['loading'] ) ) {
			$loading_data = $filtered_detected['loading'];
			file_put_contents( '/tmp/global_classes_debug.log', 'Loading class properties: ' . print_r( $loading_data, true ) . "\n", FILE_APPEND );
		}

		// Debug: Check ALL detected selectors that contain "loading"
		$loading_related = [];
		foreach ( $all_detected as $class_name => $class_data ) {
			if ( false !== strpos( $class_name, 'loading' ) || false !== strpos( $class_data['selector'], 'loading' ) ) {
				$loading_related[] = [
					'class_name' => $class_name,
					'selector' => $class_data['selector'],
				];
			}
		}
		file_put_contents( '/tmp/global_classes_debug.log', 'All loading-related detections: ' . print_r( $loading_related, true ) . "\n", FILE_APPEND );

		// Check if there's a simple .loading selector in css_rules
		$simple_loading_rules = [];
		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';
			if ( '.loading' === $selector || false !== strpos( $selector, '.loading' ) ) {
				$simple_loading_rules[] = [
					'selector' => $selector,
					'property_count' => count( $rule['properties'] ?? [] ),
				];
			}
		}
		file_put_contents( '/tmp/global_classes_debug.log', 'CSS rules with .loading: ' . print_r( $simple_loading_rules, true ) . "\n", FILE_APPEND );

		// PHASE 3: Process filtered classes with duplicate detection
		$global_classes_result = $this->process_global_classes_with_duplicate_detection_from_detected( $filtered_detected );

		file_put_contents( '/tmp/global_classes_debug.log', 'Global classes created: ' . count( $global_classes_result['global_classes'] ?? [] ) . "\n", FILE_APPEND );
		file_put_contents( '/tmp/global_classes_debug.log', 'Overflow styles when maximum number of global classes has been reached: ' . count( $global_classes_result['overflow_styles_when_maximum_number_of_global_classes_has_been_reached'] ?? [] ) . "\n", FILE_APPEND );

		// PHASE 4: Handle overflow classes (apply directly to widgets)
		$overflow_styles_when_maximum_number_of_global_classes_has_been_reached = $global_classes_result['overflow_styles_when_maximum_number_of_global_classes_has_been_reached'] ?? [];

		if ( ! empty( $overflow_styles_when_maximum_number_of_global_classes_has_been_reached ) ) {
			// Store overflow styles for direct application in Style Collection Processor
			$context->set_metadata( 'overflow_styles_when_maximum_number_of_global_classes_has_been_reached', $overflow_styles_when_maximum_number_of_global_classes_has_been_reached );
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

	private function process_global_classes_with_duplicate_detection_from_detected( array $detected_classes ): array {
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

		// Convert detected classes to atomic props
		$converted = $conversion_service->convert_to_atomic_props( $detected_classes );

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
		$result = $registration_service->register_with_elementor( $converted );

		// Build global_classes array with FINAL class names (after duplicate processing)
		$class_name_mappings = $result['class_name_mappings'] ?? [];
		$global_classes = $this->build_global_classes_with_final_names( $detected_classes, $class_name_mappings );

		return [
			'global_classes' => $global_classes,
			'class_name_mappings' => $class_name_mappings,
			'overflow_classes' => $result['overflow_classes'] ?? [],
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

		return [
			'global_classes' => $result['global_classes'] ?? [],
			'class_name_mappings' => $result['class_name_mappings'] ?? [],
			'custom_css_rules' => $result['custom_css_rules'] ?? [],
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
