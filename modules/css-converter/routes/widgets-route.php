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
		$this->config = $config ? $config : Css_Property_Convertor_Config::get_instance();
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
		return true;
	}
	public function handle_widget_conversion( WP_REST_Request $request ) {
		
		$type = $request->get_param( 'type' );
		$content = $request->get_param( 'content' );
		$css_urls = $request->get_param( 'cssUrls' ) ?: [];
		$follow_imports = $request->get_param( 'followImports' ) ?: false;
		$options = $request->get_param( 'options' ) ?: [];

		$validation_error = $this->request_validator->validate_widget_conversion_request( $request );
		if ( $validation_error ) {
			return $validation_error;
		}
		try {
			$service = $this->get_conversion_service();

			switch ( $type ) {
				case 'url':
					$fetch_result = $this->fetch_url_content( $content, $selector );
					if ( is_wp_error( $fetch_result ) ) {
						return new WP_REST_Response(
							[
								'error' => 'Failed to fetch URL',
								'message' => $fetch_result->get_error_message(),
							],
							400
						);
					}

					$html_content = is_array( $fetch_result ) ? $fetch_result['html'] : $fetch_result;
					$extracted_css_urls = is_array( $fetch_result ) && isset( $fetch_result['css_urls'] ) ? $fetch_result['css_urls'] : [];

					$merged_css_urls = array_merge( $css_urls, $extracted_css_urls );

					$result = $service->convert_from_html( $html_content, $merged_css_urls, $follow_imports, $options );
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
			return $this->extract_content_by_selector( $body, $selector, $url );
		}
		return $body;
	}
	private function extract_content_by_selector( $html, $selector, $base_url = '' ) {
		if ( empty( $html ) || empty( $selector ) ) {
			return $html;
		}
		libxml_use_internal_errors( true );
		$dom = new \DOMDocument();
		$dom->loadHTML( $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
		$xpath = new \DOMXPath( $dom );
		$css_selector = $this->convert_css_selector_to_xpath( $selector );
		$nodes = $xpath->query( $css_selector );
		if ( 0 === $nodes->length ) {
			return new WP_Error( 'selector_not_found', 'No elements found matching selector: ' . $selector );
		}
		$extracted_html = '';
		foreach ( $nodes as $node ) {
			$node_html = $dom->saveHTML( $node );
			$extracted_html .= $node_html;
		}
		if ( empty( $extracted_html ) ) {
			return new WP_Error( 'empty_content', 'Selected content is empty for selector: ' . $selector );
		}
		$extraction_result = $this->extract_head_styles_and_urls( $dom, $xpath, $base_url );
		if ( ! empty( $extraction_result['inline_styles'] ) ) {
			$extracted_html = $extraction_result['inline_styles'] . $extracted_html;
		}
		return [
			'html' => $extracted_html,
			'css_urls' => $extraction_result['css_urls'],
		];
	}
	private function extract_head_styles_and_urls( $dom, $xpath, $base_url = '' ) {
		$styles_html = '';
		$css_urls = [];

		$style_nodes = $xpath->query( '//head//style' );
		foreach ( $style_nodes as $style_node ) {
			$styles_html .= $dom->saveHTML( $style_node );
		}

		$link_nodes = $xpath->query( '//head//link[@rel="stylesheet"]' );
		foreach ( $link_nodes as $link_node ) {
			$href = $link_node->getAttribute( 'href' );
			if ( ! empty( $href ) ) {
				$absolute_url = $this->resolve_url( $href, $base_url );
				$css_urls[] = $absolute_url;
			}
		}

		return [
			'inline_styles' => $styles_html,
			'css_urls' => $css_urls,
		];
	}

	private function resolve_url( $url, $base_url ) {
		if ( empty( $base_url ) || 0 === strpos( $url, 'http' ) ) {
			return $url;
		}

		$parsed_base = wp_parse_url( $base_url );
		$scheme = isset( $parsed_base['scheme'] ) ? $parsed_base['scheme'] : 'https';
		$host = isset( $parsed_base['host'] ) ? $parsed_base['host'] : '';

		if ( 0 === strpos( $url, '//' ) ) {
			return $scheme . ':' . $url;
		}

		if ( 0 === strpos( $url, '/' ) ) {
			return $scheme . '://' . $host . $url;
		}

		$base_path = isset( $parsed_base['path'] ) ? $parsed_base['path'] : '/';
		$base_dir = dirname( $base_path );

		return $scheme . '://' . $host . rtrim( $base_dir, '/' ) . '/' . ltrim( $url, '/' );
	}

	private function sanitize_css_content( $css_content ) {
		$css_content = preg_replace( '/calc\([^)]*\([^)]*\)[^)]*\)/', 'calc(100%)', $css_content );

		$css_content = preg_replace( '/--[^:]+:\s*[^;]*calc\([^)]*\([^)]*\)[^)]*\)[^;]*;/', '', $css_content );

		$lines = explode( "\n", $css_content );
		$clean_lines = [];
		foreach ( $lines as $line ) {
			$line = trim( $line );
			if ( preg_match( '/\([^)]*$/', $line ) || preg_match( '/^[^{]*\([^)]*[^}]*$/', $line ) ) {
				continue;
			}
			$clean_lines[] = $line;
		}

		return implode( "\n", $clean_lines );
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
