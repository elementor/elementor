<?php

namespace Elementor\Modules\Mcp\Abilities\Build_Composition;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Document\Document_Mutator;
use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Mcp\Abilities\Utils\Document_Mutation_Save;
use Elementor\Modules\Mcp\Events\Mcp_Event_Dispatcher;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Composition_Persister {

	const DOCUMENT_ROOT = 'document';
	const MODE_APPEND = 'append';
	const MODE_REPLACE_CHILDREN = 'replace_children';

	private Document_Mutator $mutator;
	private Xml_Parser $xml_parser;

	public function __construct( Document_Mutator $mutator, Xml_Parser $xml_parser ) {
		$this->mutator = $mutator;
		$this->xml_parser = $xml_parser;
	}

	/**
	 * @param Document $document The target document.
	 * @param array[]  $subtrees Root subtrees to insert.
	 * @param string   $parent_id Parent element id ("document" for root).
	 * @param string   $mode 'append' (default) or 'replace_children'.
	 * @return array{tree: array, root_ids: string[], removed_ids: string[]}|\WP_Error
	 */
	public function insert_and_save( Document $document, array $subtrees, string $parent_id, string $mode = self::MODE_APPEND ) {
		$tree = $document->get_elements_data();
		$tree = is_array( $tree ) ? $tree : [];
		$root_ids = [];
		$removed_ids = [];

		if ( self::MODE_REPLACE_CHILDREN === $mode ) {
			$replace_result = $this->replace_children( $tree, $parent_id );
			if ( is_wp_error( $replace_result ) ) {
				return $replace_result;
			}
			$tree = $replace_result['tree'];
			$removed_ids = $replace_result['removed_ids'];
		}

		foreach ( $subtrees as $subtree ) {
			$new_tree = $this->mutator->insert_subtree( $tree, $parent_id, null, $subtree );
			if ( is_wp_error( $new_tree ) ) {
				return $new_tree;
			}
			$tree = $new_tree;
			$root_ids[] = $this->find_last_root_id( $tree, $parent_id );
		}

		$save_result = Document_Mutation_Save::elements_preserving_live_status( $this->mutator, $document, $tree );
		if ( is_wp_error( $save_result ) ) {
			return $save_result;
		}

		$this->emit_insertion_events( $tree, $parent_id, $root_ids );

		return [
			'tree' => $tree,
			'root_ids' => $root_ids,
			'removed_ids' => $removed_ids,
		];
	}

	/**
	 * @return array{tree: array, removed_ids: string[]}|\WP_Error
	 */
	private function replace_children( array $tree, string $parent_id ) {
		if ( self::DOCUMENT_ROOT === $parent_id ) {
			$removed_ids = array_map(
				fn( $node ) => isset( $node['id'] ) ? (string) $node['id'] : '',
				$tree
			);
			$removed_ids = array_filter( $removed_ids );
			return [
				'tree' => [],
				'removed_ids' => array_values( $removed_ids ),
			];
		}

		$parent = $this->mutator->find_by_id( $tree, $parent_id );
		if ( null === $parent ) {
			return new \WP_Error(
				'elementor_not_found',
				__( 'Parent element not found.', 'elementor' ),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		$children = $parent['elements'] ?? [];
		$removed_ids = [];

		foreach ( $children as $child ) {
			if ( ! isset( $child['id'] ) ) {
				continue;
			}
			$child_id = (string) $child['id'];
			$removed_ids[] = $child_id;
			$new_tree = $this->mutator->remove( $tree, $child_id );
			if ( is_wp_error( $new_tree ) ) {
				return $new_tree;
			}
			$tree = $new_tree;
		}

		return [
			'tree' => $tree,
			'removed_ids' => $removed_ids,
		];
	}

	public function embed_ids_into_dom( \DOMDocument $dom, array $tree, string $parent_id, array $root_ids ): void {
		$root = $this->xml_parser->get_root( $dom );
		if ( ! $root ) {
			return;
		}

		foreach ( $this->xml_parser->get_child_elements( $root ) as $index => $child ) {
			if ( ! isset( $root_ids[ $index ] ) ) {
				break;
			}
			$subtree_node = $this->find_persisted_subtree( $tree, $parent_id, $root_ids[ $index ] );
			if ( $subtree_node ) {
				$this->apply_ids_recursive( $child, $subtree_node );
			}
		}
	}

	private function find_last_root_id( array $tree, string $parent_id ): string {
		if ( self::DOCUMENT_ROOT === $parent_id ) {
			$last = end( $tree );
			return is_array( $last ) && isset( $last['id'] ) ? (string) $last['id'] : '';
		}

		$parent = $this->mutator->find_by_id( $tree, $parent_id );
		if ( ! $parent || empty( $parent['elements'] ) ) {
			return '';
		}
		$last = end( $parent['elements'] );
		return is_array( $last ) && isset( $last['id'] ) ? (string) $last['id'] : '';
	}

	private function find_persisted_subtree( array $tree, string $parent_id, string $root_id ): ?array {
		if ( self::DOCUMENT_ROOT === $parent_id ) {
			foreach ( $tree as $node ) {
				if ( isset( $node['id'] ) && $node['id'] === $root_id ) {
					return $node;
				}
			}
			return null;
		}
		return $this->mutator->find_by_id( $tree, $root_id );
	}

	private function apply_ids_recursive( \DOMElement $node, array $subtree_node ): void {
		if ( ! empty( $subtree_node['id'] ) ) {
			$node->setAttribute( 'id', (string) $subtree_node['id'] );
		}

		$child_subtrees = $subtree_node['elements'] ?? [];
		foreach ( $this->xml_parser->get_child_elements( $node ) as $index => $child ) {
			if ( isset( $child_subtrees[ $index ] ) && is_array( $child_subtrees[ $index ] ) ) {
				$this->apply_ids_recursive( $child, $child_subtrees[ $index ] );
			}
		}
	}

	private function emit_insertion_events( array $tree, string $parent_id, array $root_ids ): void {
		$top_element_type = $this->resolve_top_element_type( $tree, $parent_id );

		foreach ( $root_ids as $root_id ) {
			$root_node = $this->mutator->find_by_id( $tree, $root_id );

			if ( null === $root_node ) {
				continue;
			}

			$this->walk_and_emit_insertion_events( $root_node, $top_element_type );
		}
	}

	private function walk_and_emit_insertion_events( array $node, string $top_element_type ): void {
		$element_name = $node['widgetType'] ?? $node['elType'] ?? '';

		if ( '' !== $element_name ) {
			Mcp_Event_Dispatcher::emit( 'element_added', [
				'element_name' => $element_name,
			] );
		}

		if ( 'e-component' === ( $node['widgetType'] ?? '' ) ) {
			[ 'id' => $component_id, 'name' => $component_name ] = $this->resolve_component_instance_meta( $node );

			Mcp_Event_Dispatcher::emit( 'component_instance_added', [
				'id'               => $component_id,
				'name'             => $component_name,
				'top_element_type' => $top_element_type,
			] );
		}

		foreach ( $node['elements'] ?? [] as $child ) {
			$this->walk_and_emit_insertion_events( $child, $top_element_type );
		}
	}

	/**
	 * @return array{id: string, name: string}
	 */
	private function resolve_component_instance_meta( array $node ): array {
		$raw_id = $node['settings']['component_instance']['value']['component_id']['value'] ?? null;

		if ( null === $raw_id || '' === $raw_id ) {
			return [
				'id'   => '',
				'name' => '',
			];
		}

		$component_id = (int) $raw_id;
		$component    = Components_Repository::make()->get( $component_id, false );
		$name         = $component ? $component->get_post()->post_title : '';

		return [
			'id'   => (string) $component_id,
			'name' => (string) $name,
		];
	}

	private function resolve_top_element_type( array $tree, string $parent_id ): string {
		if ( self::DOCUMENT_ROOT === $parent_id ) {
			return 'document';
		}

		$parent = $this->mutator->find_by_id( $tree, $parent_id );

		if ( null === $parent ) {
			return '';
		}

		return $parent['widgetType'] ?? $parent['elType'] ?? '';
	}
}
