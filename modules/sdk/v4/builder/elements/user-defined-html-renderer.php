<?php

namespace Elementor\Modules\Sdk\V4\Builder\Elements;

use DOMDocument;
use DOMElement;
use Elementor\Widget_Base;

class User_Defined_Html_Renderer {

	protected $raw_input = '';

	public function __construct( $raw_input ) {
		$this->raw_input = $raw_input;
	}

	// type assertion for HTMLElement
	/**
	 * @return DOMElement
	 * @throws \Exception
	 */
	protected function is_html_element( mixed $value ): DOMElement {
		if ( ! $value instanceof DOMElement ) {
			throw new \Exception( esc_html( 'Invalid HTML element' ) );
		}
		return $value;
	}


	/**
	 * @return array{document: DOMDocument, host_element: DOMElement}
	 */
	public function render( mixed $render_context, Widget_Base $element ): mixed {
		$dom_document = new \DOMDocument();
		$fragment = $dom_document->createDocumentFragment();
		$fragment->appendXml( $this->raw_input );
		$fragment->normalize();
        // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
		$child_count = $fragment->childElementCount;
		$host_element = new DOMElement( 'span' );
		$dom_document->importNode( $host_element, true );
		$dom_document->appendChild( $host_element );
		if ( ! $host_element ) {
			throw new \Exception( 'Failed to create host element' );
		}
		if ( $child_count > 1 ) {
			// wrap all children in a host <span> element
			$host_element->setAttribute( 'data-elementor-wrapper', '' );
			while ( $fragment->hasChildNodes() > 0 ) {
                // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
				$host_element->appendChild( $fragment->firstChild );
			}
		} else {
            // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
			$host_element = $fragment->firstChild;
		}
		$host_element = $this->is_html_element( $host_element );
		$host_element->setAttribute( 'id', $render_context['id'] );
		$host_element->setAttribute( 'data-e-type', $element->get_name() );
		$host_element->setAttribute( 'data-elementor-element-type', $element->get_name() );
		$host_element->setAttribute( 'data-id', $element->get_id() );
		$classes = $render_context['settings']['classes'] ?? [];
		$base_class = $render_context['base_styles']['base'] ?? '';
		$class_attr = $host_element->getAttribute( 'class' );
		$class_attr .= ' ' . $base_class;
		foreach ( $classes as $class ) {
			$class_attr .= ' ' . $class;
		}
		$class_attr = trim( $class_attr );
		$host_element->setAttribute( 'class', $class_attr );
		$dom_document->appendChild( $host_element );
		$dom_document->normalizeDocument();
		return [
			'document' => $dom_document,
			'host_element' => $host_element,
		];
	}
}
