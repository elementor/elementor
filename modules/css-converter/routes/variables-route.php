<?php
namespace Elementor\Modules\CssConverter\Routes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Parsers\CssParser;
use Elementor\Modules\CssConverter\Exceptions\CssParseException;
use Elementor\Modules\CssConverter\Variable_Conversion_Service;
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
		$header_token = isset( $_SERVER['HTTP_X_DEV_TOKEN'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_DEV_TOKEN'] ) ) : null;
		if ( $dev_token && $header_token && hash_equals( (string) $dev_token, $header_token ) ) {
			return true;
		}
		return current_user_can( 'manage_options' );
	}

	private function fallback_extract_css_variables( string $css ): array {
		$results = [];
		$css_variable_pattern = '/(--[a-zA-Z0-9_\-]+)\s*:\s*([^;}{]+);/';

		if ( preg_match_all( $css_variable_pattern, $css, $matches, PREG_SET_ORDER ) ) {
			foreach ( $matches as $match ) {
				$variable_name = isset( $match[1] ) ? trim( $match[1] ) : '';
				$variable_value = isset( $match[2] ) ? trim( $match[2] ) : '';

				if ( $this->is_valid_variable_name_and_value( $variable_name, $variable_value ) ) {
					$results[] = [
						'name' => $variable_name,
						'value' => $variable_value,
					];
				}
			}
		}

		return $results;
	}

	private function is_valid_variable_name_and_value( string $name, string $value ): bool {
		return '' !== $name && '' !== $value;
	}

	public function handle_variables_import( WP_REST_Request $request ) {
		$url = $request->get_param( 'url' );
		$css = $request->get_param( 'css' );

		if ( $this->is_invalid_url_or_css( $url, $css ) ) {
			return new WP_REST_Response( [ 'error' => 'Missing url or css' ], 400 );
		}

		if ( $this->should_fetch_from_url( $url ) ) {
			$fetch_result = $this->fetch_css_from_url( $url );
			if ( is_wp_error( $fetch_result ) || $fetch_result instanceof WP_REST_Response ) {
				return $fetch_result;
			}
			$css = $fetch_result;
		}

		if ( $this->is_empty_css( $css ) ) {
			return new WP_REST_Response( [ 'error' => 'Empty CSS' ], 422 );
		}

		$css = $this->remove_utf8_bom( $css );

        // TODO: Implement saving of variables.
        // We are logging the variables to a file for testing purposes only
		$logs_dir = $this->ensure_logs_directory();

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
				$raw[] = [
					'name' => $item['name'],
					'value' => $item['value'],
					'scope' => 'any',
					'original_block' => null,
				];
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
				$raw[] = [
					'name' => $item['name'],
					'value' => $item['value'],
					'scope' => 'any',
					'original_block' => null,
				];
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

		$converted = Variable_Conversion_Service::convert_to_editor_variables( $normalized );

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

        // TODO: Implement saving of variables.
        // We are saving the variables to a file for testing purposes only
		$this->save_editor_variables( $converted );

		return new WP_REST_Response( $results, 200 );
	}

	private function is_invalid_url_or_css( $url, $css ): bool {
		return ! is_string( $url ) && ! is_string( $css );
	}

	private function should_fetch_from_url( $url ): bool {
		return is_string( $url ) && '' !== trim( $url );
	}

	private function is_empty_css( $css ): bool {
		return ! is_string( $css ) || '' === $css;
	}

	private function has_utf8_bom( string $css ): bool {
		return 0 === strpos( $css, "\xEF\xBB\xBF" );
	}

	private function remove_utf8_bom( string $css ): string {
		if ( $this->has_utf8_bom( $css ) ) {
			return substr( $css, 3 );
		}
		return $css;
	}

	private function fetch_css_from_url( string $url ) {
		$response = wp_remote_get( $url );

		if ( $this->is_fetch_error( $response ) ) {
			return new WP_REST_Response( [
				'error' => 'Fetch failed',
				'details' => $response->get_error_message(),
			], 502 );
		}

		if ( $this->is_invalid_http_status( $response ) ) {
			$code = wp_remote_retrieve_response_code( $response );
			return new WP_REST_Response( [
				'error' => 'Fetch failed',
				'details' => 'HTTP ' . (string) $code,
			], 502 );
		}

		$content_type_validation = $this->validate_content_type( $response );
		if ( is_wp_error( $content_type_validation ) ) {
			return $content_type_validation;
		}

		return wp_remote_retrieve_body( $response );
	}

	private function is_fetch_error( $response ): bool {
		return is_wp_error( $response );
	}

	private function is_invalid_http_status( $response ): bool {
		$code = wp_remote_retrieve_response_code( $response );
		return 200 !== (int) $code;
	}

	private function validate_content_type( $response ) {
		$content_type = wp_remote_retrieve_header( $response, 'content-type' );

		if ( ! is_string( $content_type ) ) {
			return true;
		}

		if ( ! $this->is_css_content_type( $content_type ) ) {
			return new WP_REST_Response( [
				'error' => 'Invalid content-type',
				'details' => (string) $content_type,
			], 422 );
		}

		return true;
	}

	private function is_css_content_type( string $content_type ): bool {
		$lower = strtolower( $content_type );
		return false !== strpos( $lower, 'text/css' ) || false !== strpos( $lower, 'text/plain' );
	}

	private function ensure_logs_directory(): string {
		$logs_dir = __DIR__ . '/../logs';
		if ( ! file_exists( $logs_dir ) ) {
			wp_mkdir_p( $logs_dir );
		}
		return $logs_dir;
	}

	private function save_editor_variables( array $variables ): array {
		// TODO: Implement saving of variables.
	}

	private function format_variable_label( string $css_var_name ): string {
		$label = ltrim( $css_var_name, '-' );
		$label = str_replace( '-', ' ', $label );
		$label = ucwords( $label );
		return $label;
	}


}

new VariablesRoute();
