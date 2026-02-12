<?php
/**
 * Temporary test script to verify PHP hash_string matches TypeScript hashString
 * Run: php test-hash-comparison.php
 */

require_once __DIR__ . '/includes/utils.php';

use Elementor\Utils;

$test_cases = [
	'hello',
	'world',
	'instance-123_elem-1',
	'instance-456_elem-2',
	'test-string',
	'a',
	'abc',
	'very-long-string-with-many-characters',
	'',
	'elem-1',
	'parent-1',
	'child-1',
	'instance-123_parent-1_child-1',
];

echo "Testing hash_string PHP vs TypeScript\n";
echo "======================================\n\n";

foreach ( $test_cases as $input ) {
	echo "Input: '$input'\n";
	echo "  Full hash: " . Utils::hash_string( $input ) . "\n";
	echo "  7 chars:   " . Utils::hash_string( $input, 7 ) . "\n";
	echo "  6 chars:   " . Utils::hash_string( $input, 6 ) . "\n";
	echo "\n";
}

echo "\nNow run the TypeScript equivalent to compare:\n";
echo "cd packages && node -e \"";
echo "const { hashString } = require('./packages/libs/utils/dist/index.js'); ";
foreach ( $test_cases as $input ) {
	$escaped = addslashes( $input );
	echo "console.log('Input: \\\\'$escaped\\\\''); ";
	echo "console.log('  Full hash:', hashString('$escaped')); ";
	echo "console.log('  7 chars:  ', hashString('$escaped', 7)); ";
	echo "console.log('  6 chars:  ', hashString('$escaped', 6)); ";
	echo "console.log(''); ";
}
echo "\"\n";
