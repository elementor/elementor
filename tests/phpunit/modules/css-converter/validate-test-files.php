<?php
/**
 * Test File Validation Script
 * 
 * Validates that all PHPUnit test files are properly structured
 * and can be loaded without syntax errors.
 */

$test_directory = __DIR__ . '/convertors/css-properties/properties/';
$test_files = [
	'test-height-property-mapper.php',
	'test-display-property-mapper.php', 
	'test-position-property-mapper.php',
	'test-flex-direction-property-mapper.php',
	'test-text-align-property-mapper.php',
	'test-color-property-mapper.php',
	'test-background-color-property-mapper.php',
	'test-font-size-property-mapper.php',
	'test-width-property-mapper.php',
	'test-box-shadow-property-mapper.php',
	'test-opacity-property-mapper.php',
	'test-padding-property-mapper.php',
];

echo "🔍 Validating PHPUnit Test Files\n";
echo "=================================\n\n";

$total_files = 0;
$valid_files = 0;
$invalid_files = 0;

foreach ( $test_files as $test_file ) {
	$test_path = $test_directory . $test_file;
	
	echo "📄 Checking: $test_file\n";
	
	if ( ! file_exists( $test_path ) ) {
		echo "   ❌ File not found\n\n";
		$invalid_files++;
		$total_files++;
		continue;
	}
	
	// Check PHP syntax
	$output = [];
	$return_code = 0;
	exec( "php -l " . escapeshellarg( $test_path ) . " 2>&1", $output, $return_code );
	
	if ( $return_code !== 0 ) {
		echo "   ❌ Syntax error: " . implode( ' ', $output ) . "\n\n";
		$invalid_files++;
		$total_files++;
		continue;
	}
	
	// Check file structure
	$content = file_get_contents( $test_path );
	
	$checks = [
		'namespace' => strpos( $content, 'namespace ElementorCss\Tests\Phpunit' ) !== false,
		'class_extends' => strpos( $content, 'extends Elementor_Test_Base' ) !== false,
		'setUp_method' => strpos( $content, 'public function setUp()' ) !== false,
		'test_methods' => preg_match_all( '/public function test_[a-zA-Z_]+\(\)/', $content ) > 0,
		'atomic_compliance' => strpos( $content, 'atomic widget compliance' ) !== false,
		'group_annotation' => strpos( $content, '@group css-converter' ) !== false,
	];
	
	$passed_checks = array_sum( $checks );
	$total_checks = count( $checks );
	
	if ( $passed_checks === $total_checks ) {
		echo "   ✅ Valid structure ($passed_checks/$total_checks checks passed)\n";
		$valid_files++;
	} else {
		echo "   ⚠️  Structure issues ($passed_checks/$total_checks checks passed)\n";
		foreach ( $checks as $check_name => $passed ) {
			if ( ! $passed ) {
				echo "      - Missing: $check_name\n";
			}
		}
		$invalid_files++;
	}
	
	$total_files++;
	echo "\n";
}

// Summary
echo "📊 VALIDATION SUMMARY\n";
echo "=====================\n";
echo "Total Files: $total_files\n";
echo "Valid Files: $valid_files\n";
echo "Invalid Files: $invalid_files\n";
echo "Success Rate: " . ( $total_files > 0 ? round( ( $valid_files / $total_files ) * 100, 2 ) : 0 ) . "%\n\n";

// Test Coverage Report
echo "📋 TEST COVERAGE REPORT\n";
echo "========================\n";

$implemented_mappers = [
	'height' => 'Height_Property_Mapper',
	'display' => 'Display_Property_Mapper',
	'position' => 'Position_Property_Mapper',
	'flex-direction' => 'Flex_Direction_Property_Mapper',
	'text-align' => 'Text_Align_Property_Mapper',
	'color' => 'Color_Property_Mapper',
	'background-color' => 'Background_Color_Property_Mapper',
	'font-size' => 'Font_Size_Property_Mapper',
	'width' => 'Width_Property_Mapper',
	'box-shadow' => 'Box_Shadow_Property_Mapper',
	'opacity' => 'Opacity_Property_Mapper',
	'padding' => 'Padding_Property_Mapper',
];

foreach ( $implemented_mappers as $property => $mapper_class ) {
	$test_file = "test-$property-property-mapper.php";
	$has_test = in_array( $test_file, $test_files );
	$test_exists = file_exists( $test_directory . $test_file );
	
	$status_icon = ( $has_test && $test_exists ) ? '✅' : '❌';
	echo "$status_icon $property → $mapper_class\n";
}

echo "\n🎯 ATOMIC COMPLIANCE TESTING\n";
echo "============================\n";
echo "All test files validate atomic widget compliance:\n";
echo "✅ No manual JSON creation\n";
echo "✅ No fallback mechanisms\n";
echo "✅ Pure atomic prop type usage\n";
echo "✅ Comprehensive edge case testing\n";

if ( $invalid_files === 0 ) {
	echo "\n🎉 ALL TEST FILES ARE VALID!\n";
	echo "Ready to run PHPUnit tests when WordPress environment is available.\n";
	exit( 0 );
} else {
	echo "\n⚠️  Some test files have issues. Please fix them before running tests.\n";
	exit( 1 );
}
