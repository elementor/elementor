<?php

namespace Elementor\Modules\AtomicWidgets\Builder;

use DOMDocument;

class Renderer {

	protected $element;

	public function __construct( $element ) {
		$this->element = $element;
	}

	protected function html_string_to_nodes( string $html, DOMDocument $document ) {
		$nodes = [];
		$doc = new DOMDocument();
		$doc->loadHTML( $html, LIBXML_NOERROR | LIBXML_NOWARNING );
		foreach ( $doc->getElementsByTagName( 'body' )->item( 0 )->childNodes as $node ) {
			$newNode = $document->importNode( $node, true );
			array_push( $nodes, $newNode );
		}
		return $nodes;
	}

	public function render( string $raw_html ): string {
		$document = new DOMDocument();
		try {
			$document->loadXML( $raw_html );
			$child_nodes = [];
			foreach ( $this->element->get_children() as $child ) {
				ob_start();
				$child->print_element();
				$child_html = ob_get_clean();
				$new_nodes = $this->html_string_to_nodes( $child_html, $document );
				foreach ( $new_nodes as $new_node ) {
					array_push( $child_nodes, $new_node );
				}
			}
			$document_slots = iterator_to_array( $document->getElementsByTagName( 'slot' ) );

			foreach ( $child_nodes as $child_node ) {
				$slot_name = $child_node->attributes->getNamedItem( 'slot' ) ?? false;
				if ( $slot_name ) {
					$target_slot = array_find( $document_slots, function ( $slot ) use ( $slot_name ) {
						return $slot->getAttribute( 'name' ) === $slot_name->value;
					});
					if ( null !== $target_slot ) {
						$target_slot->appendChild( $child_node );
					}
				}
			}
		} finally {
		}
		return $document->saveXML();
	}
}
