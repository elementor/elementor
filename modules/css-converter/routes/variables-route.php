<?php
namespace Elementor\Modules\CssConverter\Routes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/../parsers/css-parser.php';
require_once __DIR__ . '/../variable-conversion.php';

use Elementor\Modules\CssConverter\Parsers\CssParser;
use Elementor\Modules\CssConverter\Exceptions\CssParseException;
use function Elementor\Modules\CssConverter\elementor_css_variables_convert_to_editor_variables;
use WP_REST_Request;
use WP_REST_Response;

class VariablesRoute {

	public function __construct() {
		add_action( 'rest_api_init', [ $this, 'register_route' ] );
	}

	public function register_route() {
		register_rest_route( 'elementor/v2', '/css-converter/variables', [
			'methods' => 'POST',
			'callback' => [ $this, 'handle_variables_import' ],
			'permission_callback' => [ $this, 'check_permissions' ],
		] );
	}

	public function check_permissions() {
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
	}

	private function fallback_extract_css_variables( string $css ): array {
		$results = [];
		if ( preg_match_all( '/(--[a-zA-Z0-9_\-]+)\s*:\s*([^;}{]+);/', $css, $matches, PREG_SET_ORDER ) ) {
			foreach ( $matches as $m ) {
				$name = isset( $m[1] ) ? trim( $m[1] ) : '';
				$value = isset( $m[2] ) ? trim( $m[2] ) : '';
				if ( '' !== $name && '' !== $value ) {
					$results[] = [ 'name' => $name, 'value' => $value ];
				}
			}
		}
		return $results;
	}

	public function handle_variables_import( WP_REST_Request $request ) {
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
        $code = wp_remote_retrieve_response_code( $response );
        if ( 200 !== (int) $code ) {
            return new WP_REST_Response( [ 'error' => 'Fetch failed', 'details' => 'HTTP ' . (string) $code ], 502 );
        }
        $content_type = wp_remote_retrieve_header( $response, 'content-type' );
        if ( is_string( $content_type ) ) {
            $lower = strtolower( $content_type );
            $is_css_like = false !== strpos( $lower, 'text/css' ) || false !== strpos( $lower, 'text/plain' );
            if ( ! $is_css_like ) {
                return new WP_REST_Response( [ 'error' => 'Invalid content-type', 'details' => (string) $content_type ], 422 );
            }
        }
        $css = wp_remote_retrieve_body( $response );
    }

    if ( ! is_string( $css ) || '' === $css ) {
        return new WP_REST_Response( [ 'error' => 'Empty CSS' ], 422 );
    }

    if ( 0 === strpos( $css, "\xEF\xBB\xBF" ) ) {
        $css = substr( $css, 3 );
    }

	$logs_dir = __DIR__ . '/../logs';
	if ( ! file_exists( $logs_dir ) ) {
		wp_mkdir_p( $logs_dir );
	}

	$basename = 'css-' . time();
	$css_path = $logs_dir . '/' . $basename . '.css';
	file_put_contents( $css_path, $css );

    $parser = new CssParser();
    $raw = [];
    try {
        $parsed = $parser->parse( $css );
        $raw = $parser->extract_variables( $parsed );
    } catch ( CssParseException $e ) {
        $fallback = $this->fallback_extract_css_variables( $css );
        if ( empty( $fallback ) ) {
            return new WP_REST_Response( [
                'error' => 'Failed to parse CSS',
                'details' => $e->getMessage(),
                'logs' => [ 'css' => $css_path ],
            ], 422 );
        }
        foreach ( $fallback as $item ) {
            $raw[] = [ 'name' => $item['name'], 'value' => $item['value'], 'scope' => 'any', 'original_block' => null ];
        }
    } catch ( \Throwable $e ) {
        $fallback = $this->fallback_extract_css_variables( $css );
        if ( empty( $fallback ) ) {
            return new WP_REST_Response( [
                'error' => 'Failed to parse CSS',
                'details' => 'Unexpected error',
                'logs' => [ 'css' => $css_path ],
            ], 422 );
        }
        foreach ( $fallback as $item ) {
            $raw[] = [ 'name' => $item['name'], 'value' => $item['value'], 'scope' => 'any', 'original_block' => null ];
        }
    }
	$lines = [];
	foreach ( $raw as $item ) {
		$name = isset( $item['name'] ) ? $item['name'] : '';
		$value = isset( $item['value'] ) ? $item['value'] : '';
		$lines[] = $name . ' = ' . $value;
	}
    $vars_path = $logs_dir . '/' . $basename . '-variables.txt';
    file_put_contents( $vars_path, implode( "\n", $lines ) );

    $normalized = [];
    foreach ( $raw as $item ) {
        $normalized[] = [
            'name' => isset( $item['name'] ) ? $item['name'] : '',
            'value' => isset( $item['value'] ) ? $item['value'] : '',
        ];
    }

    $converted = elementor_css_variables_convert_to_editor_variables( $normalized );

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
        // no-op for MVP
    }

    return new WP_REST_Response( $results, 200 );
	}
}

new VariablesRoute();
