<?php
/**
 * Test Runner for CSS Selector Matching System
 * 
 * Usage: php run-selector-tests.php
 * 
 * This script demonstrates the new unified CSS selector matching system
 * and validates that selector pollution issues have been resolved.
 */

// WordPress environment simulation for testing
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', dirname( __FILE__ ) . '/../../../../../' );
}

// Include the test classes
require_once __DIR__ . '/../services/css/processing/css-selector-parser.php';
require_once __DIR__ . '/../services/css/processing/widget-tree-navigator.php';
require_once __DIR__ . '/../services/css/processing/selector-matcher-engine.php';
require_once __DIR__ . '/css-selector-matching-test.php';

use Elementor\Modules\CssConverter\Tests\CSS_Selector_Matching_Test;

echo "🚀 CSS Selector Matching System Test Suite\n";
echo "==========================================\n\n";

try {
	$test_suite = new CSS_Selector_Matching_Test();
	
	echo "Running comprehensive test suite...\n\n";
	
	$results = $test_suite->run_all_tests();
	
	$report = $test_suite->generate_test_report( $results );
	
	echo $report;
	
	// Save report to file
	$report_file = __DIR__ . '/test-report-' . date( 'Y-m-d-H-i-s' ) . '.md';
	file_put_contents( $report_file, $report );
	
	echo "\n📄 Full report saved to: {$report_file}\n";
	
} catch ( \Exception $e ) {
	echo "❌ Test suite failed with exception: " . $e->getMessage() . "\n";
	echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
	exit( 1 );
}

echo "\n✨ Test suite completed successfully!\n";
