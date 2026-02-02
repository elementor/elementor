<?php

namespace Elementor\Modules\CssConverter\Services\GlobalClasses\Unified;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Integration_Service {

	private Global_Classes_Detection_Service $detection_service;
	private Global_Classes_Conversion_Service $conversion_service;
	private Global_Classes_Registration_Service $registration_service;

	public function __construct(
		Global_Classes_Detection_Service $detection_service,
		Global_Classes_Conversion_Service $conversion_service,
		Global_Classes_Registration_Service $registration_service
	) {
		$this->detection_service = $detection_service;
		$this->conversion_service = $conversion_service;
		$this->registration_service = $registration_service;
	}

	public function process_css_rules( array $css_rules, array $css_variable_definitions = [] ): array {
		$start_time = microtime( true );

		$detected = $this->detection_service->detect_css_class_selectors( $css_rules );

		if ( empty( $detected ) ) {
			return [
				'success' => true,
				'detected' => 0,
				'converted' => 0,
				'registered' => 0,
				'skipped' => 0,
				'message' => 'No CSS class selectors found',
				'processing_time' => $this->calculate_processing_time( $start_time ),
				'global_classes' => [],
				'class_name_mappings' => [],
			];
		}

		$converted = $this->conversion_service->convert_to_atomic_props( $detected, $css_variable_definitions );

		if ( empty( $converted ) ) {
			return [
				'success' => true,
				'detected' => count( $detected ),
				'converted' => 0,
				'registered' => 0,
				'skipped' => count( $detected ),
				'message' => 'No properties could be converted to atomic format',
				'processing_time' => $this->calculate_processing_time( $start_time ),
				'global_classes' => [],
				'class_name_mappings' => [],
			];
		}

		$result = $this->registration_service->register_with_elementor( $converted );

		// Build global_classes array with FINAL class names (after duplicate processing)
		$class_name_mappings = $result['class_name_mappings'] ?? [];
		$global_classes = $this->build_global_classes_with_final_names( $converted, $class_name_mappings );
		
		// Collect custom CSS from conversion service
		$custom_css_rules = $this->collect_custom_css_rules( $converted, $class_name_mappings );

	$final_result = [
		'success' => ! isset( $result['error'] ),
		'detected' => count( $detected ),
		'converted' => count( $converted ),
		'registered' => $result['registered'] ?? 0,
		'skipped' => $result['skipped'] ?? 0,
		'processing_time' => $this->calculate_processing_time( $start_time ),
		'class_name_mappings' => $class_name_mappings,
		'global_classes' => $global_classes,
		'custom_css_rules' => $custom_css_rules,
		'debug_duplicate_detection' => $result['debug_duplicate_detection'] ?? null,
	];

		if ( isset( $result['error'] ) ) {
			$final_result['error'] = $result['error'];
			$final_result['message'] = 'Registration failed: ' . $result['error'];
		} else {
			$final_result['message'] = $this->generate_success_message( $final_result );
		}

		if ( isset( $result['total_classes'] ) ) {
			$final_result['total_classes'] = $result['total_classes'];
		}

		return $final_result;
	}

	public function get_detailed_stats( array $css_rules ): array {
		$detection_stats = $this->detection_service->get_detection_stats( $css_rules );
		$detected = $this->detection_service->detect_css_class_selectors( $css_rules );
		$conversion_stats = $this->conversion_service->get_conversion_stats( $detected );
		$repository_stats = $this->registration_service->get_repository_stats();

		return [
			'detection' => $detection_stats,
			'conversion' => $conversion_stats,
			'repository' => $repository_stats,
		];
	}

	public function check_for_duplicates( array $css_rules ): array {
		$detected = $this->detection_service->detect_css_class_selectors( $css_rules );
		$converted = $this->conversion_service->convert_to_atomic_props( $detected );

		return $this->registration_service->check_duplicate_classes( $converted );
	}

	public function validate_css_rules( array $css_rules ): array {
		$validation_result = [
			'valid' => true,
			'errors' => [],
			'warnings' => [],
		];

		if ( empty( $css_rules ) ) {
			$validation_result['warnings'][] = 'No CSS rules provided';
			return $validation_result;
		}

		foreach ( $css_rules as $index => $rule ) {
			if ( ! is_array( $rule ) ) {
				$validation_result['valid'] = false;
				$validation_result['errors'][] = "Rule at index {$index} is not an array";
				continue;
			}

			if ( ! isset( $rule['selector'] ) ) {
				$validation_result['valid'] = false;
				$validation_result['errors'][] = "Rule at index {$index} missing selector";
				continue;
			}

			if ( ! isset( $rule['properties'] ) || ! is_array( $rule['properties'] ) ) {
				$validation_result['valid'] = false;
				$validation_result['errors'][] = "Rule at index {$index} missing or invalid properties";
				continue;
			}
		}

		return $validation_result;
	}

	public function dry_run( array $css_rules ): array {
		$validation = $this->validate_css_rules( $css_rules );

		if ( ! $validation['valid'] ) {
			return [
				'success' => false,
				'errors' => $validation['errors'],
				'message' => 'CSS rules validation failed',
			];
		}

		$detected = $this->detection_service->detect_css_class_selectors( $css_rules );
		$converted = $this->conversion_service->convert_to_atomic_props( $detected );
		$duplicates = $this->registration_service->check_duplicate_classes( $converted );
		$repository_stats = $this->registration_service->get_repository_stats();

		$would_register = count( $duplicates['new_classes'] ?? [] );
		$available_slots = $repository_stats['available_slots'] ?? 0;
		$final_registration_count = min( $would_register, $available_slots );

		return [
			'success' => true,
			'would_detect' => count( $detected ),
			'would_convert' => count( $converted ),
			'would_register' => $final_registration_count,
			'would_skip' => $would_register - $final_registration_count + count( $duplicates['duplicates'] ?? [] ),
			'duplicates' => $duplicates['duplicates'] ?? [],
			'available_slots' => $available_slots,
			'message' => $this->generate_dry_run_message( $final_registration_count, $would_register, $duplicates ),
		];
	}

	private function calculate_processing_time( float $start_time ): float {
		return round( ( microtime( true ) - $start_time ) * 1000, 2 );
	}

	private function generate_success_message( array $result ): string {
		$registered = $result['registered'];
		$detected = $result['detected'];
		$skipped = $result['skipped'];

		if ( 0 === $registered ) {
			return 'No global classes were registered';
		}

		$message = "Successfully registered {$registered} global class";
		if ( $registered > 1 ) {
			$message .= 'es';
		}

		if ( $skipped > 0 ) {
			$message .= " (skipped {$skipped})";
		}

		return $message;
	}

	private function generate_dry_run_message( int $would_register, int $total_convertible, array $duplicates ): string {
		if ( 0 === $would_register ) {
			if ( ! empty( $duplicates['duplicates'] ) ) {
				return 'All detected classes already exist as global classes';
			}
			return 'No classes would be registered';
		}

		$message = "Would register {$would_register} global class";
		if ( $would_register > 1 ) {
			$message .= 'es';
		}

		$duplicate_count = count( $duplicates['duplicates'] ?? [] );
		if ( $duplicate_count > 0 ) {
			$message .= " ({$duplicate_count} already exist)";
		}

		return $message;
	}

	private function build_global_classes_with_final_names( array $converted, array $class_name_mappings ): array {
		$global_classes = [];

		foreach ( $converted as $original_class_name => $class_data ) {
			$final_class_name = $class_name_mappings[ $original_class_name ] ?? $original_class_name;
			$global_classes[ $final_class_name ] = [
				'atomic_props' => $class_data['atomic_props'] ?? [],
				'custom_css' => $class_data['custom_css'] ?? '',
				'source' => $class_data['source'] ?? 'css-converter',
				'original_selector' => $class_data['original_selector'] ?? '.' . $original_class_name,
			];
		}

		return $global_classes;
	}

	private function collect_custom_css_rules( array $converted_classes, array $class_name_mappings ): array {
		$custom_css_rules = [];

		foreach ( $converted_classes as $original_class_name => $class_data ) {
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

		return $custom_css_rules;
	}
}
