<?php

namespace Elementor\Modules\Mcp\Abilities\Build_Composition;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Xml_Parser {

	const CONFIGURATION_ID_ATTRIBUTE = 'configuration-id';
	const COMPOSITION_ROOT_TAG = 'composition-root';

	public function parse( string $xml_structure ) {
		$wrapped = '<' . self::COMPOSITION_ROOT_TAG . '>' . $xml_structure . '</' . self::COMPOSITION_ROOT_TAG . '>';

		$previous = libxml_use_internal_errors( true );
		$dom = new \DOMDocument();
		$loaded = $dom->loadXML( $wrapped, LIBXML_NONET | LIBXML_NOENT );
		$errors = libxml_get_errors();
		libxml_clear_errors();
		libxml_use_internal_errors( $previous );

		if ( ! $loaded ) {
			$message = $errors ? $errors[0]->message : 'Unknown XML error.';
			return new \WP_Error(
				'invalid_xml',
				/* translators: %s: XML parse error message */
				sprintf( __( 'Failed to parse xml_structure: %s', 'elementor' ), trim( $message ) ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return $dom;
	}

	public function get_root( \DOMDocument $dom ): ?\DOMElement {
		return $dom->documentElement ?? null; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- DOMDocument API.
	}

	/**
	 * @return \DOMElement[]
	 */
	public function get_child_elements( \DOMElement $node ): array {
		$children = [];
		// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- DOMElement API.
		foreach ( $node->childNodes as $child ) {
			if ( $child instanceof \DOMElement ) {
				$children[] = $child;
			}
		}
		return $children;
	}

	public function get_tag_name( \DOMElement $node ): string {
		return $node->tagName; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- DOMElement API.
	}

	public function get_configuration_id( \DOMElement $node ): ?string {
		return $node->hasAttribute( self::CONFIGURATION_ID_ATTRIBUTE )
			? $node->getAttribute( self::CONFIGURATION_ID_ATTRIBUTE )
			: null;
	}

	public function serialize_children( \DOMDocument $dom ): string {
		$root = $this->get_root( $dom );
		if ( ! $root ) {
			return '';
		}

		$serialized = '';
		foreach ( $this->get_child_elements( $root ) as $child ) {
			$serialized .= $dom->saveXML( $child );
		}
		return $serialized;
	}

	/**
	 * @return \DOMElement[]
	 */
	public function iterate_all_descendants( \DOMDocument $dom ): array {
		$root = $this->get_root( $dom );
		if ( ! $root ) {
			return [];
		}

		$descendants = [];
		$xpath = new \DOMXPath( $dom );
		foreach ( $xpath->query( './/*', $root ) as $node ) {
			if ( $node instanceof \DOMElement ) {
				$descendants[] = $node;
			}
		}
		return $descendants;
	}
}
