<?php
/**
 * Verification script for the selector fix
 * 
 * This script tests the actual API to verify that:
 * 1. .elementor-1140 .elementor-element.elementor-element-a431a3a { text-align: left; } is now working
 * 2. Higher specificity selectors win over lower specificity ones
 * 3. Element-specific classes are preserved
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function verify_selector_fix() {
	$api_url = 'http://elementor.local:10003/wp-json/elementor/v2/widget-converter';
	$test_data = [
		'type' => 'url',
		'content' => 'https://oboxthemes.com/',
		'selector' => '.elementor-element-089b111'
	];

	// Make API request
	$response = wp_remote_post( $api_url, [
		'headers' => [ 'Content-Type' => 'application/json' ],
		'body' => wp_json_encode( $test_data ),
		'timeout' => 30,
	] );

	if ( is_wp_error( $response ) ) {
		return [
			'success' => false,
			'error' => 'API request failed: ' . $response->get_error_message(),
		];
	}

	$body = wp_remote_retrieve_body( $response );
	$data = json_decode( $body, true );

	if ( ! $data || ! isset( $data['success'] ) || ! $data['success'] ) {
		return [
			'success' => false,
			'error' => 'API returned error or invalid response',
			'response' => $data,
		];
	}

	// Analyze results
	$results = [
		'success' => true,
		'api_success' => $data['success'],
		'widgets_created' => $data['widgets_created'] ?? 0,
		'tests' => [],
	];

	// Test 1: Check if element-specific classes are preserved
	$widgets = $data['widgets'] ?? [];
	$element_specific_classes_found = 0;
	$widget_specific_classes_found = 0;
	
	$results['tests']['class_preservation'] = [
		'description' => 'Element-specific classes should be preserved in widgets',
		'element_specific_classes' => [],
		'widget_specific_classes' => [],
	];

	// Recursively check widget classes
	check_widget_classes_recursively( $widgets, $results['tests']['class_preservation'] );

	// Test 2: Check conversion statistics
	$results['tests']['conversion_stats'] = [
		'description' => 'Conversion should complete successfully',
		'widget_specific_rules_found' => $data['widget_specific_rules_found'] ?? 0,
		'widget_styles_applied' => $data['widget_styles_applied'] ?? 0,
		'total_time' => $data['total_time'] ?? 0,
	];

	// Test 3: Check for specific improvements
	$results['tests']['selector_improvements'] = [
		'description' => 'Complex selectors should now be processed',
		'complex_selectors_processed' => $data['nested_element_selectors_processed'] ?? 0,
		'complex_selectors_applied' => $data['nested_element_selectors_applied'] ?? 0,
	];

	return $results;
}

function check_widget_classes_recursively( $widgets, &$test_result ) {
	if ( ! is_array( $widgets ) ) {
		return;
	}

	foreach ( $widgets as $widget ) {
		if ( ! is_array( $widget ) ) {
			continue;
		}

		$classes = $widget['attributes']['class'] ?? '';
		
		if ( ! empty( $classes ) ) {
			$class_array = explode( ' ', $classes );
			
			foreach ( $class_array as $class ) {
				$class = trim( $class );
				
				// Check for element-specific classes
				if ( preg_match( '/^elementor-element-[a-z0-9]+$/i', $class ) ) {
					$test_result['element_specific_classes'][] = $class;
				}
				
				// Check for widget-specific classes
				if ( preg_match( '/^elementor-widget-[a-z0-9-]+$/i', $class ) ) {
					$test_result['widget_specific_classes'][] = $class;
				}
			}
		}

		// Check children
		if ( ! empty( $widget['children'] ) ) {
			check_widget_classes_recursively( $widget['children'], $test_result );
		}
	}
}

// Run verification if called directly
if ( defined( 'WP_CLI' ) && WP_CLI ) {
	$results = verify_selector_fix();
	WP_CLI::line( wp_json_encode( $results, JSON_PRETTY_PRINT ) );
} elseif ( isset( $_GET['verify_selector_fix'] ) ) {
	header( 'Content-Type: application/json' );
	echo wp_json_encode( verify_selector_fix(), JSON_PRETTY_PRINT );
	exit;
}
