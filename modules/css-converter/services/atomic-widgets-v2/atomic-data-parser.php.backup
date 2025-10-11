<?php
namespace Elementor\Modules\CssConverter\Services\AtomicWidgetsV2;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Data_Parser {

	private HTML_To_Atomic_Widget_Mapper $widget_mapper;
	private CSS_To_Atomic_Props_Converter $props_converter;
	private CSS_To_Atomic_Bridge $css_bridge;

	public function __construct() {
		$this->widget_mapper = new HTML_To_Atomic_Widget_Mapper();
		$this->props_converter = new CSS_To_Atomic_Props_Converter();
		$this->css_bridge = new CSS_To_Atomic_Bridge();
	}

	public function parse_html_for_atomic_widgets( string $html ): array {
		if ( empty( trim( $html ) ) ) {
			return [];
		}

		$dom = $this->create_dom( $html );
		
		$css_content = $this->extract_css_from_style_tags( $dom );
		error_log( 'Atomic_Data_Parser: Extracted CSS content length: ' . strlen( $css_content ) );
		
		$dom_elements = $this->parse_dom_structure_from_dom( $dom );
		if ( empty( $dom_elements ) ) {
			return [];
		}

		error_log( 'Atomic_Data_Parser: Found ' . count( $dom_elements ) . ' DOM elements' );

		$widget_data = $this->convert_dom_elements_to_widget_data( $dom_elements );

		if ( ! empty( $css_content ) ) {
			error_log( 'Atomic_Data_Parser: Applying CSS rules to ' . count( $widget_data ) . ' widgets' );
			$widget_data = $this->css_bridge->apply_css_rules_to_widget_data( $widget_data, $css_content );
		} else {
			error_log( 'Atomic_Data_Parser: No CSS content to apply' );
		}

		return $widget_data;
	}

	private function create_dom( string $html ): \DOMDocument {
		$dom = new \DOMDocument();
		libxml_use_internal_errors( true );
		$dom->loadHTML( 
			'<html><body>' . $html . '</body></html>', 
			LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD 
		);
		libxml_clear_errors();

		return $dom;
	}

	private function extract_css_from_style_tags( \DOMDocument $dom ): string {
		$css_content = '';
		$style_tags = $dom->getElementsByTagName( 'style' );

		foreach ( $style_tags as $style_tag ) {
			$css_content .= $style_tag->textContent . "\n";
		}

		return trim( $css_content );
	}

	private function parse_dom_structure_from_dom( \DOMDocument $dom ): array {
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

			if ( strtolower( $child->tagName ) === 'style' ) {
				continue;
			}

			$element_data = $this->extract_element_data( $child );
			if ( $element_data ) {
				$elements[] = $element_data;
			}
		}

		return $elements;
	}

	private function convert_dom_elements_to_widget_data( array $dom_elements ): array {
		return $dom_elements;
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

		// Expand shorthand properties
		// TODO: Re-enable after fixing namespace issues
		// require_once __DIR__ . '/../css/processing/css-shorthand-expander.php';
		// $styles = \Elementor\Modules\CssConverter\Services\Css\Processing\CSS_Shorthand_Expander::expand_shorthand_properties( $styles );

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

	public function get_widget_mapper(): HTML_To_Atomic_Widget_Mapper {
		return $this->widget_mapper;
	}

	public function get_props_converter(): CSS_To_Atomic_Props_Converter {
		return $this->props_converter;
	}

	public function get_css_bridge(): CSS_To_Atomic_Bridge {
		return $this->css_bridge;
	}
}

