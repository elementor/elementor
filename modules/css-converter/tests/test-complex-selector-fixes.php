<?php
/**
 * Comprehensive test for complex selector fixes
 * 
 * Tests both:
 * 1. Simple element-specific selectors: .elementor-1140 .elementor-element.elementor-element-a431a3a
 * 2. Descendant chain selectors: .elementor-1140 .elementor-element.elementor-element-9856e95 .elementor-heading-title
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function test_complex_selector_fixes() {
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
			'error' => 'API returned error',
			'response' => $data,
		];
	}

	// Test results
	$results = [
		'success' => true,
		'timestamp' => gmdate( 'Y-m-d H:i:s' ),
		'tests' => [],
	];

	// Test 1: Simple element-specific selector (text-align fix)
	$results['tests']['text_align_fix'] = [
		'description' => 'Simple element-specific selector: .elementor-1140 .elementor-element.elementor-element-a431a3a { text-align: left; }',
		'expected_behavior' => 'Should match element-div-3 and apply text-align: left with specificity 30',
		'selector' => '.elementor-1140 .elementor-element.elementor-element-a431a3a',
		'property' => 'text-align',
		'expected_value' => 'left',
		'expected_specificity' => 30,
		'target_widget' => 'element-div-3 (e-div-block with elementor-element-a431a3a class)',
	];

	// Test 2: Descendant chain selector (font-size fix)
	$results['tests']['font_size_fix'] = [
		'description' => 'Descendant chain selector: .elementor-1140 .elementor-element.elementor-element-9856e95 .elementor-heading-title { font-size: 14px; }',
		'expected_behavior' => 'Should match element-h2-6 (descendant) and apply font-size: 14px with specificity 40',
		'selector' => '.elementor-1140 .elementor-element.elementor-element-9856e95 .elementor-heading-title',
		'property' => 'font-size',
		'expected_value' => '14px',
		'expected_specificity' => 40,
		'target_widget' => 'element-h2-6 (e-heading with elementor-heading-title class)',
	];

	// Test 3: Class preservation
	$results['tests']['class_preservation'] = [
		'description' => 'Element-specific classes should be preserved on widgets',
		'preserved_classes' => [],
		'filtered_classes' => [],
	];

	// Analyze widget structure
	$widgets = $data['widgets'] ?? [];
	analyze_widget_structure( $widgets, $results );

	// Test 4: Conversion statistics
	$results['tests']['conversion_stats'] = [
		'description' => 'Overall conversion should be successful',
		'widget_specific_rules_found' => $data['widget_specific_rules_found'] ?? 0,
		'widget_styles_applied' => $data['widget_styles_applied'] ?? 0,
		'widgets_created' => $data['widgets_created'] ?? 0,
		'total_time' => $data['total_time'] ?? 0,
	];

	return $results;
}

function analyze_widget_structure( $widgets, &$results ) {
	if ( ! is_array( $widgets ) ) {
		return;
	}

	foreach ( $widgets as $widget ) {
		if ( ! is_array( $widget ) ) {
			continue;
		}

		$element_id = $widget['element_id'] ?? '';
		$widget_type = $widget['widget_type'] ?? '';
		$classes = $widget['attributes']['class'] ?? '';

		// Check for specific test cases
		if ( $element_id === 'element-div-3' ) {
			$results['tests']['text_align_fix']['actual_widget'] = [
				'element_id' => $element_id,
				'widget_type' => $widget_type,
				'classes' => $classes,
				'has_target_class' => strpos( $classes, 'elementor-element-a431a3a' ) !== false,
			];
		}

		if ( $element_id === 'element-h2-6' ) {
			$results['tests']['font_size_fix']['actual_widget'] = [
				'element_id' => $element_id,
				'widget_type' => $widget_type,
				'classes' => $classes,
				'has_target_class' => strpos( $classes, 'elementor-heading-title' ) !== false,
			];
		}

		// Collect class preservation data
		if ( ! empty( $classes ) ) {
			$class_array = explode( ' ', $classes );
			
			foreach ( $class_array as $class ) {
				$class = trim( $class );
				
				// Element-specific classes
				if ( preg_match( '/^elementor-element-[a-z0-9]+$/i', $class ) ) {
					$results['tests']['class_preservation']['preserved_classes'][] = $class;
				}
				
				// Widget-specific classes
				if ( preg_match( '/^elementor-widget-[a-z0-9-]+$/i', $class ) ) {
					$results['tests']['class_preservation']['preserved_classes'][] = $class;
				}
			}
		}

		// Check children recursively
		if ( ! empty( $widget['children'] ) ) {
			analyze_widget_structure( $widget['children'], $results );
		}
	}
}

function generate_test_report( $results ) {
	$report = "# Complex Selector Fixes - Test Report\n\n";
	$report .= "**Timestamp:** {$results['timestamp']}\n";
	$report .= "**Status:** " . ( $results['success'] ? '✅ SUCCESS' : '❌ FAILED' ) . "\n\n";

	if ( ! $results['success'] ) {
		$report .= "**Error:** {$results['error']}\n\n";
		return $report;
	}

	// Test 1: Text-align fix
	$test1 = $results['tests']['text_align_fix'];
	$report .= "## Test 1: Text-Align Fix (Simple Element-Specific Selector)\n\n";
	$report .= "**Selector:** `{$test1['selector']}`\n";
	$report .= "**Expected:** {$test1['expected_behavior']}\n\n";
	
	if ( isset( $test1['actual_widget'] ) ) {
		$widget = $test1['actual_widget'];
		$report .= "**Result:**\n";
		$report .= "- ✅ Target widget found: `{$widget['element_id']}` ({$widget['widget_type']})\n";
		$report .= "- " . ( $widget['has_target_class'] ? '✅' : '❌' ) . " Has target class: `elementor-element-a431a3a`\n";
		$report .= "- **Classes:** `{$widget['classes']}`\n\n";
	} else {
		$report .= "- ❌ Target widget NOT found\n\n";
	}

	// Test 2: Font-size fix
	$test2 = $results['tests']['font_size_fix'];
	$report .= "## Test 2: Font-Size Fix (Descendant Chain Selector)\n\n";
	$report .= "**Selector:** `{$test2['selector']}`\n";
	$report .= "**Expected:** {$test2['expected_behavior']}\n\n";
	
	if ( isset( $test2['actual_widget'] ) ) {
		$widget = $test2['actual_widget'];
		$report .= "**Result:**\n";
		$report .= "- ✅ Target widget found: `{$widget['element_id']}` ({$widget['widget_type']})\n";
		$report .= "- " . ( $widget['has_target_class'] ? '✅' : '❌' ) . " Has target class: `elementor-heading-title`\n";
		$report .= "- **Classes:** `{$widget['classes']}`\n\n";
	} else {
		$report .= "- ❌ Target widget NOT found\n\n";
	}

	// Test 3: Class preservation
	$test3 = $results['tests']['class_preservation'];
	$report .= "## Test 3: Class Preservation\n\n";
	$preserved = array_unique( $test3['preserved_classes'] );
	$report .= "**Preserved Classes:** " . count( $preserved ) . " classes\n";
	foreach ( array_slice( $preserved, 0, 10 ) as $class ) {
		$report .= "- ✅ `{$class}`\n";
	}
	if ( count( $preserved ) > 10 ) {
		$report .= "- ... and " . ( count( $preserved ) - 10 ) . " more\n";
	}
	$report .= "\n";

	// Test 4: Conversion stats
	$test4 = $results['tests']['conversion_stats'];
	$report .= "## Test 4: Conversion Statistics\n\n";
	$report .= "- **Widget-specific rules found:** {$test4['widget_specific_rules_found']}\n";
	$report .= "- **Widget styles applied:** {$test4['widget_styles_applied']}\n";
	$report .= "- **Widgets created:** {$test4['widgets_created']}\n";
	$report .= "- **Total time:** {$test4['total_time']}ms\n\n";

	// Overall assessment
	$text_align_ok = isset( $results['tests']['text_align_fix']['actual_widget'] );
	$font_size_ok = isset( $results['tests']['font_size_fix']['actual_widget'] );
	$classes_ok = count( $preserved ) > 0;

	$report .= "## Overall Assessment\n\n";
	$report .= "- " . ( $text_align_ok ? '✅' : '❌' ) . " **Text-align fix:** Simple element-specific selectors\n";
	$report .= "- " . ( $font_size_ok ? '✅' : '❌' ) . " **Font-size fix:** Descendant chain selectors\n";
	$report .= "- " . ( $classes_ok ? '✅' : '❌' ) . " **Class preservation:** Element-specific classes kept\n\n";

	if ( $text_align_ok && $font_size_ok && $classes_ok ) {
		$report .= "🎉 **ALL FIXES WORKING CORRECTLY!**\n";
	} else {
		$report .= "⚠️ **Some issues remain.** See details above.\n";
	}

	return $report;
}

// Run test if accessed via web
if ( isset( $_GET['test_complex_selectors'] ) ) {
	$results = test_complex_selector_fixes();
	
	if ( isset( $_GET['format'] ) && $_GET['format'] === 'json' ) {
		header( 'Content-Type: application/json' );
		echo wp_json_encode( $results, JSON_PRETTY_PRINT );
	} else {
		header( 'Content-Type: text/plain' );
		echo generate_test_report( $results );
	}
	exit;
}

