<?php
/**
 * Standalone test - PHP implementation of hashString
 */

function hash_string( string $str, ?int $max_length = null ): string {
	$hash_basis = 5381;
	$i = strlen( $str );

	while ( $i > 0 ) {
		$i--;
		$hash_basis = ( $hash_basis * 33 ) ^ ord( $str[ $i ] );
		$hash_basis = $hash_basis & 0xFFFFFFFF;
	}

	$result = base_convert( (string) $hash_basis, 10, 36 );

	if ( $max_length === null ) {
		return $result;
	}

	$padded = str_pad( $result, $max_length, '0', STR_PAD_LEFT );
	return substr( $padded, -$max_length );
}

$test_cases = [
	'hello',
	'world',
	'instance-123_elem-1',
	'instance-456_elem-2',
	'a',
	'elem-1',
	'',
];

echo "PHP hash_string results:\n";
echo "========================\n\n";

foreach ( $test_cases as $input ) {
	$display = $input === '' ? '(empty)' : $input;
	echo "Input: '$display'\n";
	echo "  Full:    " . hash_string( $input ) . "\n";
	echo "  7 chars: " . hash_string( $input, 7 ) . "\n";
	echo "\n";
}
