<?php
namespace Elementor\Modules\CssConverter\Services\Content;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Intelligent_Content_Extractor {

	private const SEMANTIC_SELECTORS = [
		'main',
		'article',
		'[role="main"]',
		'.main-content',
		'.content',
		'.post-content',
		'.entry-content',
		'.page-content',
		'section.content',
		'div.content-area'
	];

	private const EXCLUDE_SELECTORS = [
		'nav',
		'header',
		'footer',
		'aside',
		'.navigation',
		'.menu',
		'.sidebar',
		'.widget',
		'.comments',
		'.footer',
		'.header',
		'[role="navigation"]',
		'[role="banner"]',
		'[role="contentinfo"]'
	];

	private const CONTENT_CLASSES = [
		'content',
		'main',
		'article',
		'post',
		'entry',
		'body',
		'text',
		'description'
	];

	private const SEMANTIC_TAGS = [
		'article',
		'section',
		'main',
		'aside'
	];

	public function extract_meaningful_sections( string $html, array $options = [] ): array {
		$strategy = $options['extraction_strategy'] ?? 'semantic';
		$max_sections = $options['max_sections'] ?? 3;
		$min_content_length = $options['min_content_length'] ?? 100;
		$exclude_navigation = $options['exclude_navigation'] ?? true;

		error_log( "INTELLIGENT_EXTRACTION: Starting extraction with strategy: {$strategy}" );

		$dom = $this->create_dom_document( $html );
		if ( ! $dom ) {
			error_log( "INTELLIGENT_EXTRACTION: Failed to create DOM document" );
			return [ 'selected_html' => $html, 'extraction_method' => 'fallback_full' ];
		}

		switch ( $strategy ) {
			case 'semantic':
				return $this->extract_semantic_content( $dom, $max_sections, $min_content_length, $exclude_navigation );
			case 'heuristic':
				return $this->extract_heuristic_content( $dom, $max_sections, $min_content_length );
			case 'sections':
				return $this->extract_multiple_sections( $dom, $max_sections, $min_content_length );
			case 'full':
			default:
				return [ 'selected_html' => $html, 'extraction_method' => 'full_page' ];
		}
	}

	private function extract_semantic_content( \DOMDocument $dom, int $max_sections, int $min_content_length, bool $exclude_navigation ): array {
		$xpath = new \DOMXPath( $dom );

		// Try semantic selectors in priority order
		foreach ( self::SEMANTIC_SELECTORS as $selector ) {
			$xpath_query = $this->css_selector_to_xpath( $selector );
			$nodes = $xpath->query( $xpath_query );

			if ( $nodes->length > 0 ) {
				$sections = $this->process_semantic_nodes( $nodes, $min_content_length, $exclude_navigation );
				if ( ! empty( $sections ) ) {
					error_log( "INTELLIGENT_EXTRACTION: Found semantic content with selector: {$selector}" );
					return $this->format_extraction_result( $sections, 'semantic', $selector, $max_sections );
				}
			}
		}

		// Fallback to heuristic detection
		error_log( "INTELLIGENT_EXTRACTION: No semantic content found, falling back to heuristic" );
		return $this->extract_heuristic_content( $dom, $max_sections, $min_content_length );
	}

	private function extract_heuristic_content( \DOMDocument $dom, int $max_sections, int $min_content_length ): array {
		$xpath = new \DOMXPath( $dom );
		
		// Get all potential content elements
		$content_elements = $xpath->query( '//div | //section | //article | //main' );
		$scored_elements = [];

		foreach ( $content_elements as $element ) {
			if ( $this->should_exclude_element( $element ) ) {
				continue;
			}

			$score = $this->calculate_content_score( $element );
			$text_length = strlen( trim( $element->textContent ) );

			if ( $score > 0.3 && $text_length >= $min_content_length ) {
				$scored_elements[] = [
					'element' => $element,
					'score' => $score,
					'text_length' => $text_length
				];
			}
		}

		// Sort by score descending
		usort( $scored_elements, function( $a, $b ) {
			return $b['score'] <=> $a['score'];
		} );

		$sections = array_slice( $scored_elements, 0, $max_sections );
		
		if ( empty( $sections ) ) {
			error_log( "INTELLIGENT_EXTRACTION: No heuristic content found, using full page" );
			return [ 'selected_html' => $dom->saveHTML(), 'extraction_method' => 'fallback_full' ];
		}

		error_log( "INTELLIGENT_EXTRACTION: Found " . count( $sections ) . " heuristic sections" );
		return $this->format_extraction_result( $sections, 'heuristic', 'content_scoring' );
	}

	private function extract_multiple_sections( \DOMDocument $dom, int $max_sections, int $min_content_length ): array {
		// Combine semantic and heuristic approaches
		$semantic_result = $this->extract_semantic_content( $dom, $max_sections, $min_content_length, true );
		
		if ( $semantic_result['extraction_method'] !== 'fallback_full' ) {
			return $semantic_result;
		}

		return $this->extract_heuristic_content( $dom, $max_sections, $min_content_length );
	}

	private function process_semantic_nodes( \DOMNodeList $nodes, int $min_content_length, bool $exclude_navigation ): array {
		$sections = [];

		foreach ( $nodes as $node ) {
			if ( $exclude_navigation && $this->should_exclude_element( $node ) ) {
				continue;
			}

			$text_length = strlen( trim( $node->textContent ) );
			if ( $text_length >= $min_content_length ) {
				$sections[] = [
					'element' => $node,
					'score' => $this->calculate_content_score( $node ),
					'text_length' => $text_length
				];
			}
		}

		return $sections;
	}

	private function calculate_content_score( \DOMElement $element ): float {
		$score = 0;

		// Text content weight (40%)
		$text_length = strlen( trim( $element->textContent ) );
		$score += min( $text_length / 500, 1.0 ) * 0.4;

		// Semantic element bonus (30%)
		if ( in_array( strtolower( $element->tagName ), self::SEMANTIC_TAGS ) ) {
			$score += 0.3;
		}

		// Class/ID relevance (20%)
		$class_attr = $element->getAttribute( 'class' );
		$id_attr = $element->getAttribute( 'id' );
		$combined_attrs = strtolower( $class_attr . ' ' . $id_attr );

		foreach ( self::CONTENT_CLASSES as $content_class ) {
			if ( strpos( $combined_attrs, $content_class ) !== false ) {
				$score += 0.2;
				break;
			}
		}

		// Element diversity (10%)
		$child_types = [];
		foreach ( $element->childNodes as $child ) {
			if ( $child->nodeType === XML_ELEMENT_NODE ) {
				$child_types[] = $child->tagName;
			}
		}
		$score += min( count( array_unique( $child_types ) ) / 10, 1.0 ) * 0.1;

		return $score;
	}

	private function should_exclude_element( \DOMElement $element ): bool {
		$class_attr = strtolower( $element->getAttribute( 'class' ) );
		$id_attr = strtolower( $element->getAttribute( 'id' ) );
		$tag_name = strtolower( $element->tagName );
		$role_attr = strtolower( $element->getAttribute( 'role' ) );

		// Check tag name exclusions
		$exclude_tags = [ 'nav', 'header', 'footer', 'aside' ];
		if ( in_array( $tag_name, $exclude_tags ) ) {
			return true;
		}

		// Check role exclusions
		$exclude_roles = [ 'navigation', 'banner', 'contentinfo' ];
		if ( in_array( $role_attr, $exclude_roles ) ) {
			return true;
		}

		// Check class/ID exclusions
		$exclude_keywords = [ 'nav', 'menu', 'sidebar', 'widget', 'comment', 'footer', 'header' ];
		$combined_attrs = $class_attr . ' ' . $id_attr;

		foreach ( $exclude_keywords as $keyword ) {
			if ( strpos( $combined_attrs, $keyword ) !== false ) {
				return true;
			}
		}

		return false;
	}

	private function format_extraction_result( array $sections, string $method, string $selector, int $max_sections = null ): array {
		if ( empty( $sections ) ) {
			return [ 'selected_html' => '', 'extraction_method' => 'empty' ];
		}

		// Limit sections if specified
		if ( $max_sections ) {
			$sections = array_slice( $sections, 0, $max_sections );
		}

		// Combine sections into single HTML - PRESERVE CONTENT STRUCTURE
		$combined_html = '';
		$total_score = 0;
		$total_length = 0;

		foreach ( $sections as $section ) {
			$element = $section['element'];
			// CRITICAL FIX: Ensure we preserve the full element structure including text content
			$element_html = $element->ownerDocument->saveHTML( $element );
			
			// DEBUG: Log what we're extracting to ensure text content is preserved
			$text_content = trim( $element->textContent );
			error_log( "INTELLIGENT_EXTRACTION: Section text content length: " . strlen( $text_content ) );
			error_log( "INTELLIGENT_EXTRACTION: Section text preview: " . substr( $text_content, 0, 100 ) );
			
			$combined_html .= $element_html . "\n";
			$total_score += $section['score'];
			$total_length += $section['text_length'];
		}

		$average_score = count( $sections ) > 0 ? $total_score / count( $sections ) : 0;

		return [
			'selected_html' => $combined_html,
			'extraction_method' => $method,
			'selector_used' => $selector,
			'sections_count' => count( $sections ),
			'content_quality_score' => round( $average_score, 3 ),
			'total_content_length' => $total_length,
			'extraction_stats' => [
				'method' => $method,
				'sections_extracted' => count( $sections ),
				'average_quality_score' => round( $average_score, 3 ),
				'total_text_length' => $total_length
			]
		];
	}

	private function css_selector_to_xpath( string $selector ): string {
		$selector = trim( $selector );

		// Handle class selectors
		if ( 0 === strpos( $selector, '.' ) ) {
			$class_name = substr( $selector, 1 );
			return "//*[contains(concat(' ', normalize-space(@class), ' '), ' {$class_name} ')]";
		}

		// Handle ID selectors
		if ( 0 === strpos( $selector, '#' ) ) {
			$id = substr( $selector, 1 );
			return "//*[@id='{$id}']";
		}

		// Handle attribute selectors
		if ( preg_match( '/\[([^=]+)="([^"]+)"\]/', $selector, $matches ) ) {
			$attr = $matches[1];
			$value = $matches[2];
			return "//*[@{$attr}='{$value}']";
		}

		// Handle simple tag selectors
		if ( preg_match( '/^[a-zA-Z][a-zA-Z0-9]*$/', $selector ) ) {
			return "//{$selector}";
		}

		// Handle complex selectors (basic support)
		if ( strpos( $selector, '.' ) !== false && strpos( $selector, ' ' ) === false ) {
			$parts = explode( '.', $selector );
			$tag = $parts[0];
			$class = $parts[1] ?? '';
			
			if ( $tag && $class ) {
				return "//{$tag}[contains(concat(' ', normalize-space(@class), ' '), ' {$class} ')]";
			}
		}

		// Fallback: treat as tag name
		return "//{$selector}";
	}

	private function create_dom_document( string $html ): ?\DOMDocument {
		$dom = new \DOMDocument();
		
		// Suppress warnings for malformed HTML
		$previous_use_errors = libxml_use_internal_errors( true );
		
		try {
			// Load HTML with UTF-8 encoding
			$success = $dom->loadHTML( '<?xml encoding="UTF-8">' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
			
			if ( ! $success ) {
				error_log( "INTELLIGENT_EXTRACTION: Failed to load HTML into DOM" );
				return null;
			}
			
			return $dom;
		} catch ( \Exception $e ) {
			error_log( "INTELLIGENT_EXTRACTION: DOM creation failed: " . $e->getMessage() );
			return null;
		} finally {
			// Restore error handling
			libxml_use_internal_errors( $previous_use_errors );
		}
	}

	public function get_extraction_capabilities(): array {
		return [
			'strategies' => [
				'semantic' => 'Use HTML5 semantic elements and content-aware classes',
				'heuristic' => 'Algorithm-based content analysis and scoring',
				'sections' => 'Extract multiple meaningful content sections',
				'full' => 'Process entire page (backward compatibility)'
			],
			'semantic_selectors' => self::SEMANTIC_SELECTORS,
			'exclude_selectors' => self::EXCLUDE_SELECTORS,
			'scoring_factors' => [
				'text_content' => '40% - Length and density of text content',
				'semantic_elements' => '30% - HTML5 semantic tag bonus',
				'class_relevance' => '20% - Content-related class/ID names',
				'element_diversity' => '10% - Variety of child elements'
			]
		];
	}
}
