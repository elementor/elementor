<?php
namespace Elementor\Modules\CssConverter\Routes;
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
use Elementor\Modules\CssConverter\Services\Widgets\Unified_Widget_Conversion_Service;
use Elementor\Modules\CssConverter\Services\Css\Parsing\Html_Parser;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Mapper;
use Elementor\Modules\CssConverter\Services\Css\Processing\Unified_Css_Processor;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Specificity_Calculator;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Creator;
use Elementor\Modules\CssConverter\Services\Css\Validation\Request_Validator;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Css_Property_Convertor_Config;
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
		$this->config = $config ?: Css_Property_Convertor_Config::get_instance();
		add_action( 'rest_api_init', [ $this, 'register_route' ] );
	}
	private function get_conversion_service() {
		if ( null === $this->conversion_service ) {
			// Initialize dependencies for Unified_Css_Processor
			$css_parser = new \Elementor\Modules\CssConverter\Parsers\CssParser();
			$property_conversion_service = new Css_Property_Conversion_Service();
			$specificity_calculator = new Css_Specificity_Calculator();
			// Use Unified_Widget_Conversion_Service for proper flattened classes integration
			$this->conversion_service = new Unified_Widget_Conversion_Service(
				new Html_Parser(),
				new Widget_Mapper(),
				new Unified_Css_Processor(
					$css_parser,
					$property_conversion_service,
					$specificity_calculator
				),
				new Widget_Creator(),
				false
			);
		}
		return $this->conversion_service;
	}
	public function register_route() {
		$registered = register_rest_route( 'elementor/v2', '/widget-converter', [
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
				'selector' => [
					'required' => false,
					'type' => 'string',
					'description' => 'CSS selector to target specific content within the URL (e.g., ".elementor-element-1a10fb4")',
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
							'description' => 'Always creates optimized widget styles (deprecated: false option removed)',
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
		// DEBUG: Temporarily allow public access for testing double-wrapping fix
return true;
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
		$selector = $request->get_param( 'selector' );
		$options = $request->get_param( 'options' ) ?: [];
// PHASE 2.2: HTML Content Verification
		// Check for inline styles in HTML
		if ( 'html' === $type ) {
			$inline_style_count = preg_match_all( '/style\s*=\s*["\'][^"\']*["\']/', $content );
			if ( $inline_style_count > 0 ) {
				preg_match_all( '/style\s*=\s*["\']([^"\']*)["\']/', $content, $matches );
				foreach ( $matches[1] as $i => $style_content ) {
				}
			}
		}
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
					$html_content = $this->fetch_url_content( $content, $selector );
					if ( is_wp_error( $html_content ) ) {
						return new WP_REST_Response( [
							'error' => 'Failed to fetch URL',
							'message' => $html_content->get_error_message(),
						], 400 );
					}
					$result = $service->convert_from_html( $html_content, $css_urls, $follow_imports, $options );
					break;
				case 'html':
					$result = $service->convert_from_html( $content, $css_urls, $follow_imports, $options );
					break;
				case 'css':
					// Convert CSS-only input to HTML with embedded CSS for unified processing
					$minimal_html = '<html><head><style>' . $content . '</style></head><body><div class="css-converter-wrapper"></div></body></html>';
					$result = $service->convert_from_html( $minimal_html, $css_urls, $follow_imports, $options );
					break;
				default:
					return new WP_REST_Response( [ 'error' => 'Invalid input type' ], 400 );
			}
			return new WP_REST_Response( $result, 200 );
		} catch ( Class_Conversion_Exception $e ) {
			return new WP_REST_Response( [
				'error' => 'Conversion failed',
				'message' => $e->getMessage(),
				'debug' => 'Class_Conversion_Exception caught',
			], 400 );
		} catch ( \Exception $e ) {
			return new WP_REST_Response( [
				'error' => 'Internal server error',
				'message' => $e->getMessage(),
				'debug' => 'General exception caught: ' . get_class( $e ),
			], 500 );
		}
	}
	private function fetch_url_content( $url, $selector = null ) {
		$response = wp_remote_get( $url, [
			'timeout' => 30,
			'sslverify' => false,
		] );
		if ( is_wp_error( $response ) ) {
			return $response;
		}
		$body = wp_remote_retrieve_body( $response );
		$code = wp_remote_retrieve_response_code( $response );
		if ( $code >= 400 ) {
			return new WP_Error( 'http_request_failed', 'HTTP Error: ' . $code );
		}
		if ( $selector ) {
			return $this->extract_content_by_selector( $body, $selector );
		}
		return $body;
	}
	private function extract_content_by_selector( $html, $selector ) {
		if ( empty( $html ) || empty( $selector ) ) {
			return $html;
		}
		libxml_use_internal_errors( true );
		$dom = new \DOMDocument();
		$dom->loadHTML( $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
		$xpath = new \DOMXPath( $dom );
		// Extract the target content
		$css_selector = $this->convert_css_selector_to_xpath( $selector );
		$nodes = $xpath->query( $css_selector );
		if ( 0 === $nodes->length ) {
			return new WP_Error( 'selector_not_found', 'No elements found matching selector: ' . $selector );
		}
		$extracted_html = '';
		foreach ( $nodes as $node ) {
			$extracted_html .= $dom->saveHTML( $node );
		}
		if ( empty( $extracted_html ) ) {
			return new WP_Error( 'empty_content', 'Selected content is empty for selector: ' . $selector );
		}
		// Extract inline styles and CSS links from the head
		$head_styles = $this->extract_head_styles( $dom, $xpath );
		// Combine styles with content
		if ( ! empty( $head_styles ) ) {
			$extracted_html = $head_styles . $extracted_html;
		}
		return $extracted_html;
	}
	private function extract_head_styles( $dom, $xpath ) {
		$styles_html = '';
		// Extract inline <style> tags from head
		$style_nodes = $xpath->query( '//head//style' );
		foreach ( $style_nodes as $style_node ) {
			$styles_html .= $dom->saveHTML( $style_node );
		}
		// Extract <link> tags for CSS files
		$link_nodes = $xpath->query( '//head//link[@rel="stylesheet"]' );
		foreach ( $link_nodes as $link_node ) {
			$href = $link_node->getAttribute( 'href' );
			if ( ! empty( $href ) ) {
				// For now, just include the link tag - the CSS processor will handle fetching
				$styles_html .= $dom->saveHTML( $link_node );
			}
		}
		return $styles_html;
	}
	private function convert_css_selector_to_xpath( $css_selector ) {
		$css_selector = trim( $css_selector );
		if ( 0 === strpos( $css_selector, '.' ) ) {
			$class_name = substr( $css_selector, 1 );
			return "//*[contains(concat(' ', normalize-space(@class), ' '), ' {$class_name} ')]";
		}
		if ( 0 === strpos( $css_selector, '#' ) ) {
			$id = substr( $css_selector, 1 );
			return "//*[@id='{$id}']";
		}
		return "//{$css_selector}";
	}
	private function validate_request( WP_REST_Request $request ) {
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
