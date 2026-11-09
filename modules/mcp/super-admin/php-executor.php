<?php

namespace Elementor\Modules\Mcp\Super_Admin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Php_Executor {

	const MAX_EXECUTION_TIME_SECONDS = 30;

	public static function execute( string $code ): array {
		$errors = [];

		$original_time_limit = (int) ini_get( 'max_execution_time' );
		set_time_limit( self::MAX_EXECUTION_TIME_SECONDS );

		$error_type_labels = [
			E_WARNING           => 'Warning',
			E_NOTICE            => 'Notice',
			E_DEPRECATED        => 'Deprecated',
			E_USER_WARNING      => 'User Warning',
			E_USER_NOTICE       => 'User Notice',
			E_USER_DEPRECATED   => 'User Deprecated',
			E_STRICT            => 'Strict',
			E_RECOVERABLE_ERROR => 'Recoverable Error',
		];

		set_error_handler( static function ( $errno, $errstr, $errfile, $errline ) use ( &$errors, $error_type_labels ) {
			$errors[] = [
				'type'    => $error_type_labels[ $errno ] ?? ( 'Unknown (' . (int) $errno . ')' ),
				'message' => (string) $errstr,
				'file'    => (string) $errfile,
				'line'    => (int) $errline,
			];
			return true;
		} );

		ob_start();
		$start = microtime( true );

		$return_value = null;
		$success = true;
		$error_message = null;
		$error_class = null;

		try {
			// phpcs:ignore Squiz.PHP.Eval.Discouraged -- This is the entire point of super admin.
			$return_value = eval( $code ); // @codingStandardsIgnoreLine
		} catch ( \Throwable $e ) {
			$success = false;
			$error_message = $e->getMessage();
			$error_class = get_class( $e );
		}

		$execution_time_ms = round( ( microtime( true ) - $start ) * 1000, 2 );
		$output = ob_get_clean();

		restore_error_handler();
		set_time_limit( $original_time_limit );

		if ( null !== $return_value && false === wp_json_encode( $return_value ) ) {
			$return_value = print_r( $return_value, true );
		}

		$result = [
			'success'           => $success,
			'return_value'      => $return_value,
			'output'            => is_string( $output ) ? $output : '',
			'errors'            => $errors,
			'execution_time_ms' => $execution_time_ms,
		];

		if ( null !== $error_message ) {
			$result['error_message'] = $error_message;
			$result['error_class']   = $error_class;
		}

		return $result;
	}
}
