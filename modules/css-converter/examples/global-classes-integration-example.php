<?php

namespace Elementor\Modules\CssConverter\Examples;

use Elementor\Modules\CssConverter\Services\GlobalClasses\Unified\Global_Classes_Service_Provider;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Integration_Example {
	
	public static function example_usage(): array {
		// Get the service provider
		$provider = Global_Classes_Service_Provider::instance();
		
		// Check if services are available
		if ( ! $provider->is_available() ) {
			return [
				'success' => false,
				'error' => 'Required dependencies not available',
				'status' => $provider->get_service_status(),
			];
		}
		
		// Example CSS rules from parsed CSS
		$css_rules = [
			[
				'selector' => '.custom-button',
				'properties' => [
					[ 'property' => 'background-color', 'value' => '#007bff' ],
					[ 'property' => 'color', 'value' => '#ffffff' ],
					[ 'property' => 'padding', 'value' => '10px 20px' ],
					[ 'property' => 'border-radius', 'value' => '4px' ],
				],
			],
			[
				'selector' => '.custom-text',
				'properties' => [
					[ 'property' => 'font-size', 'value' => '18px' ],
					[ 'property' => 'font-weight', 'value' => 'bold' ],
					[ 'property' => 'color', 'value' => '#333333' ],
				],
			],
			[
				'selector' => '.e-con-skip-me', // This will be skipped
				'properties' => [
					[ 'property' => 'display', 'value' => 'flex' ],
				],
			],
		];
		
		// Get the integration service
		$integration_service = $provider->get_integration_service();
		
		// Option 1: Process CSS rules directly (recommended)
		$result = $integration_service->process_css_rules( $css_rules );
		
		return [
			'success' => $result['success'],
			'processing_result' => $result,
			'example_css_rules' => $css_rules,
		];
	}
	
	public static function example_dry_run(): array {
		$provider = Global_Classes_Service_Provider::instance();
		
		if ( ! $provider->is_available() ) {
			return [
				'success' => false,
				'error' => 'Required dependencies not available',
			];
		}
		
		$css_rules = [
			[
				'selector' => '.preview-button',
				'properties' => [
					[ 'property' => 'background', 'value' => 'linear-gradient(45deg, #ff6b6b, #4ecdc4)' ],
					[ 'property' => 'border', 'value' => 'none' ],
					[ 'property' => 'padding', 'value' => '12px 24px' ],
				],
			],
		];
		
		$integration_service = $provider->get_integration_service();
		
		// Dry run to see what would happen without actually registering
		$dry_run_result = $integration_service->dry_run( $css_rules );
		
		// Get detailed stats
		$detailed_stats = $integration_service->get_detailed_stats( $css_rules );
		
		// Check for duplicates
		$duplicate_check = $integration_service->check_for_duplicates( $css_rules );
		
		return [
			'dry_run' => $dry_run_result,
			'detailed_stats' => $detailed_stats,
			'duplicate_check' => $duplicate_check,
		];
	}
	
	public static function example_step_by_step(): array {
		$provider = Global_Classes_Service_Provider::instance();
		
		if ( ! $provider->is_available() ) {
			return [
				'success' => false,
				'error' => 'Required dependencies not available',
			];
		}
		
		$css_rules = [
			[
				'selector' => '.step-by-step-class',
				'properties' => [
					[ 'property' => 'margin', 'value' => '20px auto' ],
					[ 'property' => 'max-width', 'value' => '800px' ],
				],
			],
		];
		
		// Step 1: Detection
		$detection_service = $provider->get_detection_service();
		$detected = $detection_service->detect_css_class_selectors( $css_rules );
		$detection_stats = $detection_service->get_detection_stats( $css_rules );
		
		// Step 2: Conversion
		$conversion_service = $provider->get_conversion_service();
		$converted = $conversion_service->convert_to_atomic_props( $detected );
		$conversion_stats = $conversion_service->get_conversion_stats( $detected );
		
		// Step 3: Registration
		$registration_service = $provider->get_registration_service();
		$duplicate_check = $registration_service->check_duplicate_classes( $converted );
		$repository_stats = $registration_service->get_repository_stats();
		
		// Step 4: Actual registration (commented out for example)
		// $registration_result = $registration_service->register_with_elementor( $converted );
		
		return [
			'step_1_detection' => [
				'detected' => $detected,
				'stats' => $detection_stats,
			],
			'step_2_conversion' => [
				'converted' => $converted,
				'stats' => $conversion_stats,
			],
			'step_3_registration_prep' => [
				'duplicate_check' => $duplicate_check,
				'repository_stats' => $repository_stats,
			],
			// 'step_4_registration' => $registration_result,
		];
	}
	
	public static function example_validation(): array {
		$provider = Global_Classes_Service_Provider::instance();
		
		if ( ! $provider->is_available() ) {
			return [
				'success' => false,
				'error' => 'Required dependencies not available',
			];
		}
		
		// Example of invalid CSS rules
		$invalid_css_rules = [
			'not-an-array',
			[ 'properties' => [] ], // Missing selector
			[ 'selector' => '.valid', 'properties' => 'not-array' ], // Invalid properties
		];
		
		// Example of valid CSS rules
		$valid_css_rules = [
			[
				'selector' => '.validation-example',
				'properties' => [
					[ 'property' => 'text-align', 'value' => 'center' ],
				],
			],
		];
		
		$integration_service = $provider->get_integration_service();
		
		return [
			'invalid_validation' => $integration_service->validate_css_rules( $invalid_css_rules ),
			'valid_validation' => $integration_service->validate_css_rules( $valid_css_rules ),
		];
	}
}
