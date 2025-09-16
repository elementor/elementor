<?php
namespace Elementor\Modules\CssConverter\Routes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Services\Widget_Conversion_Service;
use Elementor\Modules\CssConverter\Services\Request_Validator;
use Elementor\Modules\CssConverter\Config\Class_Converter_Config;
use Elementor\Modules\CssConverter\Exceptions\Class_Conversion_Exception;
use WP_REST_Request;
use WP_REST_Response;

class Widgets_Route {
	private $conversion_service;
	private $request_validator;
	private $config;

	public function __construct( $conversion_service = null, $config = null ) {
		$this->conversion_service = $conversion_service;
		$this->request_validator = new Request_Validator();
		$this->config = $config ?: Class_Converter_Config::get_instance();
		add_action( 'rest_api_init', [ $this, 'register_route' ] );
	}

	private function get_conversion_service() {
		if ( null === $this->conversion_service ) {
			$this->conversion_service = new Widget_Conversion_Service();
		}
		return $this->conversion_service;
	}

	public function register_route() {
		register_rest_route( 'elementor/v2', '/widget-converter', [
			'methods' => 'POST',
			'callback' => [ $this, 'handle_widget_conversion' ],
			'permission_callback' => [ $this, 'check_permissions' ],
			'args' => [
				'type' => [
					'required' => true,
					'type' => 'string',
					'enum' => [ 'url', 'html', 'css' ],
					'description' => 'Input type: url, html, or css',
				],
				'content' => [
					'required' => true,
					'type' => 'string',
					'description' => 'HTML content or URL to convert',
				],
				'cssUrls' => [
					'required' => false,
					'type' => 'array',
					'description' => 'Array of CSS file URLs to include',
				],
				'followImports' => [
					'required' => false,
					'type' => 'boolean',
					'default' => false,
					'description' => 'Whether to follow @import statements in CSS',
				],
				'options' => [
					'required' => false,
					'type' => 'object',
					'properties' => [
						'postId' => [
							'type' => [ 'integer', 'null' ],
							'description' => 'Post ID to update, null to create new',
						],
						'postType' => [
							'type' => 'string',
							'default' => 'page',
							'description' => 'Post type for new posts',
						],
						'preserveIds' => [
							'type' => 'boolean',
							'default' => false,
							'description' => 'Whether to preserve HTML element IDs',
						],
						'createGlobalClasses' => [
							'type' => 'boolean',
							'default' => true,
							'description' => 'Whether to create global classes from CSS classes',
						],
						'timeout' => [
							'type' => 'integer',
							'default' => 30,
							'minimum' => 1,
							'maximum' => 300,
							'description' => 'Timeout in seconds for URL fetching (1-300)',
						],
						'globalClassThreshold' => [
							'type' => 'integer',
							'default' => 1,
							'minimum' => 1,
							'maximum' => 100,
							'description' => 'Minimum usage count to create global class (1-100)',
						],
					],
				],
			],
		] );
	}

	public function check_permissions() {
		$allow_public = apply_filters( 'elementor_css_converter_allow_public_access', false );
		if ( $allow_public ) {
			return true;
		}

		// Check for X-DEV-TOKEN header authentication
		$dev_token = defined( 'ELEMENTOR_CSS_CONVERTER_DEV_TOKEN' ) ? ELEMENTOR_CSS_CONVERTER_DEV_TOKEN : null;
		$header_token = isset( $_SERVER['HTTP_X_DEV_TOKEN'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_DEV_TOKEN'] ) ) : null;
		if ( $dev_token && $header_token && hash_equals( (string) $dev_token, $header_token ) ) {
			return true;
		}

		return current_user_can( 'edit_posts' );
	}

	public function handle_widget_conversion( WP_REST_Request $request ) {
		$type = $request->get_param( 'type' );
		$content = $request->get_param( 'content' );
		$css_urls = $request->get_param( 'cssUrls' ) ?: [];
		$follow_imports = $request->get_param( 'followImports' ) ?: false;
		$options = $request->get_param( 'options' ) ?: [];

		// Enhanced input validation using Request_Validator
		$validation_error = $this->request_validator->validate_widget_conversion_request( $request );
		if ( $validation_error ) {
			return $validation_error;
		}

		try {
			$service = $this->get_conversion_service();
			
			// Process based on input type
			switch ( $type ) {
				case 'url':
					$result = $service->convert_from_url( $content, $css_urls, $follow_imports, $options );
					break;
				case 'html':
					$result = $service->convert_from_html( $content, $css_urls, $follow_imports, $options );
					break;
				case 'css':
					$result = $service->convert_from_css( $content, $css_urls, $follow_imports, $options );
					break;
				default:
					return new WP_REST_Response( [ 'error' => 'Invalid input type' ], 400 );
			}

			return new WP_REST_Response( $result, 200 );

		} catch ( Class_Conversion_Exception $e ) {
			return new WP_REST_Response( [
				'error' => 'Conversion failed',
				'message' => $e->getMessage(),
			], 400 );
		} catch ( \Exception $e ) {
			return new WP_REST_Response( [
				'error' => 'Internal server error',
				'message' => $e->getMessage(),
			], 500 );
		}
	}

	private function validate_request( WP_REST_Request $request ) {
		$type = $request->get_param( 'type' );
		$content = $request->get_param( 'content' );

		// Basic validation
		if ( empty( $content ) ) {
			return new WP_REST_Response( [ 'error' => 'Content parameter is required' ], 400 );
		}

		// URL validation
		if ( 'url' === $type && ! filter_var( $content, FILTER_VALIDATE_URL ) ) {
			return new WP_REST_Response( [ 'error' => 'Invalid URL provided' ], 400 );
		}

		// Size limits (HVV requirement: 10MB HTML, 5MB CSS)
		$content_size = strlen( $content );
		$max_size = ( 'html' === $type ) ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB for HTML, 5MB for CSS

		if ( $content_size > $max_size ) {
			return new WP_REST_Response( [
				'error' => 'Content too large',
				'message' => sprintf( 'Content size (%s) exceeds maximum allowed (%s)', 
					size_format( $content_size ), 
					size_format( $max_size ) 
				),
			], 413 );
		}

		// Security validation - block dangerous content
		if ( 'html' === $type ) {
			$dangerous_patterns = [
				'/<script[^>]*>/i',
				'/<object[^>]*>/i',
				'/javascript:/i',
				'/data:.*base64/i',
			];

			foreach ( $dangerous_patterns as $pattern ) {
				if ( preg_match( $pattern, $content ) ) {
					return new WP_REST_Response( [
						'error' => 'Security violation',
						'message' => 'Content contains potentially dangerous elements',
					], 400 );
				}
			}
		}

		return null;
	}

	private function ensure_logs_directory() {
		$upload_dir = wp_upload_dir();
		$logs_dir = $upload_dir['basedir'] . '/elementor-css-converter-logs';

		if ( ! file_exists( $logs_dir ) ) {
			wp_mkdir_p( $logs_dir );
		}

		return $logs_dir;
	}
}
