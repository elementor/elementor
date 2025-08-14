<?php
namespace Elementor\Modules\CssConverter\Routes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/../services/variables-service.php';
require_once __DIR__ . '/../parsers/css-parser.php';

use Elementor\Modules\CssConverter\Services\Variables_Service;
use Elementor\Modules\CssConverter\Parsers\CssParser;
use WP_REST_Request;
use WP_REST_Response;

add_action( 'rest_api_init', function () {
    register_rest_route( 'elementor/v2', '/css-converter/variables', [
        'methods' => 'POST',
        'callback' => __NAMESPACE__ . '\\handle_variables_import',
        'permission_callback' => function () {
            $allow_public = apply_filters( 'elementor_css_converter_allow_public_access', false );
            if ( $allow_public ) {
                return true;
            }
            $dev_token = defined( 'ELEMENTOR_CSS_CONVERTER_DEV_TOKEN' ) ? ELEMENTOR_CSS_CONVERTER_DEV_TOKEN : null;
            $header_token = isset( $_SERVER['HTTP_X_DEV_TOKEN'] ) ? (string) $_SERVER['HTTP_X_DEV_TOKEN'] : null;
            if ( $dev_token && $header_token && hash_equals( (string) $dev_token, $header_token ) ) {
                return true;
            }
            return current_user_can( 'manage_options' );
        },
    ] );
} );

function handle_variables_import( WP_REST_Request $request ) {
    $url = $request->get_param( 'url' );
    $css = $request->get_param( 'css' );

    if ( ! is_string( $url ) && ! is_string( $css ) ) {
        return new WP_REST_Response( [ 'error' => 'Missing url or css' ], 400 );
    }

    if ( is_string( $url ) && '' !== trim( $url ) ) {
        $response = wp_remote_get( $url );
        if ( is_wp_error( $response ) ) {
            return new WP_REST_Response( [ 'error' => 'Fetch failed', 'details' => $response->get_error_message() ], 502 );
        }
        $css = wp_remote_retrieve_body( $response );
    }

    if ( ! is_string( $css ) || '' === $css ) {
        return new WP_REST_Response( [ 'error' => 'Empty CSS' ], 422 );
    }

	$logs_dir = __DIR__ . '/../logs';
	if ( ! file_exists( $logs_dir ) ) {
		wp_mkdir_p( $logs_dir );
	}

	$basename = 'css-' . time();
	$css_path = $logs_dir . '/' . $basename . '.css';
	file_put_contents( $css_path, $css );

    $service = new Variables_Service();
    $converted = $service->variables_from_css_string( $css );

	$parser = new CssParser();
	$parsed = $parser->parse( $css );
	$raw = $parser->extract_variables( $parsed );
	$lines = [];
	foreach ( $raw as $item ) {
		$name = isset( $item['name'] ) ? $item['name'] : '';
		$value = isset( $item['value'] ) ? $item['value'] : '';
		$lines[] = $name . ' = ' . $value;
	}
	$vars_path = $logs_dir . '/' . $basename . '-variables.txt';
	file_put_contents( $vars_path, implode( "\n", $lines ) );

    $results = [
        'success' => true,
        'variables' => $converted,
        'rawVariables' => array_values( $raw ),
        'stats' => [
            'converted' => count( $converted ),
            'extracted' => count( $raw ),
            'skipped' => max( 0, count( $raw ) - count( $converted ) ),
        ],
        'logs' => [
            'css' => $css_path,
            'variables' => $vars_path,
        ],
    ];

    $should_persist = apply_filters( 'elementor_css_converter_should_persist_variables', false );
    if ( $should_persist ) {
        // Placeholder for future persistence integration with Global Variables repository
        // For MVP: no-op
    }

    return new WP_REST_Response( $results, 200 );
}


