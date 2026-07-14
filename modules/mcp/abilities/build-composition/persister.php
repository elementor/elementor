<?php

namespace Elementor\Modules\Mcp\Abilities\Build_Composition;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Document\Document_Mutator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Persister {

	const DOCUMENT_ROOT = 'document';

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
	 * @return array{tree: array, root_ids: string[]}|\WP_Error
	 */
	public function persist( Document $document, array $subtrees, string $parent_id ) {
		$tree = $document->get_elements_data();
		$tree = is_array( $tree ) ? $tree : [];
		$root_ids = [];

		foreach ( $subtrees as $subtree ) {
			$new_tree = $this->mutator->insert_subtree( $tree, $parent_id, null, $subtree );
			if ( is_wp_error( $new_tree ) ) {
				return $new_tree;
			}
			$tree = $new_tree;
			$root_ids[] = $this->find_last_root_id( $tree, $parent_id );
		}

		$save_result = $this->save_to_draft( $document, $tree );
		if ( is_wp_error( $save_result ) ) {
			return $save_result;
		}

		if ( ! $save_result ) {
			return new \WP_Error(
				'save_failed',
				__( 'Could not save document.', 'elementor' ),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		return [
			'tree' => $tree,
			'root_ids' => $root_ids,
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

	private function save_to_draft( Document $document, array $elements ) {
		if ( 'publish' === get_post_status( $document->get_main_id() ) ) {
			wp_update_post( [
				'ID' => $document->get_main_id(),
				'post_status' => 'draft',
			] );
		}

		return $document->save( [ 'elements' => $elements ] );
	}
}
