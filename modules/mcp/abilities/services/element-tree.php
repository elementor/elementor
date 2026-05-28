<?php

namespace Elementor\Modules\Mcp\Abilities\Services;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Pure helpers for finding and replacing a node inside a v4 element tree by id.
 *
 * Used by element-scoped operations (update_element / add_classes / remove_classes)
 * to locate a single node in the saved `_elementor_data` tree without walking it
 * twice. `find_by_id` returns the node plus its index-path; `replace_at_path` uses
 * that same path to swap in a new node, returning a new tree.
 */
class Element_Tree {

	/**
	 * Locate the first node with the matching id, depth-first.
	 *
	 * @param array  $tree The element tree (typically `$document->get_elements_data()`).
	 * @param string $id   The element id to find.
	 *
	 * @return array{0: array|null, 1: array<int>} `[ node, path-of-indexes ]` or `[ null, [] ]`.
	 */
	public static function find_by_id( array $tree, string $id ): array {
		foreach ( $tree as $i => $node ) {
			if ( ! is_array( $node ) ) {
				continue;
			}

			if ( isset( $node['id'] ) && $node['id'] === $id ) {
				return [ $node, [ $i ] ];
			}

			if ( ! empty( $node['elements'] ) && is_array( $node['elements'] ) ) {
				[ $found, $sub_path ] = self::find_by_id( $node['elements'], $id );
				if ( null !== $found ) {
					return [ $found, array_merge( [ $i ], $sub_path ) ];
				}
			}
		}

		return [ null, [] ];
	}

	/**
	 * Return a new tree with the node at the given path replaced.
	 *
	 * @param array      $tree     The element tree.
	 * @param array<int> $path     Index path produced by `find_by_id`.
	 * @param array      $new_node The node to put in place of the existing one.
	 */
	public static function replace_at_path( array $tree, array $path, array $new_node ): array {
		if ( empty( $path ) ) {
			return $tree;
		}

		if ( 1 === count( $path ) ) {
			$tree[ $path[0] ] = $new_node;
			return $tree;
		}

		$head = $path[0];

		if ( ! isset( $tree[ $head ]['elements'] ) || ! is_array( $tree[ $head ]['elements'] ) ) {
			return $tree;
		}

		$tree[ $head ]['elements'] = self::replace_at_path(
			$tree[ $head ]['elements'],
			array_slice( $path, 1 ),
			$new_node
		);

		return $tree;
	}
}
