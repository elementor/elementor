<?php
/**
 * WP-CLI HTTP bridge for wp-playground (local Playwright runs only).
 *
 * WASM PHP has no process model, so proc_open / exec cannot spawn wp-cli.
 * This mirrors Playground's own `wp-cli` Blueprint step: a standalone script
 * that fakes a shell environment ($argv, STDIN/STDOUT/STDERR, SHELL_PIPE) and
 * requires wp-cli.phar, letting WP-CLI bootstrap WordPress by itself.
 *
 * It must never load WordPress first - WP-CLI loads its own copy and would
 * fatal on redeclaration. That is why this is a plain script and not an
 * mu-plugin.
 *
 * Reached over HTTP by tests/playwright/assets/wp-cli.ts through the repo
 * mount at /wordpress/wp-content/plugins/elementor, so edits apply without
 * restarting the playground.
 *
 * @package Elementor\Tests\Playground
 */

const ELEMENTOR_BRIDGE_PHAR_PATH = '/tmp/wp-cli.phar';
const ELEMENTOR_BRIDGE_STDERR_PATH = '/tmp/elementor-wp-cli-bridge-stderr';
const ELEMENTOR_BRIDGE_DOCUMENT_ROOT = '/wordpress';

function elementor_bridge_respond( array $payload, $status ) {
	if ( ! headers_sent() ) {
		http_response_code( $status );
		header( 'Content-Type: application/json' );
	}

	echo json_encode( $payload );
}

function elementor_bridge_split_command( $command ) {
	$args = [];
	$current = '';
	$quote = '';
	$length = strlen( $command );

	for ( $i = 0; $i < $length; $i++ ) {
		$char = $command[ $i ];

		if ( '\\' === $char && $i + 1 < $length ) {
			$current .= $command[ ++$i ];
			continue;
		}

		if ( '' !== $quote ) {
			if ( $char === $quote ) {
				$quote = '';
			} else {
				$current .= $char;
			}
			continue;
		}

		if ( '"' === $char || "'" === $char ) {
			$quote = $char;
			continue;
		}

		if ( preg_match( '/\s/', $char ) ) {
			if ( '' !== $current ) {
				$args[] = $current;
				$current = '';
			}
			continue;
		}

		$current .= $char;
	}

	if ( '' !== $current ) {
		$args[] = $current;
	}

	return $args;
}

$request_body = json_decode( file_get_contents( 'php://input' ), true );
$command = trim( $request_body['command'] ?? '' );

if ( '' === $command ) {
	elementor_bridge_respond( [ 'error' => 'Missing "command" in request body' ], 400 );
	exit;
}

if ( ! file_exists( ELEMENTOR_BRIDGE_PHAR_PATH ) ) {
	elementor_bridge_respond(
		[ 'error' => 'wp-cli.phar not found at ' . ELEMENTOR_BRIDGE_PHAR_PATH . '. Add "wp-cli" to the blueprint extraLibraries.' ],
		500
	);
	exit;
}

$args = elementor_bridge_split_command( $command );

if ( 'wp' === ( $args[0] ?? '' ) ) {
	array_shift( $args );
}

// WP-CLI renders ASCII tables instead of TSV when it believes it owns a TTY.
putenv( 'SHELL_PIPE=0' );

$GLOBALS['argv'] = array_merge( [ ELEMENTOR_BRIDGE_PHAR_PATH, '--path=' . ELEMENTOR_BRIDGE_DOCUMENT_ROOT ], $args );
$GLOBALS['argc'] = count( $GLOBALS['argv'] );
$_SERVER['argv'] = $GLOBALS['argv'];
$_SERVER['argc'] = $GLOBALS['argc'];

file_put_contents( ELEMENTOR_BRIDGE_STDERR_PATH, '' );

define( 'STDIN', fopen( 'php://memory', 'rb' ) );
define( 'STDOUT', fopen( 'php://output', 'wb' ) );
define( 'STDERR', fopen( ELEMENTOR_BRIDGE_STDERR_PATH, 'wb' ) );

ob_start();

register_shutdown_function( function () {
	// PHP echoes the phar's `#!/usr/bin/env php` shebang as plain text on require.
	$stdout = preg_replace( '/^#![^\n]*\n/', '', ob_get_clean() );
	$stderr = file_get_contents( ELEMENTOR_BRIDGE_STDERR_PATH );
	$fatal = error_get_last();
	$is_fatal = $fatal && in_array( $fatal['type'], [ E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR, E_RECOVERABLE_ERROR ], true );
	$failed = $is_fatal || false !== strpos( $stderr, 'Error:' );

	elementor_bridge_respond(
		[
			'argv' => $GLOBALS['argv'],
			'stdout' => $stdout,
			'stderr' => $stderr,
			'fatal' => $fatal,
		],
		$failed ? 500 : 200
	);
} );

require ELEMENTOR_BRIDGE_PHAR_PATH;
