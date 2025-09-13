<?php
namespace Elementor\Modules\CssConverter\Routes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Services\Class_Conversion_Service;
use Elementor\Modules\CssConverter\Config\Class_Converter_Config;
use Elementor\Modules\CssConverter\Exceptions\Class_Conversion_Exception;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use WP_REST_Request;
use WP_REST_Response;

class Classes_Route {
	private $conversion_service;
	private $config;

	public function __construct( $conversion_service = null, $config = null ) {
		$this->conversion_service = $conversion_service;
		$this->config = $config ?: Class_Converter_Config::get_instance();
		add_action( 'rest_api_init', [ $this, 'register_route' ] );
	}

	private function get_conversion_service() {
		if ( null === $this->conversion_service ) {
			$this->conversion_service = new Class_Conversion_Service();
		}
		return $this->conversion_service;
	}

	public function register_route() {
		register_rest_route( 'elementor/v2', '/css-converter/classes', [
			'methods' => 'POST',
			'callback' => [ $this, 'handle_classes_import' ],
			'permission_callback' => [ $this, 'check_permissions' ],
			'args' => [
				'css' => [
					'required' => false,
					'type' => 'string',
					'description' => 'CSS string to convert',
				],
				'url' => [
					'required' => false,
					'type' => 'string',
					'description' => 'URL to fetch CSS from',
				],
				'store' => [
					'required' => false,
					'type' => 'boolean',
					'default' => true,
					'description' => 'Whether to store converted classes in Global Classes',
				],
			],
		] );
	}

	public function check_permissions() {
		$allow_public = apply_filters( 'elementor_css_converter_allow_public_access', false );
		if ( $allow_public ) {
			return true;
		}

		return current_user_can( 'manage_options' );
	}

	public function handle_classes_import( WP_REST_Request $request ) {
		$url = $request->get_param( 'url' );
		$css = $request->get_param( 'css' );
		$store = $request->get_param( 'store' );

		// Input validation
		$validation_error = $this->validate_request( $request );
		if ( $validation_error ) {
			return $validation_error;
		}

		if ( $this->is_invalid_url_or_css( $url, $css ) ) {
			return new WP_REST_Response( [ 'error' => 'Missing url or css parameter' ], 400 );
		}

		if ( $this->should_fetch_from_url( $url ) ) {
			$fetch_result = $this->fetch_css_from_url( $url );
			if ( is_wp_error( $fetch_result ) || $fetch_result instanceof WP_REST_Response ) {
				return $fetch_result;
			}
			$css = $fetch_result;
		}

		if ( $this->is_empty_css( $css ) ) {
			return new WP_REST_Response( [ 'error' => 'Empty CSS provided' ], 422 );
		}

		$css = $this->remove_utf8_bom( $css );

		$logs_dir = $this->ensure_logs_directory();
		$basename = 'css-classes-' . time();
		$css_path = $logs_dir . '/' . $basename . '.css';
		file_put_contents( $css_path, $css );

		try {
			$service = $this->get_conversion_service();
			$results = $service->convert_css_to_global_classes( $css );

			if ( $store && ! empty( $results['converted_classes'] ) ) {
				$storage_result = $this->store_global_classes( $results['converted_classes'] );
				$results['storage'] = $storage_result;
			}

			$results['logs'] = [
				'css' => $css_path,
			];

			return new WP_REST_Response( [
				'success' => true,
				'data' => $results,
			], 200 );

		} catch ( Class_Conversion_Exception $e ) {
			return new WP_REST_Response( [
				'error' => 'Conversion failed',
				'details' => $e->getMessage(),
				'logs' => [ 'css' => $css_path ],
			], 422 );
		} catch ( \Throwable $e ) {
			return new WP_REST_Response( [
				'error' => 'Unexpected error',
				'details' => 'An unexpected error occurred during conversion',
				'logs' => [ 'css' => $css_path ],
			], 500 );
		}
	}

	private function store_global_classes( array $classes ): array {
		try {
			$repository = Global_Classes_Repository::make();
			$current_classes = $repository->all();

			$updated_items = $current_classes->get_items()->all();
			$updated_order = $current_classes->get_order()->all();

			$stored_count = 0;
			$errors = [];

			foreach ( $classes as $class ) {
				try {
					$updated_items[ $class['id'] ] = $class;
					$updated_order[] = $class['id'];
					$stored_count++;
				} catch ( \Exception $e ) {
					$errors[] = [
						'class_id' => $class['id'],
						'error' => $e->getMessage(),
					];
				}
			}

			if ( $stored_count > 0 ) {
				$repository->put( $updated_items, $updated_order );
			}

			return [
				'stored' => $stored_count,
				'errors' => $errors,
			];

		} catch ( \Exception $e ) {
			return [
				'stored' => 0,
				'errors' => [
					[
						'error' => 'Failed to store classes: ' . $e->getMessage(),
					],
				],
			];
		}
	}

	private function is_invalid_url_or_css( $url, $css ): bool {
		return ! is_string( $url ) && ! is_string( $css );
	}

	private function should_fetch_from_url( $url ): bool {
		return is_string( $url ) && '' !== trim( $url );
	}

	private function is_empty_css( $css ): bool {
		return ! is_string( $css ) || '' === trim( $css );
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

		if ( is_wp_error( $response ) ) {
			return new WP_REST_Response( [
				'error' => 'Fetch failed',
				'details' => $response->get_error_message(),
			], 502 );
		}

		$code = wp_remote_retrieve_response_code( $response );
		if ( 200 !== (int) $code ) {
			return new WP_REST_Response( [
				'error' => 'Fetch failed',
				'details' => 'HTTP ' . (string) $code,
			], 502 );
		}

		$content_type = wp_remote_retrieve_header( $response, 'content-type' );
		if ( is_string( $content_type ) && ! $this->is_css_content_type( $content_type ) ) {
			return new WP_REST_Response( [
				'error' => 'Invalid content-type',
				'details' => (string) $content_type,
			], 422 );
		}

		return wp_remote_retrieve_body( $response );
	}

	private function is_css_content_type( string $content_type ): bool {
		$lower = strtolower( $content_type );
		return false !== strpos( $lower, 'text/css' ) || false !== strpos( $lower, 'text/plain' );
	}

	private function validate_request( WP_REST_Request $request ): ?WP_REST_Response {
		$css = $request->get_param( 'css' );
		
		// Check CSS size limit
		if ( is_string( $css ) && strlen( $css ) > $this->config->get_max_css_size() ) {
			return new WP_REST_Response( [
				'error' => 'CSS too large',
				'details' => 'Maximum size: ' . $this->config->get_max_css_size() . ' bytes',
			], 413 );
		}

		// Rate limiting (simple implementation)
		if ( $this->is_rate_limited() ) {
			return new WP_REST_Response( [
				'error' => 'Rate limit exceeded',
				'details' => 'Too many requests. Please try again later.',
			], 429 );
		}

		return null;
	}

	private function is_rate_limited(): bool {
		$user_id = get_current_user_id();
		$key = "css_converter_rate_limit_{$user_id}";
		$requests = get_transient( $key );

		if ( false === $requests ) {
			set_transient( $key, 1, MINUTE_IN_SECONDS );
			return false;
		}

		if ( $requests >= 10 ) { // 10 requests per minute
			return true;
		}

		set_transient( $key, $requests + 1, MINUTE_IN_SECONDS );
		return false;
	}

	private function ensure_logs_directory(): string {
		$logs_dir = __DIR__ . '/../' . $this->config->get_log_directory();
		if ( ! file_exists( $logs_dir ) ) {
			wp_mkdir_p( $logs_dir );
		}
		return $logs_dir;
	}
}
