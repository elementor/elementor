<?php
/**
 * Prints a file's contents with comments blanked out, preserving line
 * numbers, so bin/check-twig-safety.sh doesn't false-positive on docblocks
 * or // comments that merely mention a forbidden Twig API by name.
 *
 * PHP files: uses the tokenizer to blank T_COMMENT / T_DOC_COMMENT tokens
 * only (string literals and real code are left untouched).
 * Everything else (e.g. .twig): blanks {# ... #} comments via regex.
 *
 * Usage: php strip-comments.php <file>
 */

if ( $argc < 2 ) {
	fwrite( STDERR, "Usage: php strip-comments.php <file>\n" );
	exit( 1 );
}

$path = $argv[1];
$contents = file_get_contents( $path );

if ( false === $contents ) {
	fwrite( STDERR, "Unable to read {$path}\n" );
	exit( 1 );
}

function blank( string $text ): string {
	return str_repeat( "\n", substr_count( $text, "\n" ) );
}

if ( preg_match( '/\.php$/', $path ) ) {
	$output = '';

	foreach ( token_get_all( $contents ) as $token ) {
		if ( is_array( $token ) ) {
			[ $id, $text ] = $token;
			$output .= in_array( $id, [ T_COMMENT, T_DOC_COMMENT ], true ) ? blank( $text ) : $text;
		} else {
			$output .= $token;
		}
	}

	echo $output;
	exit( 0 );
}

echo preg_replace_callback( '/\{#.*?#\}/s', fn( $m ) => blank( $m[0] ), $contents );
