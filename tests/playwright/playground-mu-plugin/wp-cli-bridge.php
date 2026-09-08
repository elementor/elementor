<?php
/**
 * Plugin Name: Elementor Test WP-CLI Bridge (Playground only)
 * Description: Exposes an HTTP endpoint that runs wp-cli.phar in-process so Playwright tests can run wp-cli commands against a running wp-playground server. Mounted only via tests/playwright/blueprints/local.json.
 *
 * WASM PHP has no process model, so proc_open / exec cannot spawn a child
 * wp-cli. Instead we mimic what Playground's own `wp-cli` blueprint step does:
 * set up $argv, forward WP-CLI's own PHP constants, and require wp-cli.phar
 * inside the current PHP request.
 *
 * @package Elementor\Tests\Playground
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'muplugins_loaded', function () {
	if ( ! isset( $_GET['elementor_test_wp_cli_bridge'] ) ) {
		return;
	}

	$body = json_decode( file_get_contents( 'php://input' ), true );
	$command = trim( $body['command'] ?? '' );

	if ( '' === $command ) {
		wp_send_json( [ 'error' => 'Missing "command" in request body' ], 400 );
	}

	$wp_cli_phar = '/tmp/wp-cli.phar';

	if ( ! file_exists( $wp_cli_phar ) ) {
		wp_send_json( [ 'error' => 'wp-cli.phar not found at ' . $wp_cli_phar ], 500 );
	}

	$args = elementor_test_split_shell_command( $command );

	if ( isset( $args[0] ) && 'wp' === $args[0] ) {
		array_shift( $args );
	}

	array_unshift( $args, 'wp', '--path=' . rtrim( ABSPATH, '/' ), '--allow-root' );

	global $argv, $argc;
	$argv = $args;
	$argc = count( $args );
	$_SERVER['argv'] = $argv;
	$_SERVER['argc'] = $argc;

	if ( ! defined( 'WP_CLI_ROOT' ) ) {
		define( 'WP_CLI_ROOT', $wp_cli_phar );
	}

	ob_start();
	$exit_code = 0;

	try {
		require $wp_cli_phar;
	} catch ( \Throwable $e ) {
		$exit_code = 1;
		echo "\n[bridge] Exception: " . $e->getMessage() . "\n" . $e->getTraceAsString();
	}

	$output = ob_get_clean();

	wp_send_json( [
		'argv' => $argv,
		'exit_code' => $exit_code,
		'output' => $output,
	], 0 === $exit_code ? 200 : 500 );
}, 1 );

function elementor_test_split_shell_command( $command ) {
	$args = [];
	$current = '';
	$in_single = false;
	$in_double = false;
	$len = strlen( $command );

	for ( $i = 0; $i < $len; $i++ ) {
		$char = $command[ $i ];

		if ( '\\' === $char && $i + 1 < $len ) {
			$current .= $command[ ++$i ];
			continue;
		}

		if ( "'" === $char && ! $in_double ) {
			$in_single = ! $in_single;
			continue;
		}

		if ( '"' === $char && ! $in_single ) {
			$in_double = ! $in_double;
			continue;
		}

		if ( ' ' === $char && ! $in_single && ! $in_double ) {
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
