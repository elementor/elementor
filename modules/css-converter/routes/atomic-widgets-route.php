<?php
namespace Elementor\Modules\CssConverter\Routes;

use Elementor\Modules\CssConverter\Services\AtomicWidgets\Atomic_Widgets_Orchestrator;
use Elementor\Modules\CssConverter\Services\Content\Intelligent_Content_Extractor;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Widgets_Route {

	private const ROUTE_NAMESPACE = 'elementor/v2';
	private const ROUTE_BASE = 'atomic-widgets';

	private $conversion_service;
	private $content_extractor;

	public function __construct() {
		$this->conversion_service = null; // Initialize lazily
		$this->content_extractor = new Intelligent_Content_Extractor();
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

		// Get extraction options early for passing to resolve_html_content
		$extraction_strategy = $request->get_param( 'extraction_strategy' ) ?? 'semantic';
		$content_options = $request->get_param( 'content_options' ) ?? [];
		
		$extraction_options = [
			'extraction_strategy' => $extraction_strategy,
			'content_options' => $content_options
		];

		error_log( "CSS Variables DEBUG: extract_conversion_parameters called with type=$type, selector=" . ( $selector ?? 'null' ) );
		$html_result = $this->resolve_html_content( $type, $content, $html_param, $selector, $auto_extracted_css_urls, $extraction_options );

		$manual_css_urls = $request->get_param( 'cssUrls' ) ? $request->get_param( 'cssUrls' ) : [];
		$all_css_urls = array_merge( $auto_extracted_css_urls, $manual_css_urls );

		$kit_css_in_urls = array_filter( $all_css_urls, function( $url ) {
			return strpos( $url, '/elementor/css/' ) !== false;
		} );
		if ( ! empty( $kit_css_in_urls ) ) {
			error_log( "CSS Variables DEBUG: Found " . count( $kit_css_in_urls ) . " Kit CSS URLs in final css_urls array: " . implode( ', ', $kit_css_in_urls ) );
		} else {
			error_log( "CSS Variables DEBUG: NO Kit CSS URLs found in final css_urls array (total URLs: " . count( $all_css_urls ) . ")" );
		}

		$options = $request->get_param( 'options' ) ? $request->get_param( 'options' ) : [];
		
		// Add intelligent extraction options
		$extraction_strategy = $request->get_param( 'extraction_strategy' ) ?? 'semantic';
		$content_options = $request->get_param( 'content_options' ) ?? [];
		
		$options['extraction_strategy'] = $extraction_strategy;
		$options['content_options'] = $content_options;
		
		if ( ! empty( $selector ) ) {
			$options['selector'] = $selector;
		}

		if ( is_array( $html_result ) ) {
			if ( isset( $html_result['full_html'] ) && isset( $html_result['selector'] ) ) {
				// Selector-based approach: full HTML + selector for selective conversion
				$html = $html_result['full_html'];
				$options['conversion_selector'] = $html_result['selector'];
			} elseif ( isset( $html_result['selected_html'] ) ) {
				// Intelligent extraction approach: extracted content
				$html = $html_result['selected_html'];
				$options['extraction_stats'] = $html_result['extraction_stats'] ?? [];
				$options['content_quality_score'] = $html_result['content_quality_score'] ?? 0;
			} else {
				// Legacy approach: context classes (fallback)
				$options['context_classes'] = $html_result['context_classes'] ?? [];
				$html = $html_result['selected_html'] ?? $html_result;
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

	private function resolve_html_content( string $type, $content, $html_param, $selector = null, array &$auto_extracted_css_urls = [], array $extraction_options = [] ) {
		if ( 'url' === $type && ! empty( $content ) ) {
			$html = $this->fetch_html_from_url( $content );

			// FIXED: Always extract CSS URLs regardless of selector presence
			// CSS context is essential for proper widget styling and global class creation
			$auto_extracted_css_urls = $this->extract_stylesheet_urls_from_html( $html, $content );

			if ( $this->is_elementor_website( $html ) ) {
				error_log( "CSS Variables DEBUG: Elementor website detected, attempting to extract Kit CSS URL" );
				$elementor_kit_css_url = $this->extract_elementor_kit_css_url_from_post_id( $html, $content );
				if ( $elementor_kit_css_url && ! in_array( $elementor_kit_css_url, $auto_extracted_css_urls, true ) ) {
					$auto_extracted_css_urls[] = $elementor_kit_css_url;
					error_log( "CSS Variables DEBUG: Manually added Elementor Kit CSS URL: $elementor_kit_css_url" );
				} else {
					error_log( "CSS Variables DEBUG: Kit CSS URL extraction returned: " . ( $elementor_kit_css_url ?? 'null' ) . ", already in array: " . ( in_array( $elementor_kit_css_url, $auto_extracted_css_urls, true ) ? 'yes' : 'no' ) );
				}
			} else {
				error_log( "CSS Variables DEBUG: Not an Elementor website, skipping Kit CSS extraction" );
			}

			// INTELLIGENT CONTENT EXTRACTION: Use semantic extraction when no selector provided
			if ( ! empty( $selector ) ) {
				// Specific selector provided - use targeted extraction
				$inline_styles = $this->extract_inline_style_tags( $html );
				return [
					'full_html' => $inline_styles . $html,
					'selector' => $selector,
				];
			} else {
				// No selector - use robust fallback chain to find content
				$best_selector = $this->find_best_available_selector( $html );
				$inline_styles = $this->extract_inline_style_tags( $html );
				return [
					'full_html' => $inline_styles . $html,
					'selector' => $best_selector,
				];
			}
		}

		if ( $html_param ) {
			return $html_param;
		}

		return $content ? $content : '';
	}

	private function find_best_available_selector( string $html ): string {
		// FIXED: Prioritize content elements over container elements
		// This ensures we get actual text content (h1, p) instead of empty containers (div, section)
		$selector_chain = [
			// Content elements first (these create proper widgets)
			'h1, h2, h3, h4, h5, h6, p',  // Headings and paragraphs
			'article h1, article h2, article h3, article p',  // Content within articles
			'main h1, main h2, main h3, main p',  // Content within main
			'.content h1, .content h2, .content h3, .content p',  // Content within content areas
			
			// Semantic containers (only if no content elements found)
			'article',
			'main', 
			'[role="main"]',
			
			// Common content classes
			'.main-content',
			'.content',
			'.post-content',
			'.entry-content',
			'.page-content',
			'.site-content',
			'.primary',
			
			// Generic content containers
			'#content',
			'#main',
			'.main',
			'.container',
			
			// Last resort - body content (will get everything)
			'body'
		];

		$dom = $this->create_simple_dom( $html );
		if ( ! $dom ) {
			error_log( "FALLBACK_SELECTOR: Failed to create DOM, using body as fallback" );
			return 'body';
		}

		$xpath = new \DOMXPath( $dom );

		foreach ( $selector_chain as $selector ) {
			try {
				// Handle multiple selectors (comma-separated)
				if ( strpos( $selector, ',' ) !== false ) {
					$individual_selectors = array_map( 'trim', explode( ',', $selector ) );
					foreach ( $individual_selectors as $individual_selector ) {
						$xpath_query = $this->css_selector_to_xpath( $individual_selector );
						$nodes = $xpath->query( $xpath_query );

						if ( $nodes && $nodes->length > 0 ) {
							$element = $nodes->item( 0 );
							$text_length = strlen( trim( $element->textContent ) );
							
							// For content elements, require less text (25 chars minimum)
							$min_length = $this->is_content_element( $individual_selector ) ? 25 : 50;
							
							if ( $text_length >= $min_length ) {
								error_log( "FALLBACK_SELECTOR: Found suitable content selector '{$individual_selector}' with {$text_length} characters" );
								return $individual_selector;
							}
						}
					}
				} else {
					// Single selector
					$xpath_query = $this->css_selector_to_xpath( $selector );
					$nodes = $xpath->query( $xpath_query );

					if ( $nodes && $nodes->length > 0 ) {
						$element = $nodes->item( 0 );
						$text_length = strlen( trim( $element->textContent ) );
						
						// Require at least some content (50 characters minimum)
						if ( $text_length >= 50 ) {
							error_log( "FALLBACK_SELECTOR: Found suitable selector '{$selector}' with {$text_length} characters of content" );
							return $selector;
						} else {
							error_log( "FALLBACK_SELECTOR: Selector '{$selector}' found but insufficient content ({$text_length} chars)" );
						}
					} else {
						error_log( "FALLBACK_SELECTOR: Selector '{$selector}' not found in HTML" );
					}
				}
			} catch ( \Exception $e ) {
				error_log( "FALLBACK_SELECTOR: Error testing selector '{$selector}': " . $e->getMessage() );
				continue;
			}
		}

		// Ultimate fallback - use body (will capture everything)
		error_log( "FALLBACK_SELECTOR: No suitable content selector found, using 'body' as last resort" );
		return 'body';
	}

	private function is_content_element( string $selector ): bool {
		// Check if selector targets content elements (headings, paragraphs)
		$content_elements = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p' ];
		foreach ( $content_elements as $element ) {
			if ( strpos( $selector, $element ) !== false ) {
				return true;
			}
		}
		return false;
	}

	private function create_simple_dom( string $html ): ?\DOMDocument {
		$dom = new \DOMDocument();
		$previous_use_errors = libxml_use_internal_errors( true );
		
		try {
			$success = $dom->loadHTML( '<?xml encoding="UTF-8">' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
			if ( ! $success ) {
				return null;
			}
			return $dom;
		} catch ( \Exception $e ) {
			error_log( "FALLBACK_SELECTOR: DOM creation failed: " . $e->getMessage() );
			return null;
		} finally {
			libxml_use_internal_errors( $previous_use_errors );
		}
	}

	private function apply_intelligent_content_extraction( string $html, array $options = [] ): array {
		// Get extraction options from request parameters
		$extraction_strategy = $options['extraction_strategy'] ?? 'semantic';
		$content_options = $options['content_options'] ?? [];
		
		$extraction_options = [
			'extraction_strategy' => $extraction_strategy,
			'max_sections' => $content_options['max_sections'] ?? 3,
			'min_content_length' => $content_options['min_content_length'] ?? 100,
			'exclude_navigation' => $content_options['exclude_navigation'] ?? true
		];

		error_log( "INTELLIGENT_EXTRACTION: Applying intelligent content extraction with strategy: {$extraction_strategy}" );
		
		$extraction_result = $this->content_extractor->extract_meaningful_sections( $html, $extraction_options );
		
		if ( empty( $extraction_result['selected_html'] ) || $extraction_result['extraction_method'] === 'fallback_full' ) {
			error_log( "INTELLIGENT_EXTRACTION: No meaningful content found or full page requested, returning full HTML" );
			return $html;
		}

		error_log( "INTELLIGENT_EXTRACTION: Successfully extracted content using method: " . $extraction_result['extraction_method'] );
		error_log( "INTELLIGENT_EXTRACTION: Content quality score: " . ( $extraction_result['content_quality_score'] ?? 'N/A' ) );
		error_log( "INTELLIGENT_EXTRACTION: Sections extracted: " . ( $extraction_result['sections_count'] ?? 'N/A' ) );
		
		// DEBUG: Log extracted HTML content to understand what's being processed
		$extracted_html = $extraction_result['selected_html'] ?? '';
		$html_length = strlen( $extracted_html );
		$html_preview = substr( strip_tags( $extracted_html ), 0, 200 );
		error_log( "INTELLIGENT_EXTRACTION: Extracted HTML length: {$html_length} characters" );
		error_log( "INTELLIGENT_EXTRACTION: HTML preview (text only): " . $html_preview );
		error_log( "INTELLIGENT_EXTRACTION: HTML structure sample: " . substr( $extracted_html, 0, 500 ) );

		// Add inline styles to extracted content for CSS context
		$inline_styles = $this->extract_inline_style_tags( $html );
		$extraction_result['selected_html'] = $inline_styles . $extraction_result['selected_html'];

		return $extraction_result;
	}

	private function apply_intelligent_content_extraction_with_full_html( string $html, array $options = [] ): array {
		// CRITICAL FIX: Use the same approach as selector-based extraction
		// This preserves the full HTML and uses a "virtual selector" for intelligent targeting
		
		$extraction_strategy = $options['extraction_strategy'] ?? 'semantic';
		$content_options = $options['content_options'] ?? [];
		
		$extraction_options = [
			'extraction_strategy' => $extraction_strategy,
			'max_sections' => $content_options['max_sections'] ?? 3,
			'min_content_length' => $content_options['min_content_length'] ?? 100,
			'exclude_navigation' => $content_options['exclude_navigation'] ?? true
		];

		error_log( "INTELLIGENT_EXTRACTION_FULL_HTML: Applying intelligent extraction with strategy: {$extraction_strategy}" );
		
		// Find the best content selector using intelligent extraction
		$best_selector = $this->find_best_content_selector( $html, $extraction_options );
		
		if ( empty( $best_selector ) ) {
			error_log( "INTELLIGENT_EXTRACTION_FULL_HTML: No suitable content selector found, falling back to 'main' selector" );
			// Fallback to a simple selector that's likely to exist
			$best_selector = 'main';
		}

		error_log( "INTELLIGENT_EXTRACTION_FULL_HTML: Found best content selector: {$best_selector}" );

		// Use the SAME approach as selector-based extraction:
		// 1. Keep full HTML for CSS context
		// 2. Mark the intelligent selector for targeted conversion
		$inline_styles = $this->extract_inline_style_tags( $html );
		return [
			'full_html' => $inline_styles . $html,
			'selector' => $best_selector, // This will be processed the same way as user-provided selectors
		];
	}

	private function find_best_content_selector( string $html, array $options ): string {
		// Use the intelligent content extractor to find the best selector, not extract HTML
		try {
			$dom = $this->create_dom_document_for_selector_finding( $html );
			if ( ! $dom ) {
				error_log( "INTELLIGENT_EXTRACTION_FULL_HTML: Failed to create DOM document" );
				return '';
			}

			$xpath = new \DOMXPath( $dom );
		} catch ( \Exception $e ) {
			error_log( "INTELLIGENT_EXTRACTION_FULL_HTML: Exception in DOM creation: " . $e->getMessage() );
			return '';
		}
		
		// Try semantic selectors in priority order
		$semantic_selectors = [
			'main',
			'article',
			'[role="main"]',
			'.main-content',
			'.content',
			'.post-content',
			'.entry-content',
			'.page-content'
		];

		foreach ( $semantic_selectors as $selector ) {
			try {
				$xpath_query = $this->css_selector_to_xpath( $selector );
				$nodes = $xpath->query( $xpath_query );

				if ( $nodes && $nodes->length > 0 ) {
					$element = $nodes->item( 0 );
					$text_length = strlen( trim( $element->textContent ) );
					$min_length = $options['min_content_length'] ?? 100;
					
					error_log( "INTELLIGENT_EXTRACTION_FULL_HTML: Testing selector '{$selector}', found {$nodes->length} nodes, text length: {$text_length}" );
					
					if ( $text_length >= $min_length ) {
						error_log( "INTELLIGENT_EXTRACTION_FULL_HTML: Found suitable content with selector '{$selector}', text length: {$text_length}" );
						return $selector;
					}
				} else {
					error_log( "INTELLIGENT_EXTRACTION_FULL_HTML: Selector '{$selector}' found no nodes" );
				}
			} catch ( \Exception $e ) {
				error_log( "INTELLIGENT_EXTRACTION_FULL_HTML: Exception testing selector '{$selector}': " . $e->getMessage() );
				continue;
			}
		}

		// If no semantic selector works, try to find a good content div by class
		$content_class_selectors = [
			'.content',
			'.main',
			'.article',
			'.post',
			'.entry'
		];

		foreach ( $content_class_selectors as $selector ) {
			$xpath_query = $this->css_selector_to_xpath( $selector );
			$nodes = $xpath->query( $xpath_query );

			if ( $nodes->length > 0 ) {
				$element = $nodes->item( 0 );
				$text_length = strlen( trim( $element->textContent ) );
				$min_length = $options['min_content_length'] ?? 100;
				
				if ( $text_length >= $min_length ) {
					error_log( "INTELLIGENT_EXTRACTION_FULL_HTML: Found suitable content with class selector '{$selector}', text length: {$text_length}" );
					return $selector;
				}
			}
		}

		return ''; // No suitable selector found
	}

	private function create_dom_document_for_selector_finding( string $html ): ?\DOMDocument {
		$dom = new \DOMDocument();
		
		// Suppress warnings for malformed HTML
		$previous_use_errors = libxml_use_internal_errors( true );
		
		try {
			// Load HTML with UTF-8 encoding
			$success = $dom->loadHTML( '<?xml encoding="UTF-8">' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
			
			if ( ! $success ) {
				error_log( "INTELLIGENT_EXTRACTION_FULL_HTML: Failed to load HTML into DOM" );
				return null;
			}
			
			return $dom;
		} catch ( \Exception $e ) {
			error_log( "INTELLIGENT_EXTRACTION_FULL_HTML: DOM creation failed: " . $e->getMessage() );
			return null;
		} finally {
			// Restore error handling
			libxml_use_internal_errors( $previous_use_errors );
		}
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

		error_log( "CONTEXT_DEBUG: Extracted " . count( $context_classes ) . " ancestor classes: " . implode( ', ', $context_classes ) );

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

		// Handle compound class selectors like .class1.class2
		if ( 0 === strpos( $selector, '.' ) ) {
			$class_part = substr( $selector, 1 ); // Remove first dot
			
			// Check if this is a compound class selector (contains more dots)
			if ( strpos( $class_part, '.' ) !== false ) {
				// Split into individual classes
				$classes = explode( '.', $class_part );
				$xpath_conditions = [];
				
				foreach ( $classes as $class ) {
					$class = trim( $class );
					if ( ! empty( $class ) ) {
						$xpath_conditions[] = "contains(concat(' ', normalize-space(@class), ' '), ' {$class} ')";
					}
				}
				
				if ( ! empty( $xpath_conditions ) ) {
					$combined_condition = implode( ' and ', $xpath_conditions );
					return "//*[{$combined_condition}]";
				}
			} else {
				// Single class selector
				return "//*[contains(concat(' ', normalize-space(@class), ' '), ' {$class_part} ')]";
			}
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
		error_log( "CSS Variables DEBUG: extract_stylesheet_urls_from_html called with base_url: $base_url" );
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

		$elementor_kit_urls = array_filter( $stylesheet_urls, function( $url ) {
			return strpos( $url, '/elementor/css/' ) !== false;
		} );
		$elementor_kit_count = count( $elementor_kit_urls );
		
		if ( $elementor_kit_count > 0 ) {
			error_log( "CSS Variables DEBUG: extract_stylesheet_urls_from_html found $elementor_kit_count Elementor Kit CSS URLs out of " . count( $stylesheet_urls ) . " total URLs" );
			foreach ( $elementor_kit_urls as $kit_url ) {
				error_log( "CSS Variables DEBUG: Kit CSS URL: $kit_url" );
			}
		} else {
			error_log( "CSS Variables DEBUG: extract_stylesheet_urls_from_html found " . count( $stylesheet_urls ) . " CSS URLs, but NO Elementor Kit CSS URLs" );
			error_log( "CSS Variables DEBUG: Sample URLs: " . implode( ', ', array_slice( $stylesheet_urls, 0, 5 ) ) );
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
					error_log( "CSS Variables DEBUG: Found Elementor Kit CSS URL: $absolute_url" );
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
					error_log( "CSS Variables DEBUG: Found Elementor Kit CSS URL (relative): $absolute_url" );
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
			error_log( "CSS Variables DEBUG: Found post ID from id attribute: $post_id" );
		}

		if ( ! $post_id ) {
			preg_match( '/\/wp-content\/uploads\/elementor\/css\/post-(\d+)\.css/i', $html, $url_matches );
			if ( ! empty( $url_matches[1] ) ) {
				$post_id = (int) $url_matches[1];
				error_log( "CSS Variables DEBUG: Found post ID from URL pattern: $post_id" );
			}
		}

		if ( ! $post_id ) {
			error_log( "CSS Variables DEBUG: Could not extract post ID from HTML. HTML snippet: " . substr( $html, 0, 1000 ) );
			return null;
		}

		$parsed_base = wp_parse_url( $base_url );
		$scheme = $parsed_base['scheme'] ?? 'https';
		$host = $parsed_base['host'] ?? '';

		$kit_css_url = $scheme . '://' . $host . '/wp-content/uploads/elementor/css/post-' . $post_id . '.css';

		error_log( "CSS Variables DEBUG: Extracted post ID $post_id from HTML, constructed Kit CSS URL: $kit_css_url" );

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
		$base_directory = dirname( $base_path );
		if ( '/' !== $base_directory ) {
			$base_directory .= '/';
		}

		return $scheme . '://' . $host . $base_directory . $url;
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
			'extraction_strategy' => [
				'required' => false,
				'type' => 'string',
				'enum' => [ 'semantic', 'heuristic', 'sections', 'full' ],
				'description' => 'Content extraction strategy when no selector is provided',
				'default' => 'semantic',
			],
			'content_options' => [
				'required' => false,
				'type' => 'object',
				'description' => 'Options for intelligent content extraction',
				'default' => [],
				'properties' => [
					'max_sections' => [
						'type' => 'integer',
						'description' => 'Maximum number of content sections to extract',
						'default' => 3,
					],
					'min_content_length' => [
						'type' => 'integer',
						'description' => 'Minimum text length for content sections',
						'default' => 100,
					],
					'exclude_navigation' => [
						'type' => 'boolean',
						'description' => 'Whether to exclude navigation elements',
						'default' => true,
					],
				],
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
