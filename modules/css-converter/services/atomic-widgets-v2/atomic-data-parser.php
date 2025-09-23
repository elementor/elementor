<?php
namespace Elementor\Modules\CssConverter\Services\AtomicWidgetsV2;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Data_Parser {

	private HTML_To_Atomic_Widget_Mapper $widget_mapper;
	private CSS_To_Atomic_Props_Converter $props_converter;

	public function __construct() {
		$this->widget_mapper = new HTML_To_Atomic_Widget_Mapper();
		$this->props_converter = new CSS_To_Atomic_Props_Converter();
	}

	public function parse_html_for_atomic_widgets( string $html ): array {
		if ( empty( trim( $html ) ) ) {
			return [];
		}

		$dom_elements = $this->parse_dom_structure( $html );
		if ( empty( $dom_elements ) ) {
			return [];
		}

		return $this->convert_dom_elements_to_widget_data( $dom_elements );
	}

	private function parse_dom_structure( string $html ): array {
		$dom = new \DOMDocument();
		$dom->loadHTML( 
			'<html><body>' . $html . '</body></html>', 
			LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD 
		);

		$xpath = new \DOMXPath( $dom );
		$body = $dom->getElementsByTagName( 'body' )->item( 0 );

		if ( ! $body ) {
			return [];
		}

		return $this->extract_elements_recursively( $body );
	}

	private function extract_elements_recursively( \DOMNode $node ): array {
		$elements = [];

		foreach ( $node->childNodes as $child ) {
			if ( $child->nodeType !== XML_ELEMENT_NODE ) {
				continue;
			}

			$element_data = $this->extract_element_data( $child );
			if ( $element_data ) {
				$elements[] = $element_data;
			}
		}

		return $elements;
	}

	private function extract_element_data( \DOMElement $element ): ?array {
		$tag_name = strtolower( $element->tagName );
		$widget_config = $this->widget_mapper->get_widget_config( $tag_name );

		if ( ! $widget_config ) {
			return null;
		}

		$inline_styles = $this->extract_inline_styles( $element );
		$atomic_props = $this->convert_styles_to_atomic_props( $inline_styles );
		$content = $this->extract_text_content( $element );
		$attributes = $this->extract_attributes( $element );
		$children = $this->extract_children( $element );

		return [
			'tag' => $tag_name,
			'widget_type' => $widget_config['type'],
			'widget_config' => $widget_config,
			'atomic_props' => $atomic_props,
			'content' => $content,
			'attributes' => $attributes,
			'children' => $children,
		];
	}

	private function extract_inline_styles( \DOMElement $element ): array {
		$style_attr = $element->getAttribute( 'style' );
		if ( empty( $style_attr ) ) {
			return [];
		}

		$styles = [];
		$declarations = explode( ';', $style_attr );

		foreach ( $declarations as $declaration ) {
			$declaration = trim( $declaration );
			if ( empty( $declaration ) ) {
				continue;
			}

			$parts = explode( ':', $declaration, 2 );
			if ( count( $parts ) === 2 ) {
				$property = trim( $parts[0] );
				$value = trim( $parts[1] );
				$styles[ $property ] = $value;
			}
		}

		return $styles;
	}

	private function convert_styles_to_atomic_props( array $styles ): array {
		$atomic_props = [];

		foreach ( $styles as $property => $value ) {
			$atomic_prop = $this->props_converter->convert_css_to_atomic_prop( $property, $value );
			if ( $atomic_prop ) {
				$atomic_props[ $property ] = $atomic_prop;
			}
		}

		return $atomic_props;
	}

	private function extract_text_content( \DOMElement $element ): string {
		$text_content = '';

		foreach ( $element->childNodes as $child ) {
			if ( $child->nodeType === XML_TEXT_NODE ) {
				$text_content .= $child->textContent;
			} elseif ( $child->nodeType === XML_ELEMENT_NODE && $this->is_inline_element( $child->tagName ) ) {
				$text_content .= $this->extract_text_content( $child );
			}
		}

		return trim( $text_content );
	}

	private function is_inline_element( string $tag_name ): bool {
		$inline_elements = [
			'span', 'strong', 'em', 'b', 'i', 'u', 'small', 'mark', 'del', 'ins', 'sub', 'sup', 'code'
		];

		return in_array( strtolower( $tag_name ), $inline_elements, true );
	}

	private function extract_attributes( \DOMElement $element ): array {
		$attributes = [];

		foreach ( $element->attributes as $attr ) {
			if ( $attr->name !== 'style' ) {
				$attributes[ $attr->name ] = $attr->value;
			}
		}

		return $attributes;
	}

	private function extract_children( \DOMElement $element ): array {
		$children = [];

		foreach ( $element->childNodes as $child ) {
			if ( $child->nodeType === XML_ELEMENT_NODE ) {
				$child_data = $this->extract_element_data( $child );
				if ( $child_data ) {
					$children[] = $child_data;
				}
			}
		}

		return $children;
	}
}
