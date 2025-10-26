<?php
namespace Elementor\Modules\CssConverter\Services\Css\Parsing;
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
use DOMDocument;
use DOMElement;
use DOMXPath;
class Html_Parser {
	private $dom;
	private $xpath;
	public function __construct() {
		$this->dom = new DOMDocument();
		$this->dom->preserveWhiteSpace = false;
		$this->dom->formatOutput = false;
		// Suppress errors for malformed HTML
		libxml_use_internal_errors( true );
	}
	public function parse( $html ) {
		// Clean up HTML and add proper encoding
		$html = $this->prepare_html( $html );
		// Load HTML with error recovery
		$success = $this->dom->loadHTML( $html, \LIBXML_HTML_NOIMPLIED | \LIBXML_HTML_NODEFDTD );
		if ( ! $success ) {
			$errors = libxml_get_errors();
			$error_messages = array_map( function( $error ) {
				return trim( $error->message );
			}, $errors );
			throw new \Exception( 'HTML parsing failed: ' . implode( ', ', $error_messages ) );
		}
		$this->xpath = new DOMXPath( $this->dom );
		// Extract body content or use entire document
		$body = $this->dom->getElementsByTagName( 'body' )->item( 0 );
		$root = $body ?: $this->dom->documentElement;
		$elements = $this->extract_elements( $root );
		// Preprocess elements to wrap text content in paragraph tags
		return $this->preprocess_elements_for_text_wrapping( $elements );
	}
	private function prepare_html( $html ) {
		// Add UTF-8 encoding if not present
		if ( strpos( $html, '<meta charset' ) === false && strpos( $html, '<?xml' ) === false ) {
			$html = '<meta charset="UTF-8">' . $html;
		}
		// Wrap in HTML structure if needed
		if ( strpos( $html, '<html' ) === false ) {
			$html = '<html><head><meta charset="UTF-8"></head><body>' . $html . '</body></html>';
		}
		return $html;
	}
	private function extract_elements( $node ) {
		$elements = [];
		if ( ! $node instanceof DOMElement ) {
			return $elements;
		}
		foreach ( $node->childNodes as $child ) {
			if ( $child->nodeType === XML_ELEMENT_NODE ) {
				$element = $this->extract_element_data( $child );
				if ( $element ) {
					$elements[] = $element;
				}
			}
		}
		return $elements;
	}
	private function extract_element_data( DOMElement $element ) {
		$tag_name = strtolower( $element->tagName );
		// Skip script and style tags
		if ( in_array( $tag_name, [ 'script', 'style', 'meta', 'link', 'title' ], true ) ) {
			return null;
		}
		$data = [
			'tag' => $tag_name,
			'attributes' => $this->extract_attributes( $element ),
			'content' => $this->extract_text_content( $element ),
			'children' => $this->extract_elements( $element ),
			'depth' => $this->calculate_depth( $element ),
		];
		// Extract CSS from style attribute
		if ( ! empty( $data['attributes']['style'] ) ) {
			$data['inline_css'] = $this->parse_inline_css( $data['attributes']['style'] );
		} else {
			$data['inline_css'] = [];
		}
		return $data;
	}
	private function extract_attributes( DOMElement $element ) {
		$attributes = [];
		if ( $element->hasAttributes() ) {
			foreach ( $element->attributes as $attr ) {
				$attributes[ $attr->name ] = $attr->value;
			}
		}
		return $attributes;
	}
	private function extract_text_content( DOMElement $element ) {
		$text = '';
		foreach ( $element->childNodes as $child ) {
			if ( $child->nodeType === XML_TEXT_NODE ) {
				$text .= trim( $child->textContent );
			}
			// CRITICAL FIX: Don't recursively extract text from nested elements
			// This prevents parent elements from getting text content that belongs to their children
			// Only extract direct text nodes that are immediate children of this element
		}
		
		// CRITICAL FIX: Decode HTML entities properly
		// This fixes issues like 'weu2019ve' -> 'we've'
		$decoded_text = $this->decode_html_entities( trim( $text ) );
		
		return $decoded_text;
	}
	
	private function decode_html_entities( $text ) {
		// First decode standard HTML entities
		$decoded = html_entity_decode( $text, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
		
		// Handle Unicode escape sequences like u2019 that might not be properly encoded
		// u2019 = right single quotation mark (')
		$unicode_replacements = [
			'u2019' => "\u{2019}", // Right single quotation mark
			'u2018' => "\u{2018}", // Left single quotation mark  
			'u201C' => "\u{201C}", // Left double quotation mark
			'u201D' => "\u{201D}", // Right double quotation mark
			'u2013' => "\u{2013}", // En dash
			'u2014' => "\u{2014}", // Em dash
			'u2026' => "\u{2026}", // Horizontal ellipsis
			'u00A0' => "\u{00A0}", // Non-breaking space
		];
		
		foreach ( $unicode_replacements as $unicode => $replacement ) {
			$decoded = str_replace( $unicode, $replacement, $decoded );
		}
		
		
		return $decoded;
	}
	private function calculate_depth( DOMElement $element ) {
		$depth = 0;
		$parent = $element->parentNode;
		while ( $parent && $parent->nodeType === XML_ELEMENT_NODE ) {
			++$depth;
			$parent = $parent->parentNode;
		}
		return $depth;
	}
	private function parse_inline_css( $css_string ) {
		$styles = [];
		$declarations = explode( ';', $css_string );
		foreach ( $declarations as $declaration ) {
			$declaration = trim( $declaration );
			if ( empty( $declaration ) ) {
				continue;
			}
			$parts = explode( ':', $declaration, 2 );
			if ( count( $parts ) === 2 ) {
				$property = trim( $parts[0] );
				$value = trim( $parts[1] );
				// Check for !important
				$important = false;
				if ( strpos( $value, '!important' ) !== false ) {
					$value = trim( str_replace( '!important', '', $value ) );
					$important = true;
				}
				$styles[ $property ] = [
					'value' => $value,
					'important' => $important,
				];
			}
		}
		$simple_styles = [];
		foreach ( $styles as $property => $data ) {
			$simple_styles[ $property ] = $data['value'];
			if ( $property === 'transform' ) {
			}
		}
		$expanded_styles = \Elementor\Modules\CssConverter\Services\Css\Processing\CSS_Shorthand_Expander::expand_shorthand_properties( $simple_styles );
		// Convert back to the expected format
		$final_styles = [];
		foreach ( $expanded_styles as $property => $value ) {
			$important = isset( $styles[ $property ] ) ? $styles[ $property ]['important'] : false;
			$final_styles[ $property ] = [
				'value' => $value,
				'important' => $important,
			];
		}
		return $final_styles;
	}
	public function extract_linked_css( $html ) {
		$css_urls = [];
		// Parse HTML to find linked stylesheets
		$temp_dom = new DOMDocument();
		libxml_use_internal_errors( true );
		$temp_dom->loadHTML( $html, \LIBXML_HTML_NOIMPLIED | \LIBXML_HTML_NODEFDTD );
		$links = $temp_dom->getElementsByTagName( 'link' );
		foreach ( $links as $link ) {
			if ( $link->getAttribute( 'rel' ) === 'stylesheet' && $link->getAttribute( 'href' ) ) {
				$css_urls[] = $link->getAttribute( 'href' );
			}
		}
		// Also look for @import statements in style tags
		$styles = $temp_dom->getElementsByTagName( 'style' );
		foreach ( $styles as $style ) {
			$css_content = $style->textContent;
			preg_match_all( '/@import\s+(?:url\()?["\']?([^"\'()]+)["\']?\)?/i', $css_content, $matches );
			if ( ! empty( $matches[1] ) ) {
				$css_urls = array_merge( $css_urls, $matches[1] );
			}
		}
		return array_unique( $css_urls );
	}
	public function validate_html_structure( $elements, $max_depth = 20 ) {
		$issues = [];
		foreach ( $elements as $element ) {
			// Check nesting depth
			if ( $element['depth'] > $max_depth ) {
				$issues[] = [
					'type' => 'max_depth_exceeded',
					'element' => $element['tag'],
					'depth' => $element['depth'],
					'max_allowed' => $max_depth,
				];
			}
			// Recursively check children
			if ( ! empty( $element['children'] ) ) {
				$child_issues = $this->validate_html_structure( $element['children'], $max_depth );
				$issues = array_merge( $issues, $child_issues );
			}
		}
		return $issues;
	}
	public function get_parsing_errors() {
		return libxml_get_errors();
	}
	public function clear_errors() {
		libxml_clear_errors();
	}
	private function preprocess_elements_for_text_wrapping( $elements ) {
		$processed_elements = [];
		foreach ( $elements as $element ) {
			$processed_elements[] = $this->wrap_text_content_in_paragraphs( $element );
		}
		return $processed_elements;
	}
	private function wrap_text_content_in_paragraphs( $element ) {
		if ( isset( $element['attributes']['class'] ) && strpos( $element['attributes']['class'], 'box' ) !== false ) {
		}
		$text_wrapping_tags = [ 'div', 'span', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav' ];
		// Only process elements that should have their text wrapped
		if ( ! in_array( $element['tag'], $text_wrapping_tags, true ) ) {
			// Recursively process children for other elements
			if ( ! empty( $element['children'] ) ) {
				$element['children'] = $this->preprocess_elements_for_text_wrapping( $element['children'] );
			}
			return $element;
		}
		// Check if element has direct text content (not just from children)
		$has_direct_text = ! empty( trim( $element['content'] ) );
		$has_children = ! empty( $element['children'] );
		// If element has both text content and children, wrap the text in a paragraph
		if ( $has_direct_text && $has_children ) {
			
			// Create a paragraph element for the text content
			// CRITICAL FIX: Only transfer flattened classes to paragraph, keep original classes on parent
			$flattened_classes = $this->extract_flattened_classes( $element['attributes'] ?? [] );
			$paragraph_element = [
				'tag' => 'p',
				'attributes' => $flattened_classes, // Only transfer flattened classes to paragraph
				'content' => trim( $element['content'] ),
				'children' => [],
				'depth' => $element['depth'] + 1,
				'inline_css' => [], // Don't transfer inline CSS - keep it on the parent div
				'synthetic' => true, // Mark as synthetic for widget mapper optimization
			];
			
			
			// Process existing children recursively
			$processed_children = $this->preprocess_elements_for_text_wrapping( $element['children'] );
			// Add paragraph as first child, followed by existing children
			$element['children'] = array_merge( [ $paragraph_element ], $processed_children );
			// Clear the direct text content since it's now in the paragraph
			$element['content'] = '';
			// CRITICAL FIX: Remove flattened classes from parent but keep original classes
			$element['attributes'] = $this->remove_flattened_classes( $element['attributes'] ?? [] );
		} elseif ( $has_direct_text && ! $has_children ) {
			
			// Element has only text content - wrap it in a paragraph
			// Transfer flattened classes to paragraph, but keep original classes on parent for ID+class selector matching
			$paragraph_attributes = $this->extract_flattened_classes( $element['attributes'] ?? [] );
			$paragraph_element = [
				'tag' => 'p',
				'attributes' => $paragraph_attributes, // Only transfer flattened classes
				'content' => trim( $element['content'] ),
				'children' => [],
				'depth' => $element['depth'] + 1,
				'inline_css' => [], // Don't transfer inline CSS - keep it on the parent div
				'synthetic' => true, // Mark as synthetic for widget mapper optimization
			];
			
			
			$element['children'] = [ $paragraph_element ];
			$element['content'] = '';
			// Remove flattened classes from parent but keep original classes (including those needed for #id.class matching)
			$element['attributes'] = $this->remove_flattened_classes( $element['attributes'] ?? [] );
		} elseif ( $has_children ) {
			// Element has only children - process them recursively
			$element['children'] = $this->preprocess_elements_for_text_wrapping( $element['children'] );
		}
		return $element;
	}
	private function extract_flattened_classes( $attributes ) {
		// Extract only flattened classes (classes containing '--') from attributes
		if ( empty( $attributes['class'] ) ) {
			return [];
		}
		$classes = explode( ' ', $attributes['class'] );
		$flattened_classes = [];
		foreach ( $classes as $class ) {
			$class = trim( $class );
			// Flattened classes contain '--' (e.g., 'third--first-second')
			if ( ! empty( $class ) && strpos( $class, '--' ) !== false ) {
				$flattened_classes[] = $class;
			}
		}
		if ( empty( $flattened_classes ) ) {
			return [];
		}
		return [ 'class' => implode( ' ', $flattened_classes ) ];
	}
	private function remove_flattened_classes( $attributes ) {
		// Remove flattened classes (classes containing '--') from attributes, keep original classes
		if ( empty( $attributes['class'] ) ) {
			return $attributes;
		}
		$classes = explode( ' ', $attributes['class'] );
		$original_classes = [];
		foreach ( $classes as $class ) {
			$class = trim( $class );
			// Keep classes that don't contain '--' (original classes like 'first', 'second', 'third')
			if ( ! empty( $class ) && strpos( $class, '--' ) === false ) {
				$original_classes[] = $class;
			}
		}
		if ( empty( $original_classes ) ) {
			// If no original classes remain, remove the class attribute entirely
			unset( $attributes['class'] );
		} else {
			$attributes['class'] = implode( ' ', $original_classes );
		}
		return $attributes;
	}
	private function remove_all_classes( $attributes ) {
		// Remove all classes from attributes
		if ( isset( $attributes['class'] ) ) {
			unset( $attributes['class'] );
		}
		return $attributes;
	}
}
