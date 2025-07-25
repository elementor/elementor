<?php
/**
 * Elementor CSS Parser Installation Verification Script
 * 
 * Run this script to verify that the CSS parser is properly installed and configured.
 * 
 * Usage:
 * php verify-installation.php
 * 
 * Or via WordPress:
 * wp eval-file verify-installation.php
 */

namespace Elementor\Modules\CssConverter;

use Elementor\Modules\CssConverter\Parsers\CssParser;

if ( ! defined( 'ABSPATH' ) ) {
	// Allow direct execution for testing
	define( 'ABSPATH', dirname( dirname( dirname( __DIR__ ) ) ) . '/' );
}

echo "Elementor CSS Parser Installation Verification\n";
echo str_repeat( "=", 50 ) . "\n\n";

$checks = [];
$all_passed = true;

// Check 1: Composer dependencies
echo "1. Checking composer dependencies...\n";
$vendor_path = __DIR__ . '/vendor/autoload.php';
if ( file_exists( $vendor_path ) ) {
	$checks['composer'] = '✓ Composer dependencies installed';
} else {
	$checks['composer'] = '✗ Composer dependencies missing - run "composer install"';
	$all_passed = false;
}

// Check 2: Autoloader
echo "2. Checking CSS converter autoloader...\n";
try {
	require_once __DIR__ . '/autoloader.php';
	CSS_Converter_Autoloader::register();
	
	if ( CSS_Converter_Autoloader::is_loaded() ) {
		$checks['autoloader'] = '✓ CSS converter autoloader working';
	} else {
		$checks['autoloader'] = '✗ CSS converter autoloader failed to load dependencies';
		$all_passed = false;
	}
} catch ( Exception $e ) {
	$checks['autoloader'] = '✗ Autoloader error: ' . $e->getMessage();
	$all_passed = false;
}

// Check 3: Sabberworm library
echo "3. Checking sabberworm library...\n";
try {
	if ( class_exists( '\\Sabberworm\\CSS\\Parser' ) ) {
		$checks['sabberworm'] = '✓ Sabberworm CSS parser library loaded';
	} else {
		$checks['sabberworm'] = '✗ Sabberworm CSS parser library not found';
		$all_passed = false;
	}
} catch ( Exception $e ) {
	$checks['sabberworm'] = '✗ Sabberworm library error: ' . $e->getMessage();
	$all_passed = false;
}

// Check 4: CssParser class
echo "4. Checking CssParser class...\n";
try {
	require_once __DIR__ . '/parsers/css-parser.php';
	
	if ( class_exists( '\\Elementor\\Modules\\CssConverter\\Parsers\\CssParser' ) ) {
		$checks['cssparser'] = '✓ CssParser class available';
	} else {
		$checks['cssparser'] = '✗ CssParser class not found';
		$all_passed = false;
	}
} catch ( Exception $e ) {
	$checks['cssparser'] = '✗ CssParser class error: ' . $e->getMessage();
	$all_passed = false;
}

// Check 5: Basic functionality test
echo "5. Testing basic CSS parsing...\n";
try {
	
	$parser = new CssParser();
	$test_css = ".test { color: red; background: blue; }";
	$parsed = $parser->parse( $test_css );
	$classes = $parser->extract_classes( $parsed );
	
	if ( isset( $classes['test'] ) && count( $classes['test']['rules'] ) === 2 ) {
		$checks['functionality'] = '✓ Basic CSS parsing working';
	} else {
		$checks['functionality'] = '✗ Basic CSS parsing failed';
		$all_passed = false;
	}
} catch ( Exception $e ) {
	$checks['functionality'] = '✗ CSS parsing error: ' . $e->getMessage();
	$all_passed = false;
}

// Check 6: Test files
echo "6. Checking test files...\n";
$test_files = [
	'tests/css-parser-test.php',
	'tests/manual-test.php'
];

$test_files_exist = true;
foreach ( $test_files as $test_file ) {
	if ( ! file_exists( __DIR__ . '/' . $test_file ) ) {
		$test_files_exist = false;
		break;
	}
}

if ( $test_files_exist ) {
	$checks['tests'] = '✓ Test files available';
} else {
	$checks['tests'] = '✗ Some test files missing';
	$all_passed = false;
}

// Check 7: Documentation
echo "7. Checking documentation...\n";
if ( file_exists( __DIR__ . '/README.md' ) ) {
	$checks['docs'] = '✓ Documentation available';
} else {
	$checks['docs'] = '✗ README.md missing';
	$all_passed = false;
}

// Display results
echo "\n" . str_repeat( "=", 50 ) . "\n";
echo "VERIFICATION RESULTS:\n";
echo str_repeat( "=", 50 ) . "\n";

foreach ( $checks as $check_name => $result ) {
	echo "$result\n";
}

echo "\n" . str_repeat( "=", 50 ) . "\n";

if ( $all_passed ) {
	echo "🎉 ALL CHECKS PASSED!\n\n";
	echo "Your CSS parser installation is ready to use.\n\n";
	echo "Next steps:\n";
	echo "1. Run tests: wp elementor css-parser-test\n";
	echo "2. Try manual tests: php tests/manual-test.php\n";
	echo "3. Review documentation: README.md\n";
	echo "4. Integrate with Global Classes (Phase 2)\n";
} else {
	echo "❌ SOME CHECKS FAILED!\n\n";
	echo "Please resolve the issues above before proceeding.\n\n";
	echo "Common solutions:\n";
	echo "- Run 'composer install' in this directory\n";
	echo "- Check file permissions\n";
	echo "- Verify PHP version (requires 7.4+)\n";
	echo "- Check WordPress installation\n";
}

echo "\n" . str_repeat( "=", 50 ) . "\n";

// Advanced test if everything passed
if ( $all_passed ) {
	echo "\nRunning advanced functionality test...\n";
	
	try {
		$advanced_css = "
			:root {
				--primary: #007cba;
				--spacing: 20px;
			}
			.button {
				background-color: var(--primary);
				padding: var(--spacing);
				border-radius: 8px;
			}
			.card:hover {
				transform: scale(1.05);
			}
			@media (max-width: 768px) {
				.responsive { display: none; }
			}
		";
		
		$parser = new CssParser();
		$parsed = $parser->parse( $advanced_css );
		$summary = $parser->get_conversion_summary( $parsed );
		
		echo "Advanced test results:\n";
		echo "- Classes extracted: {$summary['classes']['count']}\n";
		echo "- Variables extracted: {$summary['variables']['count']}\n";
		echo "- Unsupported CSS detected: " . ( $summary['unsupported']['has_content'] ? 'Yes' : 'No' ) . "\n";
		echo "- Original CSS size: {$summary['stats']['original_size']} bytes\n";
		
		if ( $summary['classes']['count'] === 1 && 
			 $summary['variables']['count'] === 2 && 
			 $summary['unsupported']['has_content'] === true ) {
			echo "\n✓ Advanced functionality test PASSED!\n";
		} else {
			echo "\n⚠ Advanced functionality test had unexpected results\n";
		}
		
	} catch ( Exception $e ) {
		echo "\n✗ Advanced functionality test FAILED: " . $e->getMessage() . "\n";
	}
}

echo "\nInstallation verification complete.\n"; 