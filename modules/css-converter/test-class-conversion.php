<?php
/**
 * Simple test file to verify CSS Class Conversion functionality
 * This file can be run via WP-CLI or included in a test environment
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

function test_css_class_conversion() {
	echo "Testing CSS Class Conversion...\n";

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

// Run test if called directly
if ( defined( 'WP_CLI' ) && WP_CLI ) {
	test_css_class_conversion();
}
