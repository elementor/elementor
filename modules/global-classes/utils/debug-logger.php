<?php

namespace Elementor\Modules\GlobalClasses\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Debug_Logger {
	/**
	 * Logs debug information for REST API requests
	 *
	 * @param \WP_REST_Request $request The request object
	 * @return void
	 */
	public static function log_request_debug( $request ) {
		$debug_data = [
			'url' => $request->get_route(),
			'params' => $request->get_params(),
			'body' => $request->get_body(),
			'headers' => $request->get_headers(),
		];

		error_log( 'Elementor Global Classes REST API Debug: ' . json_encode( $debug_data, JSON_PRETTY_PRINT ) );
	}

	/**
	 * Logs validation errors
	 *
	 * @param string $context Context of the validation (e.g., 'items', 'order')
	 * @param string $errors Error string
	 * @return void
	 */
	public static function log_validation_errors( $context, $errors ) {
		error_log( "Elementor Global Classes: Invalid {$context}. Errors: {$errors}" );
	}

	/**
	 * Logs modified labels information
	 *
	 * @param array $modified_labels Array of modified labels
	 * @return void
	 */
	public static function log_modified_labels( $modified_labels ) {
		if ( ! empty( $modified_labels ) ) {
			error_log( 'Elementor Global Classes: Modified duplicate labels: ' . json_encode( $modified_labels ) );
		}
	}
}
