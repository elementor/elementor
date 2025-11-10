<?php
namespace Elementor\Modules\CssConverter\Tests;

use Elementor\Modules\CssConverter\Services\Css\Processing\Elementor_Selector_Pattern_Detector;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Test cases for Elementor_Selector_Pattern_Detector
 */
class Test_Elementor_Selector_Pattern_Detector {

	private $detector;

	public function __construct() {
		$this->detector = new Elementor_Selector_Pattern_Detector();
	}

	/**
	 * Run all tests
	 */
	public function run_all_tests(): array {
		$results = [];
		
		$results['test_is_elementor_specific_selector'] = $this->test_is_elementor_specific_selector();
		$results['test_extract_element_ids_from_selector'] = $this->test_extract_element_ids_from_selector();
		$results['test_extract_element_id_from_class'] = $this->test_extract_element_id_from_class();
		$results['test_is_page_wrapper_class'] = $this->test_is_page_wrapper_class();
		$results['test_remove_page_wrapper_classes'] = $this->test_remove_page_wrapper_classes();
		$results['test_extract_target_selector_part'] = $this->test_extract_target_selector_part();
		$results['test_has_element_specific_classes'] = $this->test_has_element_specific_classes();
		
		return $results;
	}

	/**
	 * Test is_elementor_specific_selector method
	 */
	private function test_is_elementor_specific_selector(): array {
		$test_cases = [
			// Should return true
			'.elementor-1140 .elementor-element-a431a3a' => true,
			'.elementor-element-abc123' => true,
			'.elementor-kit-456' => true,
			'.elementor-123' => true,
			
			// Should return false
			'.custom-class' => false,
			'div' => false,
			'.e-con' => false,
			'#some-id' => false,
		];
		
		$results = [];
		foreach ( $test_cases as $selector => $expected ) {
			$actual = $this->detector->is_elementor_specific_selector( $selector );
			$results[] = [
				'selector' => $selector,
				'expected' => $expected,
				'actual' => $actual,
				'passed' => $actual === $expected,
			];
		}
		
		return $results;
	}

	/**
	 * Test extract_element_ids_from_selector method
	 */
	private function test_extract_element_ids_from_selector(): array {
		$test_cases = [
			'.elementor-1140 .elementor-element.elementor-element-a431a3a' => ['a431a3a'],
			'.elementor-element-abc123.elementor-widget' => ['abc123'],
			'.elementor-element-def456 .elementor-element-ghi789' => ['def456', 'ghi789'],
			'.custom-class' => [],
			'.elementor-1140' => [],
		];
		
		$results = [];
		foreach ( $test_cases as $selector => $expected ) {
			$actual = $this->detector->extract_element_ids_from_selector( $selector );
			$results[] = [
				'selector' => $selector,
				'expected' => $expected,
				'actual' => $actual,
				'passed' => $actual === $expected,
			];
		}
		
		return $results;
	}

	/**
	 * Test extract_element_id_from_class method
	 */
	private function test_extract_element_id_from_class(): array {
		$test_cases = [
			'elementor-element-a431a3a' => 'a431a3a',
			'elementor-element-abc123' => 'abc123',
			'elementor-element' => null,
			'elementor-widget-image' => null,
			'custom-class' => null,
		];
		
		$results = [];
		foreach ( $test_cases as $class => $expected ) {
			$actual = $this->detector->extract_element_id_from_class( $class );
			$results[] = [
				'class' => $class,
				'expected' => $expected,
				'actual' => $actual,
				'passed' => $actual === $expected,
			];
		}
		
		return $results;
	}

	/**
	 * Test is_page_wrapper_class method
	 */
	private function test_is_page_wrapper_class(): array {
		$test_cases = [
			'elementor-1140' => true,
			'elementor-kit-123' => true,
			'elementor-456' => true,
			'elementor-element-a431a3a' => false,
			'elementor-widget-image' => false,
			'custom-class' => false,
		];
		
		$results = [];
		foreach ( $test_cases as $class => $expected ) {
			$actual = $this->detector->is_page_wrapper_class( $class );
			$results[] = [
				'class' => $class,
				'expected' => $expected,
				'actual' => $actual,
				'passed' => $actual === $expected,
			];
		}
		
		return $results;
	}

	/**
	 * Test remove_page_wrapper_classes method
	 */
	private function test_remove_page_wrapper_classes(): array {
		$test_cases = [
			'.elementor-1140 .elementor-element.elementor-element-a431a3a' => '.elementor-element.elementor-element-a431a3a',
			'.elementor-kit-123 .custom-class' => '.custom-class',
			'.elementor-456 .elementor-789 .target' => '.target',
			'.custom-class' => '.custom-class',
		];
		
		$results = [];
		foreach ( $test_cases as $selector => $expected ) {
			$actual = $this->detector->remove_page_wrapper_classes( $selector );
			$results[] = [
				'selector' => $selector,
				'expected' => $expected,
				'actual' => $actual,
				'passed' => $actual === $expected,
			];
		}
		
		return $results;
	}

	/**
	 * Test extract_target_selector_part method
	 */
	private function test_extract_target_selector_part(): array {
		$test_cases = [
			'.elementor-1140 .elementor-element.elementor-element-a431a3a' => '.elementor-element.elementor-element-a431a3a',
			'.parent .child' => '.child',
			'.single' => '.single',
			'.parent > .child' => '.child',
			'.parent + .sibling' => '.sibling',
		];
		
		$results = [];
		foreach ( $test_cases as $selector => $expected ) {
			$actual = $this->detector->extract_target_selector_part( $selector );
			$results[] = [
				'selector' => $selector,
				'expected' => $expected,
				'actual' => $actual,
				'passed' => $actual === $expected,
			];
		}
		
		return $results;
	}

	/**
	 * Test has_element_specific_classes method
	 */
	private function test_has_element_specific_classes(): array {
		$test_cases = [
			'.elementor-1140 .elementor-element-a431a3a' => true,
			'.elementor-element-abc123' => true,
			'.elementor-1140' => false,
			'.custom-class' => false,
			'.e-con' => false,
		];
		
		$results = [];
		foreach ( $test_cases as $selector => $expected ) {
			$actual = $this->detector->has_element_specific_classes( $selector );
			$results[] = [
				'selector' => $selector,
				'expected' => $expected,
				'actual' => $actual,
				'passed' => $actual === $expected,
			];
		}
		
		return $results;
	}

	/**
	 * Generate test report
	 */
	public function generate_report(): string {
		$results = $this->run_all_tests();
		$report = "# Elementor Selector Pattern Detector Test Report\n\n";
		
		$total_tests = 0;
		$passed_tests = 0;
		
		foreach ( $results as $test_name => $test_results ) {
			$report .= "## {$test_name}\n\n";
			
			foreach ( $test_results as $result ) {
				$total_tests++;
				if ( $result['passed'] ) {
					$passed_tests++;
					$status = '✅ PASS';
				} else {
					$status = '❌ FAIL';
				}
				
				$input_key = array_keys( $result )[0]; // selector, class, etc.
				$input_value = $result[ $input_key ];
				
				$report .= "- **{$status}** `{$input_value}` → Expected: `" . json_encode( $result['expected'] ) . "`, Got: `" . json_encode( $result['actual'] ) . "`\n";
			}
			
			$report .= "\n";
		}
		
		$report .= "## Summary\n\n";
		$report .= "- **Total Tests:** {$total_tests}\n";
		$report .= "- **Passed:** {$passed_tests}\n";
		$report .= "- **Failed:** " . ( $total_tests - $passed_tests ) . "\n";
		$report .= "- **Success Rate:** " . round( ( $passed_tests / $total_tests ) * 100, 1 ) . "%\n";
		
		return $report;
	}
}


