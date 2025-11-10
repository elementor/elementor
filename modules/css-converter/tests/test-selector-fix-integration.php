<?php
namespace Elementor\Modules\CssConverter\Tests;

use Elementor\Modules\CssConverter\Services\Css\Processing\Selector_Matcher_Engine;
use Elementor\Modules\CssConverter\Services\Css\Processing\Elementor_Selector_Pattern_Detector;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Integration test for the selector fix
 * Tests the actual problematic selector: .elementor-1140 .elementor-element.elementor-element-a431a3a
 */
class Test_Selector_Fix_Integration {

	/**
	 * Test the fix with real widget data
	 */
	public function test_problematic_selector(): array {
		// Mock widget data based on actual debug output
		$widgets = [
			[
				'widget_type' => 'e-div-block',
				'element_id' => 'element-div-1',
				'attributes' => [
					'class' => 'elementor-element elementor-element-089b111 e-flex e-con-boxed e-con e-parent'
				],
				'children' => [
					[
						'widget_type' => 'e-div-block',
						'element_id' => 'element-div-2',
						'attributes' => [
							'class' => 'e-con-inner'
						],
						'children' => [
							[
								'widget_type' => 'e-div-block',
								'element_id' => 'element-div-3',
								'attributes' => [
									'class' => 'elementor-element elementor-element-a431a3a loading elementor-widget elementor-widget-image'
								],
								'children' => [
									[
										'widget_type' => 'e-image',
										'element_id' => 'element-img-4',
										'attributes' => [
											'class' => 'attachment-medium size-medium wp-image-1716'
										],
										'children' => []
									]
								]
							],
							[
								'widget_type' => 'e-div-block',
								'element_id' => 'element-div-5',
								'attributes' => [
									'class' => 'elementor-element elementor-element-9856e95 loading elementor-widget elementor-widget-heading'
								],
								'children' => [
									[
										'widget_type' => 'e-heading',
										'element_id' => 'element-h2-6',
										'attributes' => [
											'class' => 'elementor-heading-title elementor-size-default'
										],
										'children' => []
									]
								]
							]
						]
					]
				]
			]
		];

		$selector_matcher = new Selector_Matcher_Engine();
		
		// Test cases
		$test_cases = [
			// The problematic selector that was failing
			'.elementor-1140 .elementor-element.elementor-element-a431a3a' => ['element-div-3'],
			
			// Another element ID selector
			'.elementor-1140 .elementor-element.elementor-element-9856e95' => ['element-div-5'],
			
			// Working selector for comparison
			'.e-con>.e-con-inner' => ['element-div-2'],
			
			// Simple element-specific selector
			'.elementor-element-a431a3a' => ['element-div-3'],
			
			// Widget-specific selector
			'.elementor-widget-image' => ['element-div-3'],
		];

		$results = [];
		
		foreach ( $test_cases as $selector => $expected_matches ) {
			try {
				$actual_matches = $selector_matcher->find_matching_widgets( $selector, $widgets );
				
				$passed = $this->arrays_equal( $expected_matches, $actual_matches );
				
				$results[] = [
					'selector' => $selector,
					'expected' => $expected_matches,
					'actual' => $actual_matches,
					'passed' => $passed,
					'status' => $passed ? 'PASS' : 'FAIL',
				];
			} catch ( \Exception $e ) {
				$results[] = [
					'selector' => $selector,
					'expected' => $expected_matches,
					'actual' => [],
					'passed' => false,
					'status' => 'ERROR',
					'error' => $e->getMessage(),
				];
			}
		}
		
		return $results;
	}

	/**
	 * Test class filtering behavior
	 */
	public function test_class_filtering(): array {
		// Mock processor for testing class filtering
		$processor = new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Widget_Class_Processor();
		
		// Use reflection to access private method
		$reflection = new \ReflectionClass( $processor );
		$method = $reflection->getMethod( 'should_filter_class' );
		$method->setAccessible( true );
		
		$test_cases = [
			// Should NOT be filtered (preserved)
			'elementor-element-a431a3a' => false,
			'elementor-widget-image' => false,
			'elementor-widget-heading' => false,
			'e-con' => false,
			'e-con-inner' => false,
			
			// Should be filtered (removed)
			'elementor-element' => true,
			'elementor-widget' => true,
			'loading' => true,
			'e-flex' => true,
			'e-parent' => true,
		];
		
		$results = [];
		
		foreach ( $test_cases as $class => $expected_filtered ) {
			$actual_filtered = $method->invoke( $processor, $class );
			
			$passed = $actual_filtered === $expected_filtered;
			
			$results[] = [
				'class' => $class,
				'expected_filtered' => $expected_filtered,
				'actual_filtered' => $actual_filtered,
				'passed' => $passed,
				'status' => $passed ? 'PASS' : 'FAIL',
			];
		}
		
		return $results;
	}

	/**
	 * Generate comprehensive test report
	 */
	public function generate_report(): string {
		$report = "# Selector Fix Integration Test Report\n\n";
		$report .= "**Date:** " . date( 'Y-m-d H:i:s' ) . "\n\n";
		
		// Test selector matching
		$report .= "## Selector Matching Tests\n\n";
		$selector_results = $this->test_problematic_selector();
		
		$total_selector_tests = count( $selector_results );
		$passed_selector_tests = 0;
		
		foreach ( $selector_results as $result ) {
			if ( $result['passed'] ) {
				$passed_selector_tests++;
				$status_icon = '✅';
			} else {
				$status_icon = '❌';
			}
			
			$report .= "### {$status_icon} `{$result['selector']}`\n\n";
			$report .= "- **Expected:** `" . json_encode( $result['expected'] ) . "`\n";
			$report .= "- **Actual:** `" . json_encode( $result['actual'] ) . "`\n";
			$report .= "- **Status:** {$result['status']}\n";
			
			if ( isset( $result['error'] ) ) {
				$report .= "- **Error:** {$result['error']}\n";
			}
			
			$report .= "\n";
		}
		
		// Test class filtering
		$report .= "## Class Filtering Tests\n\n";
		$filtering_results = $this->test_class_filtering();
		
		$total_filtering_tests = count( $filtering_results );
		$passed_filtering_tests = 0;
		
		foreach ( $filtering_results as $result ) {
			if ( $result['passed'] ) {
				$passed_filtering_tests++;
				$status_icon = '✅';
			} else {
				$status_icon = '❌';
			}
			
			$action = $result['expected_filtered'] ? 'FILTER OUT' : 'PRESERVE';
			$report .= "- {$status_icon} `{$result['class']}` → **{$action}**\n";
		}
		
		$report .= "\n";
		
		// Summary
		$total_tests = $total_selector_tests + $total_filtering_tests;
		$passed_tests = $passed_selector_tests + $passed_filtering_tests;
		
		$report .= "## Summary\n\n";
		$report .= "### Selector Matching\n";
		$report .= "- **Tests:** {$total_selector_tests}\n";
		$report .= "- **Passed:** {$passed_selector_tests}\n";
		$report .= "- **Success Rate:** " . round( ( $passed_selector_tests / $total_selector_tests ) * 100, 1 ) . "%\n\n";
		
		$report .= "### Class Filtering\n";
		$report .= "- **Tests:** {$total_filtering_tests}\n";
		$report .= "- **Passed:** {$passed_filtering_tests}\n";
		$report .= "- **Success Rate:** " . round( ( $passed_filtering_tests / $total_filtering_tests ) * 100, 1 ) . "%\n\n";
		
		$report .= "### Overall\n";
		$report .= "- **Total Tests:** {$total_tests}\n";
		$report .= "- **Passed:** {$passed_tests}\n";
		$report .= "- **Failed:** " . ( $total_tests - $passed_tests ) . "\n";
		$report .= "- **Success Rate:** " . round( ( $passed_tests / $total_tests ) * 100, 1 ) . "%\n\n";
		
		if ( $passed_tests === $total_tests ) {
			$report .= "🎉 **ALL TESTS PASSED!** The selector fix is working correctly.\n";
		} else {
			$report .= "⚠️ **Some tests failed.** Review the results above for details.\n";
		}
		
		return $report;
	}

	/**
	 * Helper method to compare arrays regardless of order
	 */
	private function arrays_equal( array $a, array $b ): bool {
		sort( $a );
		sort( $b );
		return $a === $b;
	}
}

