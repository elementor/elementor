<?php
/**
 * Comprehensive test file for CSS Class Conversion functionality
 * This file can be run via WP-CLI or included in a test environment
 * 
 * Usage:
 * - Via WP-CLI: wp eval-file test-class-conversion.php
 * - Via browser: Access this file directly (if ABSPATH is defined)
 * - Via PHPUnit: Include in test suite
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Include required files
require_once __DIR__ . '/parsers/css-parser.php';
require_once __DIR__ . '/parsers/parsed-css.php';
require_once __DIR__ . '/exceptions/css-parse-exception.php';
require_once __DIR__ . '/exceptions/class-conversion-exception.php';
require_once __DIR__ . '/variable-conversion-service.php';
require_once __DIR__ . '/class-convertors/class-property-mapper-interface.php';
require_once __DIR__ . '/class-convertors/color-property-mapper.php';
require_once __DIR__ . '/class-convertors/font-size-property-mapper.php';
require_once __DIR__ . '/class-convertors/class-property-mapper-registry.php';
require_once __DIR__ . '/services/class-conversion-service.php';

use Elementor\Modules\CssConverter\Services\Class_Conversion_Service;
use Elementor\Modules\CssConverter\ClassConvertors\Color_Property_Mapper;
use Elementor\Modules\CssConverter\ClassConvertors\Font_Size_Property_Mapper;

function test_property_mappers() {
	echo "Testing Property Mappers...\n";
	echo "===========================\n";

	$color_mapper = new Color_Property_Mapper();
	$font_mapper = new Font_Size_Property_Mapper();

	// Test color mapper
	$color_tests = [
		[ '#ff0000', '#ff0000' ],
		[ '#f00', '#ff0000' ],
		[ 'rgb(255, 0, 0)', '#ff0000' ],
		[ 'rgba(255, 0, 0, 1)', '#ff0000' ],
		[ 'red', 'red' ],
	];

	echo "Color Mapper Tests:\n";
	foreach ( $color_tests as [ $input, $expected ] ) {
		if ( $color_mapper->supports( 'color', $input ) ) {
			$result = $color_mapper->map_to_schema( 'color', $input );
			$actual = $result['color'];
			$status = $actual === $expected ? '✓' : '✗';
			echo "  {$status} {$input} → {$actual} (expected: {$expected})\n";
		} else {
			echo "  ✗ {$input} → NOT SUPPORTED\n";
		}
	}

	// Test font-size mapper
	$font_tests = [
		[ '16px', '16px' ],
		[ '1.2em', '1.2em' ],
		[ '1.0rem', '1rem' ],
		[ '120%', '120%' ],
		[ '12pt', '12pt' ],
	];

	echo "\nFont-Size Mapper Tests:\n";
	foreach ( $font_tests as [ $input, $expected ] ) {
		if ( $font_mapper->supports( 'font-size', $input ) ) {
			$result = $font_mapper->map_to_schema( 'font-size', $input );
			$actual = $result['font-size'];
			$status = $actual === $expected ? '✓' : '✗';
			echo "  {$status} {$input} → {$actual} (expected: {$expected})\n";
		} else {
			echo "  ✗ {$input} → NOT SUPPORTED\n";
		}
	}

	echo "\n";
}

function test_css_class_conversion() {
	echo "Testing CSS Class Conversion Service...\n";
	echo "======================================\n";

	$test_css = '
		.simple-class {
			color: #ff0000;
			font-size: 16px;
			background-color: #ffffff; /* Should be skipped */
		}
		
		.color-only {
			color: rgb(0, 123, 255);
		}
		
		.font-only {
			font-size: 1.2em;
		}
		
		.with-variables {
			--primary: #007cba;
			color: var(--primary);
			font-size: 18px;
		}
		
		.parent .child {
			color: blue; /* Should be skipped - complex selector */
		}
		
		.hover-class:hover {
			color: green; /* Should be skipped - pseudo-selector */
		}
	';

	try {
		$service = new Class_Conversion_Service();
		$result = $service->convert_css_to_global_classes( $test_css );

		echo "Conversion Results:\n";
		echo "==================\n";
		echo "Total classes found: " . $result['stats']['total_classes_found'] . "\n";
		echo "Classes converted: " . $result['stats']['classes_converted'] . "\n";
		echo "Classes skipped: " . $result['stats']['classes_skipped'] . "\n";
		echo "Properties converted: " . $result['stats']['properties_converted'] . "\n";
		echo "Properties skipped: " . $result['stats']['properties_skipped'] . "\n";
		echo "Variables converted: " . $result['stats']['variables_converted'] . "\n";

		echo "\nConverted Classes:\n";
		foreach ( $result['converted_classes'] as $class ) {
			echo "- {$class['label']} (ID: {$class['id']})\n";
			foreach ( $class['variants']['desktop'] as $prop => $value ) {
				echo "  {$prop}: {$value}\n";
			}
		}

		echo "\nSkipped Classes:\n";
		foreach ( $result['skipped_classes'] as $skipped ) {
			echo "- {$skipped['selector']} (Reason: {$skipped['reason']})\n";
		}

		echo "\nWarnings:\n";
		foreach ( $result['warnings'] as $warning ) {
			echo "- {$warning}\n";
		}

		echo "\nTest completed successfully!\n";

	} catch ( Exception $e ) {
		echo "Error: " . $e->getMessage() . "\n";
	}
}

function test_edge_cases() {
	echo "Testing Edge Cases...\n";
	echo "====================\n";

	$service = new Class_Conversion_Service();

	// Test empty CSS
	try {
		$result = $service->convert_css_to_global_classes( '' );
		echo "✗ Empty CSS should throw exception\n";
	} catch ( Exception $e ) {
		echo "✓ Empty CSS properly handled: " . $e->getMessage() . "\n";
	}

	// Test invalid CSS
	try {
		$result = $service->convert_css_to_global_classes( '.invalid { color: ; }' );
		echo "✓ Invalid CSS handled gracefully\n";
	} catch ( Exception $e ) {
		echo "✓ Invalid CSS exception: " . $e->getMessage() . "\n";
	}

	// Test CSS with no classes
	$result = $service->convert_css_to_global_classes( 'body { color: red; } #header { color: blue; }' );
	echo "✓ No classes found: " . $result['stats']['total_classes_found'] . " classes\n";

	// Test class with no supported properties
	$result = $service->convert_css_to_global_classes( '.empty { margin: 10px; padding: 5px; }' );
	echo "✓ No supported properties: " . $result['stats']['classes_skipped'] . " skipped\n";

	echo "\n";
}

function run_all_tests() {
	echo "CSS Class Converter - Comprehensive Test Suite\n";
	echo "==============================================\n\n";

	test_property_mappers();
	test_css_class_conversion();
	test_edge_cases();

	echo "All tests completed!\n";
}

// Run tests if called directly
if ( defined( 'WP_CLI' ) && WP_CLI ) {
	run_all_tests();
} elseif ( ! empty( $_GET['run_tests'] ) ) {
	// Allow running via browser with ?run_tests=1
	header( 'Content-Type: text/plain' );
	run_all_tests();
}
