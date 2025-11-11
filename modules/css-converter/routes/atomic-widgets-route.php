<?php
namespace Elementor\Modules\CssConverter\Routes;

use Elementor\Modules\CssConverter\Services\AtomicWidgets\Atomic_Widgets_Orchestrator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Widgets_Route {

	private const ROUTE_NAMESPACE = 'elementor/v2';
	private const ROUTE_BASE = 'atomic-widgets';

	private $conversion_service;

	public function __construct() {
		$this->conversion_service = null; // Initialize lazily
		add_action( 'rest_api_init', [ $this, 'register_routes' ] );
	}

	public function register_routes(): void {
		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/widget-converter',
			[
				'methods' => \WP_REST_Server::CREATABLE,
				'callback' => [ $this, 'convert_html_to_widgets' ],
				'permission_callback' => [ $this, 'check_permissions' ],
				'args' => $this->get_convert_args(),
			]
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/' . self::ROUTE_BASE . '/global-classes',
			[
				'methods' => \WP_REST_Server::CREATABLE,
				'callback' => [ $this, 'convert_html_to_global_classes' ],
				'permission_callback' => [ $this, 'check_permissions' ],
				'args' => $this->get_convert_args(),
			]
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/' . self::ROUTE_BASE . '/capabilities',
			[
				'methods' => \WP_REST_Server::READABLE,
				'callback' => [ $this, 'get_capabilities' ],
				'permission_callback' => [ $this, 'check_permissions' ],
			]
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/' . self::ROUTE_BASE . '/validate',
			[
				'methods' => \WP_REST_Server::CREATABLE,
				'callback' => [ $this, 'validate_html' ],
				'permission_callback' => [ $this, 'check_permissions' ],
				'args' => $this->get_validate_args(),
			]
		);
	}

	private function get_conversion_service() {
		if ( null === $this->conversion_service ) {
			$this->conversion_service = $this->create_unified_conversion_service();
		}
		return $this->conversion_service;
	}

	private function create_unified_conversion_service() {
		$html_parser = $this->create_html_parser();
		$widget_mapper = $this->create_widget_mapper();
		$custom_css_collector = new \Elementor\Modules\CssConverter\Services\Css\Custom_Css_Collector();
		$unified_css_processor = $this->create_unified_css_processor( $custom_css_collector );
		$widget_creator = $this->create_widget_creation_orchestrator( $custom_css_collector );

		return new \Elementor\Modules\CssConverter\Services\Widgets\Unified_Widget_Conversion_Service(
			$html_parser,
			$widget_mapper,
			$unified_css_processor,
			$widget_creator,
			false
		);
	}

	private function create_html_parser() {
		return new \Elementor\Modules\CssConverter\Services\Css\Parsing\Html_Parser();
	}

	private function create_widget_mapper() {
		return new \Elementor\Modules\CssConverter\Services\Widgets\Widget_Mapper();
	}

	private function create_unified_css_processor( $custom_css_collector ) {
		$css_parser = new \Elementor\Modules\CssConverter\Parsers\CssParser();
		$property_conversion_service = new \Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service( $custom_css_collector );
		$specificity_calculator = new \Elementor\Modules\CssConverter\Services\Css\Processing\Css_Specificity_Calculator();

		return new \Elementor\Modules\CssConverter\Services\Css\Processing\Unified_Css_Processor(
			$css_parser,
			$property_conversion_service,
			$specificity_calculator
		);
	}

	private function create_widget_creation_orchestrator( $custom_css_collector ) {
		return new \Elementor\Modules\CssConverter\Services\Widgets\Widget_Creation_Orchestrator( false, $custom_css_collector );
	}

	public function convert_html_to_widgets( \WP_REST_Request $request ): \WP_REST_Response {

		$conversion_params = $this->extract_conversion_parameters( $request );

		if ( empty( $conversion_params['html'] ) ) {
			return $this->create_missing_html_error_response();
		}

		try {
			$service = $this->get_conversion_service();

			$processed_html = $this->embed_css_if_provided( $conversion_params['html'], $conversion_params['css'] );
			$result = $service->convert_from_html(
				$processed_html,
				$conversion_params['css_urls'],
				$conversion_params['follow_imports'],
				$conversion_params['options']
			);

			$kit_css_urls = array_filter( $conversion_params['css_urls'], function( $url ) {
				return strpos( $url, '/elementor/css/' ) !== false;
			} );
			$result['debug_kit_css_urls'] = array_values( $kit_css_urls );
			$result['debug_total_css_urls'] = count( $conversion_params['css_urls'] );

			return new \WP_REST_Response( $result, 200 );

		} catch ( \Exception $e ) {
			return $this->create_conversion_error_response( $e );
		}
	}

	private function extract_conversion_parameters( \WP_REST_Request $request ): array {
		$type = $request->get_param( 'type' ) ? $request->get_param( 'type' ) : 'html';
		$content = $request->get_param( 'content' );
		$html_param = $request->get_param( 'html' );
		$selector = $request->get_param( 'selector' );
		$auto_extracted_css_urls = [];

		$html_result = $this->resolve_html_content( $type, $content, $html_param, $selector, $auto_extracted_css_urls );

		$manual_css_urls = $request->get_param( 'cssUrls' ) ? $request->get_param( 'cssUrls' ) : [];
		$all_css_urls = array_merge( $auto_extracted_css_urls, $manual_css_urls );

		$kit_css_in_urls = array_filter( $all_css_urls, function( $url ) {
			return strpos( $url, '/elementor/css/' ) !== false;
		} );

		$options = $request->get_param( 'options' ) ? $request->get_param( 'options' ) : [];
		if ( ! empty( $selector ) ) {
			$options['selector'] = $selector;
		}

		if ( is_array( $html_result ) ) {
			if ( isset( $html_result['full_html'] ) && isset( $html_result['selector'] ) ) {
				// New approach: full HTML + selector for selective conversion
				$html = $html_result['full_html'];
				$options['conversion_selector'] = $html_result['selector'];
			} else {
				// Legacy approach: context classes (fallback)
				$options['context_classes'] = $html_result['context_classes'] ?? [];
				$html = $html_result['selected_html'];
			}
		} else {
			$html = $html_result;
		}
		
		return [
			'html' => $html,
			'css' => $request->get_param( 'css' ) ? $request->get_param( 'css' ) : '',
			'type' => $type,
			'css_urls' => $all_css_urls,
			'follow_imports' => $request->get_param( 'followImports' ) ? $request->get_param( 'followImports' ) : false,
			'options' => $options,
		];
	}

	private function resolve_html_content( string $type, $content, $html_param, $selector = null, array &$auto_extracted_css_urls = [] ) {
		if ( 'url' === $type && ! empty( $content ) ) {
			$html = $this->fetch_html_from_url( $content );

			if ( ! empty( $selector ) ) {
				$auto_extracted_css_urls = $this->extract_stylesheet_urls_from_html( $html, $content );
			} else {
				$auto_extracted_css_urls = [];
			}

			if ( $this->is_elementor_website( $html ) ) {
				$elementor_kit_css_url = $this->extract_elementor_kit_css_url_from_post_id( $html, $content );
				if ( $elementor_kit_css_url && ! in_array( $elementor_kit_css_url, $auto_extracted_css_urls, true ) ) {
					$auto_extracted_css_urls[] = $elementor_kit_css_url;
				}
			}

			// SIMPLIFIED APPROACH: Always return full HTML for CSS context
			// If selector provided, mark it for selective widget conversion
			if ( ! empty( $selector ) ) {
				$inline_styles = $this->extract_inline_style_tags( $html );
				return [
					'full_html' => $inline_styles . $html,
					'selector' => $selector,
				];
			}

			return $html;
		}

		if ( $html_param ) {
			return $html_param;
		}

		return $content ? $content : '';
	}

	private function fetch_html_from_url( string $url ): string {
		$response = wp_remote_get( $url, [
			'timeout' => 15,
			'sslverify' => false,
		] );

		if ( is_wp_error( $response ) ) {
			throw new \Exception( 'Failed to fetch URL: ' . esc_html( $response->get_error_message() ) );
		}

		$status_code = wp_remote_retrieve_response_code( $response );
		if ( 200 !== $status_code ) {
			throw new \Exception( 'URL returned HTTP status ' . esc_html( (string) $status_code ) );
		}

		$html = wp_remote_retrieve_body( $response );

		if ( empty( $html ) ) {
			throw new \Exception( 'URL returned empty response' );
		}

		return $html;
	}

	private function extract_html_by_selector( string $html, string $selector ): array {
		if ( empty( $selector ) ) {
			return [
				'selected_html' => $html,
				'full_html' => $html,
				'context_classes' => [],
			];
		}

		// Use DOMDocument to parse HTML and extract element by selector
		$dom = new \DOMDocument();

		// Suppress warnings for malformed HTML
		$previous_use_errors = libxml_use_internal_errors( true );

		// Load HTML with UTF-8 encoding
		$dom->loadHTML( '<?xml encoding="UTF-8">' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );

		// Restore error handling
		libxml_use_internal_errors( $previous_use_errors );

		$xpath = new \DOMXPath( $dom );

		// Convert CSS selector to XPath
		$xpath_query = $this->css_selector_to_xpath( $selector );

		$nodes = $xpath->query( $xpath_query );

		if ( 0 === $nodes->length ) {
			throw new \Exception( 'Selector "' . esc_html( $selector ) . '" not found in HTML' );
		}

		// Get the first matching element
		$element = $nodes->item( 0 );

		// Extract ancestor classes for CSS context
		$context_classes = $this->extract_ancestor_classes( $element );

		return [
			'selected_html' => $dom->saveHTML( $element ),
			'full_html' => $html,
			'context_classes' => $context_classes,
		];
	}

	private function extract_ancestor_classes( \DOMElement $element ): array {
		$ancestor_classes = [];
		$current = $element->parentNode;

		while ( $current && $current instanceof \DOMElement ) {
			$class_attr = $current->getAttribute( 'class' );
			if ( ! empty( $class_attr ) ) {
				$classes = array_filter( explode( ' ', trim( $class_attr ) ) );
				$ancestor_classes = array_merge( $ancestor_classes, $classes );
			}
			$current = $current->parentNode;
		}

		return array_unique( $ancestor_classes );
	}

	private function css_selector_to_xpath( string $selector ): string {
		$selector = trim( $selector );

		if ( 0 === strpos( $selector, '.' ) ) {
			$class_name = substr( $selector, 1 );
			return "//*[contains(concat(' ', normalize-space(@class), ' '), ' {$class_name} ')]";
		}

		if ( 0 === strpos( $selector, '#' ) ) {
			$id = substr( $selector, 1 );
			return "//*[@id='{$id}']";
		}

		if ( preg_match( '/^[a-zA-Z][a-zA-Z0-9]*$/', $selector ) ) {
			return "//{$selector}";
		}

		throw new \Exception( 'Complex selector "' . esc_html( $selector ) . '" not supported' );
	}

	private function extract_inline_style_tags( string $html ): string {
		$inline_styles = '';
		preg_match_all( '/<style[^>]*>(.*?)<\/style>/is', $html, $matches );
		if ( ! empty( $matches[0] ) ) {
			foreach ( $matches[0] as $style_tag ) {
				$inline_styles .= $style_tag . "\n";
			}
		}
		return $inline_styles;
	}

	private function extract_stylesheet_urls_from_html( string $html, string $base_url ): array {
		$stylesheet_urls = [];

		preg_match_all( '/<link[^>]+rel=["\']stylesheet["\'][^>]*href=["\']([^"\']+)["\'][^>]*>/i', $html, $link_matches );
		if ( ! empty( $link_matches[1] ) ) {
			foreach ( $link_matches[1] as $href ) {
				$absolute_url = $this->resolve_relative_url( $href, $base_url );
				$stylesheet_urls[] = $absolute_url;
			}
		}

		preg_match_all( '/<link[^>]+href=["\']([^"\']+)["\'][^>]*rel=["\']stylesheet["\'][^>]*>/i', $html, $reversed_link_matches );
		if ( ! empty( $reversed_link_matches[1] ) ) {
			foreach ( $reversed_link_matches[1] as $href ) {
				$absolute_url = $this->resolve_relative_url( $href, $base_url );
				if ( ! in_array( $absolute_url, $stylesheet_urls, true ) ) {
					$stylesheet_urls[] = $absolute_url;
				}
			}
		}

		$elementor_kit_css = $this->extract_elementor_kit_css_urls( $html, $base_url );
		foreach ( $elementor_kit_css as $kit_css_url ) {
			if ( ! in_array( $kit_css_url, $stylesheet_urls, true ) ) {
				$stylesheet_urls[] = $kit_css_url;
			}
		}

		return $stylesheet_urls;
	}

	private function extract_elementor_kit_css_urls( string $html, string $base_url ): array {
		$kit_css_urls = [];

		preg_match_all( '/href=["\']([^"\']*\/wp-content\/uploads\/elementor\/css\/[^"\']+)["\']/i', $html, $matches );
		if ( ! empty( $matches[1] ) ) {
			foreach ( $matches[1] as $href ) {
				$absolute_url = $this->resolve_relative_url( $href, $base_url );
				if ( ! in_array( $absolute_url, $kit_css_urls, true ) ) {
					$kit_css_urls[] = $absolute_url;
				}
			}
		}

		$parsed_base = wp_parse_url( $base_url );
		$host = $parsed_base['host'] ?? '';
		$scheme = $parsed_base['scheme'] ?? 'https';
		
		preg_match_all( '/href=["\']([^"\']*\/elementor\/css\/[^"\']+)["\']/i', $html, $relative_matches );
		if ( ! empty( $relative_matches[1] ) ) {
			foreach ( $relative_matches[1] as $href ) {
				$absolute_url = $this->resolve_relative_url( $href, $base_url );
				if ( strpos( $absolute_url, '/elementor/css/' ) !== false && ! in_array( $absolute_url, $kit_css_urls, true ) ) {
					$kit_css_urls[] = $absolute_url;
				}
			}
		}

		return $kit_css_urls;
	}

	private function is_elementor_website( string $html ): bool {
		$elementor_markers = [
			'/wp-content/uploads/elementor/css/',
			'/wp-content/plugins/elementor/',
			'elementor-post-',
			'elementor-kit-',
			'class="elementor',
			'data-elementor',
		];

		foreach ( $elementor_markers as $marker ) {
			if ( false !== strpos( $html, $marker ) ) {
				return true;
			}
		}

		return false;
	}

	private function extract_elementor_kit_css_url_from_post_id( string $html, string $base_url ): ?string {
		$post_id = null;

		preg_match( '/id=["\']elementor-post-(\d+)-css["\']/i', $html, $id_matches );
		if ( ! empty( $id_matches[1] ) ) {
			$post_id = (int) $id_matches[1];
		}

		if ( ! $post_id ) {
			preg_match( '/\/wp-content\/uploads\/elementor\/css\/post-(\d+)\.css/i', $html, $url_matches );
			if ( ! empty( $url_matches[1] ) ) {
				$post_id = (int) $url_matches[1];
			}
		}

		if ( ! $post_id ) {
			return null;
		}

		$parsed_base = wp_parse_url( $base_url );
		$scheme = $parsed_base['scheme'] ?? 'https';
		$host = $parsed_base['host'] ?? '';

		$kit_css_url = $scheme . '://' . $host . '/wp-content/uploads/elementor/css/post-' . $post_id . '.css';

		return $kit_css_url;
	}

	private function resolve_relative_url( string $url, string $base_url ): string {
		if ( preg_match( '/^https?:\/\//', $url ) ) {
			return $url;
		}

		$parsed_base = wp_parse_url( $base_url );
		$scheme = $parsed_base['scheme'] ?? 'https';
		$host = $parsed_base['host'] ?? '';

		if ( 0 === strpos( $url, '//' ) ) {
			return $scheme . ':' . $url;
		}

		if ( 0 === strpos( $url, '/' ) ) {
			return $scheme . '://' . $host . $url;
		}

		$base_path = $parsed_base['path'] ?? '/';
		if ( '/' !== substr( $base_path, -1 ) ) {
			$base_path .= '/';
		}

		return $scheme . '://' . $host . $base_path . $url;
	}

	private function create_missing_html_error_response(): \WP_REST_Response {
		return new \WP_REST_Response(
			[
				'success' => false,
				'error' => 'HTML content is required',
				'code' => 'missing_html',
			],
			400
		);
	}

	private function embed_css_if_provided( string $html, string $css ): string {
		if ( empty( $css ) ) {
			return $html;
		}

		return '<html><head><style>' . $css . '</style></head><body>' . $html . '</body></html>';
	}

	private function create_conversion_error_response( \Exception $e ): \WP_REST_Response {
		return new \WP_REST_Response(
			[
				'success' => false,
				'error' => 'Internal conversion error',
				'message' => $e->getMessage(),
				'code' => 'conversion_error',
			],
			500
		);
	}

	public function convert_html_to_global_classes( \WP_REST_Request $request ): \WP_REST_Response {
		$html = $request->get_param( 'html' );
		$options = $request->get_param( 'options' ) ? $request->get_param( 'options' ) : [];
		$debug_mode = $request->get_param( 'debug' ) ? $request->get_param( 'debug' ) : false;
		$performance_monitoring = $request->get_param( 'performance' ) ? $request->get_param( 'performance' ) : false;

		if ( empty( $html ) ) {
			return new \WP_REST_Response(
				[
					'success' => false,
					'error' => 'HTML content is required',
					'code' => 'missing_html',
				],
				400
			);
		}

		try {
			$orchestrator = new Atomic_Widgets_Orchestrator( $debug_mode, $performance_monitoring );
			$result = $orchestrator->convert_html_to_global_classes( $html, $options );

			$status_code = $result['success'] ? 200 : 422;

			return new \WP_REST_Response( $result, $status_code );

		} catch ( \Exception $e ) {
			return new \WP_REST_Response(
				[
					'success' => false,
					'error' => 'Internal conversion error',
					'message' => $debug_mode ? $e->getMessage() : 'An error occurred during conversion',
					'code' => 'conversion_error',
				],
				500
			);
		}
	}

	public function get_capabilities(): \WP_REST_Response {
		try {
			$orchestrator = new Atomic_Widgets_Orchestrator();
			$capabilities = $orchestrator->get_conversion_capabilities();

			return new \WP_REST_Response(
				[
					'success' => true,
					'capabilities' => $capabilities,
				],
				200
			);

		} catch ( \Exception $e ) {
			return new \WP_REST_Response(
				[
					'success' => false,
					'error' => 'Failed to get capabilities',
					'message' => $e->getMessage(),
					'code' => 'capabilities_error',
				],
				500
			);
		}
	}

	public function validate_html( \WP_REST_Request $request ): \WP_REST_Response {
		$html = $request->get_param( 'html' );

		if ( empty( $html ) ) {
			return new \WP_REST_Response(
				[
					'success' => false,
					'error' => 'HTML content is required',
					'code' => 'missing_html',
				],
				400
			);
		}

		try {
			$orchestrator = new Atomic_Widgets_Orchestrator( true, false );
			$result = $orchestrator->convert_with_validation( $html );

			// Return validation-specific response
			$validation_response = [
				'success' => $result['success'],
				'valid' => $result['success'] && empty( $result['validation_errors'] ?? [] ),
				'supported_elements' => $result['stats']['supported_elements'] ?? 0,
				'unsupported_elements' => $result['stats']['unsupported_elements'] ?? 0,
				'total_elements' => $result['stats']['total_elements_parsed'] ?? 0,
			];

			if ( ! empty( $result['validation_errors'] ) ) {
				$validation_response['validation_errors'] = $result['validation_errors'];
			}

			if ( ! empty( $result['warnings'] ) ) {
				$validation_response['warnings'] = $result['warnings'];
			}

			return new \WP_REST_Response( $validation_response, 200 );

		} catch ( \Exception $e ) {
			return new \WP_REST_Response(
				[
					'success' => false,
					'error' => 'Validation error',
					'message' => $e->getMessage(),
					'code' => 'validation_error',
				],
				500
			);
		}
	}

	public function check_permissions(): bool {
		// For development and testing, allow all requests
		// In production, this should check proper capabilities
		return true;
	}

	private function get_convert_args(): array {
		return [
			'type' => [
				'required' => false,
				'type' => 'string',
				'enum' => [ 'url', 'html', 'css' ],
				'description' => 'Input type: url, html, or css',
				'default' => 'html',
			],
			'content' => [
				'required' => false,
				'type' => 'string',
				'description' => 'HTML content or URL to convert',
			],
			'html' => [
				'required' => false,
				'type' => 'string',
				'description' => 'HTML content to convert (alternative to content)',
			],
			'css' => [
				'required' => false,
				'type' => 'string',
				'description' => 'CSS content to apply to HTML',
				'default' => '',
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
				'description' => 'Conversion options',
				'default' => [],
				'properties' => [
					'create_global_classes' => [
						'type' => 'boolean',
						'description' => 'Whether to create global classes',
						'default' => false,
					],
					'optimize_performance' => [
						'type' => 'boolean',
						'description' => 'Whether to optimize for performance',
						'default' => true,
					],
					'strict_validation' => [
						'type' => 'boolean',
						'description' => 'Whether to use strict validation',
						'default' => false,
					],
				],
			],
			'debug' => [
				'required' => false,
				'type' => 'boolean',
				'description' => 'Enable debug mode',
				'default' => false,
			],
			'performance' => [
				'required' => false,
				'type' => 'boolean',
				'description' => 'Enable performance monitoring',
				'default' => false,
			],
			'validation' => [
				'required' => false,
				'type' => 'boolean',
				'description' => 'Enable additional validation',
				'default' => false,
			],
		];
	}

	private function get_validate_args(): array {
		return [
			'html' => [
				'required' => true,
				'type' => 'string',
				'description' => 'HTML content to validate',
				'sanitize_callback' => [ $this, 'sanitize_html' ],
				'validate_callback' => [ $this, 'validate_html_param' ],
			],
		];
	}

	public function sanitize_html( string $html ): string {
		// Basic HTML sanitization - remove dangerous elements but preserve structure
		$allowed_tags = [
			'div',
			'span',
			'p',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'a',
			'button',
			'img',
			'section',
			'article',
			'header',
			'footer',
			'main',
			'aside',
			'nav',
			'ul',
			'ol',
			'li',
			'blockquote',
			'strong',
			'em',
			'b',
			'i',
			'u',
			'small',
			'mark',
			'del',
			'ins',
			'sub',
			'sup',
			'code',
			'pre',
		];

		$allowed_attributes = [
			'style',
			'class',
			'id',
			'href',
			'target',
			'src',
			'alt',
			'width',
			'height',
			'title',
			'data-*',
		];

		// Use wp_kses for sanitization
		$allowed_html = [];
		foreach ( $allowed_tags as $tag ) {
			$allowed_html[ $tag ] = [];
			foreach ( $allowed_attributes as $attr ) {
				$allowed_html[ $tag ][ $attr ] = true;
			}
		}

		return wp_kses( $html, $allowed_html );
	}

	public function validate_html_param( string $html ): bool {
		// Basic validation
		if ( empty( trim( $html ) ) ) {
			return false;
		}

		// Check for maximum length (prevent abuse)
		if ( strlen( $html ) > 1024 * 1024 ) { // 1MB limit
			return false;
		}

		// Check for basic HTML structure
		if ( ! preg_match( '/<[^>]+>/', $html ) ) {
			return false;
		}

		return true;
	}

	public function get_route_namespace(): string {
		return self::ROUTE_NAMESPACE;
	}

	public function get_route_base(): string {
		return self::ROUTE_BASE;
	}

	public function get_full_route_url( string $endpoint = '' ): string {
		$base_url = rest_url( self::ROUTE_NAMESPACE . '/' . self::ROUTE_BASE );

		if ( ! empty( $endpoint ) ) {
			$base_url .= '/' . ltrim( $endpoint, '/' );
		}

		return $base_url;
	}
}
