<?php
namespace Elementor\Modules\CssConverter\Services\AtomicWidgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use DOMDocument;
use DOMElement;
use DOMXPath;

class Atomic_Html_Parser {
	
	private DOMDocument $dom;
	private ?DOMXPath $xpath = null;
	private Html_Tag_To_Widget_Mapper $widget_mapper;
	
	public function __construct() {
		$this->dom = new DOMDocument();
		$this->dom->preserveWhiteSpace = false;
		$this->dom->formatOutput = false;
		
		libxml_use_internal_errors( true );
		
		$this->widget_mapper = new Html_Tag_To_Widget_Mapper();
	}
	
	public function can_parse( string $html ): bool {
		if ( empty( trim( $html ) ) ) {
			return false;
		}
		
		$prepared_html = $this->prepare_html( $html );
		
		return ! empty( $prepared_html );
	}
	
	public function parse( string $html ): array {
		$html = $this->prepare_html( $html );
		
		$success = $this->dom->loadHTML( $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
		
		if ( ! $success ) {
			return [];
		}
		
		$this->xpath = new DOMXPath( $this->dom );
		
		$body = $this->dom->getElementsByTagName( 'body' )->item( 0 );
		$root = $body ?: $this->dom->documentElement;
		
		if ( null === $root ) {
			return [];
		}
		
		return $this->extract_elements( $root );
	}
	
	private function prepare_html( string $html ): string {
		$html = trim( $html );
		
		if ( empty( $html ) ) {
			return '<div></div>';
		}
		
		if ( strpos( $html, '<html' ) === false && strpos( $html, '<body' ) === false ) {
			$html = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>' . $html . '</body></html>';
		}
		
		return $html;
	}
	
	private function extract_elements( \DOMNode $node ): array {
		$elements = [];
		
		foreach ( $node->childNodes as $child ) {
			if ( $child->nodeType !== XML_ELEMENT_NODE ) {
				continue;
			}
			
			$element = $this->process_element( $child );
			
			if ( $element !== null ) {
				$elements[] = $element;
			}
		}
		
		return $elements;
	}
	
	private function process_element( DOMElement $element ): ?array {
		$tag = strtolower( $element->tagName );
		
		if ( $this->should_skip_element( $tag ) ) {
			return null;
		}
		
		$element_data = [
			'tag' => $tag,
			'text' => $this->extract_text_content( $element ),
			'attributes' => $this->extract_attributes( $element ),
			'classes' => $this->extract_classes( $element ),
			'inline_styles' => $this->extract_inline_styles( $element ),
			'children' => $this->extract_children( $element ),
			'widget_type' => $this->widget_mapper->get_widget_type( $tag ),
		];
		
		return $element_data;
	}
	
	private function should_skip_element( string $tag ): bool {
		$skip_tags = [ 'script', 'style', 'meta', 'link', 'title', 'head' ];
		
		return in_array( $tag, $skip_tags, true );
	}
	
	private function extract_text_content( DOMElement $element ): string {
		$text_content = '';
		
		foreach ( $element->childNodes as $child ) {
			if ( $child->nodeType === XML_TEXT_NODE ) {
				$text_content .= $child->textContent;
			} elseif ( $child->nodeType === XML_ELEMENT_NODE && $this->is_inline_text_element( $child ) ) {
				$text_content .= $this->extract_text_content( $child );
			}
		}
		
		return trim( $text_content );
	}
	
	private function is_inline_text_element( \DOMNode $node ): bool {
		if ( $node->nodeType !== XML_ELEMENT_NODE ) {
			return false;
		}
		
		$inline_tags = [ 'span', 'strong', 'b', 'em', 'i', 'u', 'small', 'mark', 'code' ];
		
		return in_array( strtolower( $node->nodeName ), $inline_tags, true );
	}
	
	private function extract_attributes( DOMElement $element ): array {
		$attributes = [];
		
		if ( ! $element->hasAttributes() ) {
			return $attributes;
		}
		
		foreach ( $element->attributes as $attribute ) {
			$name = $attribute->name;
			$value = $attribute->value;
			
			if ( $name === 'class' || $name === 'style' ) {
				continue;
			}
			
			$attributes[ $name ] = $value;
		}
		
		return $attributes;
	}
	
	private function extract_classes( DOMElement $element ): array {
		$class_attr = $element->getAttribute( 'class' );
		
		if ( empty( $class_attr ) ) {
			return [];
		}
		
		return array_filter( 
			array_map( 'trim', explode( ' ', $class_attr ) ),
			function( $class ) {
				return ! empty( $class );
			}
		);
	}
	
	private function extract_inline_styles( DOMElement $element ): array {
		$style_attr = $element->getAttribute( 'style' );
		
		if ( empty( $style_attr ) ) {
			return [];
		}
		
		return $this->parse_inline_styles( $style_attr );
	}
	
	private function parse_inline_styles( string $style_string ): array {
		$styles = [];
		$declarations = explode( ';', $style_string );
		
		foreach ( $declarations as $declaration ) {
			$declaration = trim( $declaration );
			
			if ( empty( $declaration ) ) {
				continue;
			}
			
			$colon_pos = strpos( $declaration, ':' );
			
			if ( $colon_pos === false ) {
				continue;
			}
			
			$property = trim( substr( $declaration, 0, $colon_pos ) );
			$value = trim( substr( $declaration, $colon_pos + 1 ) );
			
			if ( ! empty( $property ) && ! empty( $value ) ) {
				$styles[ $property ] = $value;
			}
		}
		
		// Expand shorthand properties
		require_once __DIR__ . '/../css/processing/css-shorthand-expander.php';
		$styles = \Elementor\Modules\CssConverter\Services\Css\Processing\CSS_Shorthand_Expander::expand_shorthand_properties( $styles );
		
		return $styles;
	}
	
	private function extract_children( DOMElement $element ): array {
		$children = [];
		
		foreach ( $element->childNodes as $child ) {
			if ( $child->nodeType !== XML_ELEMENT_NODE ) {
				continue;
			}
			
			$child_element = $this->process_element( $child );
			
			if ( $child_element !== null ) {
				$children[] = $child_element;
			}
		}
		
		return $children;
	}
}
