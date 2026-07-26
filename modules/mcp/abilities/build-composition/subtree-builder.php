<?php

namespace Elementor\Modules\Mcp\Abilities\Build_Composition;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Subtree_Builder {

	private Xml_Parser $xml_parser;

	public function __construct( Xml_Parser $xml_parser ) {
		$this->xml_parser = $xml_parser;
	}

	/**
	 * @param \DOMDocument         $dom            XML document.
	 * @param array<string, array> $widget_configs Resolved type configs indexed by tag.
	 * @return array[]
	 */
	public function build( \DOMDocument $dom, array $widget_configs ): array {
		$root = $this->xml_parser->get_root( $dom );
		if ( ! $root ) {
			return [];
		}

		$subtrees = [];
		foreach ( $this->xml_parser->get_child_elements( $root ) as $child ) {
			$subtrees[] = $this->build_subtree( $child, $widget_configs );
		}

		return $subtrees;
	}

	/**
	 * Build an index of configuration-id -> reference to subtree node.
	 *
	 * @param array[]      $subtrees Built subtrees (mutated by reference downstream).
	 * @param \DOMDocument $dom      Source DOM.
	 * @return array<string, array&>
	 */
	public function index_by_config_id( array &$subtrees, \DOMDocument $dom ): array {
		$root = $this->xml_parser->get_root( $dom );
		if ( ! $root ) {
			return [];
		}

		$dom_roots = $this->xml_parser->get_child_elements( $root );
		$index = [];

		foreach ( $subtrees as $i => &$subtree ) {
			if ( isset( $dom_roots[ $i ] ) ) {
				$this->index_recursive( $subtree, $dom_roots[ $i ], $index );
			}
		}
		unset( $subtree );

		return $index;
	}

	private function build_subtree( \DOMElement $node, array $widget_configs ): array {
		$config = $widget_configs[ $this->xml_parser->get_tag_name( $node ) ];

		$children = [];
		foreach ( $this->xml_parser->get_child_elements( $node ) as $child ) {
			$children[] = $this->build_subtree( $child, $widget_configs );
		}

		$element = [
			'elType' => $config['elType'],
			'settings' => [],
			'elements' => $children,
			'editor_settings' => [],
		];

		if ( ! empty( $config['widgetType'] ) ) {
			$element['widgetType'] = $config['widgetType'];
		}

		$configuration_id = $this->xml_parser->get_configuration_id( $node );
		if ( null !== $configuration_id ) {
			$element['editor_settings']['title'] = $configuration_id;
		}

		return $element;
	}

	private function index_recursive( array &$subtree, \DOMElement $node, array &$index ): void {
		$configuration_id = $this->xml_parser->get_configuration_id( $node );
		if ( null !== $configuration_id ) {
			$index[ $configuration_id ] = &$subtree;
		}

		if ( ! isset( $subtree['elements'] ) || ! is_array( $subtree['elements'] ) ) {
			return;
		}

		$child_elements = $this->xml_parser->get_child_elements( $node );
		foreach ( $subtree['elements'] as $i => &$child_subtree ) {
			if ( isset( $child_elements[ $i ] ) ) {
				$this->index_recursive( $child_subtree, $child_elements[ $i ], $index );
			}
		}
		unset( $child_subtree );
	}
}
