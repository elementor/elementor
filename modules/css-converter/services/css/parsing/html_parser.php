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
		
		return $this->extract_elements( $root );
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
			} elseif ( $child->nodeType === XML_ELEMENT_NODE ) {
				// Recursively extract text from nested elements
				$text .= ' ' . $this->extract_text_content( $child );
			}
		}

		return trim( $text );
	}

	private function calculate_depth( DOMElement $element ) {
		$depth = 0;
		$parent = $element->parentNode;

		while ( $parent && $parent->nodeType === XML_ELEMENT_NODE ) {
			$depth++;
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

		return $styles;
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
}
