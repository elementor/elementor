<?php

namespace Elementor\Core\Utils\Document;

use Elementor\Core\Base\Document;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Document_Mutator {

	const DOCUMENT_ROOT = 'document';

	/** @var \Elementor\Elements_Manager */
	private $element_manager;

	/** @var \Elementor\Widgets_Manager */
	private $widgets_manager;

	public function __construct( $element_manager, $widgets_manager ) {
		$this->element_manager = $element_manager;
		$this->widgets_manager = $widgets_manager;
	}

	public static function instance(): self {
		return new self(
			Plugin::$instance->elements_manager,
			Plugin::$instance->widgets_manager
		);
	}

	/**
	 * Locate a node by id and return a by-reference index [ $id => &$node ]
	 * so callers can mutate the tree in place.
	 *
	 * @return array<string, array&>
	 */
	public function build_ref_index( array &$tree, string $id ): array {
		$index = [];
		$this->walk_for_ref_index( $tree, $id, $index );

		return $index;
	}

	private function walk_for_ref_index( array &$tree, string $id, array &$index ): bool {
		foreach ( $tree as &$node ) {
			if ( isset( $node['id'] ) && $node['id'] === $id ) {
				$index[ $id ] = &$node;
				return true;
			}
			if ( ! empty( $node['elements'] ) && is_array( $node['elements'] ) ) {
				if ( $this->walk_for_ref_index( $node['elements'], $id, $index ) ) {
					return true;
				}
			}
		}
		unset( $node );

		return false;
	}

	public function find_by_id( array $tree, string $id ): ?array {
		foreach ( $tree as $node ) {
			if ( isset( $node['id'] ) && $node['id'] === $id ) {
				return $node;
			}

			if ( ! empty( $node['elements'] ) ) {
				$found = $this->find_by_id( $node['elements'], $id );
				if ( null !== $found ) {
					return $found;
				}
			}
		}

		return null;
	}

	public function generate_id(): string {
		return Utils::generate_random_string();
	}

	/**
	 * @return array|\WP_Error
	 */
	public function insert_at( array $tree, string $parent_id, ?int $index, array $element ) {
		if ( ! isset( $element['id'] ) ) {
			$element['id'] = $this->generate_id();
		}

		if ( 'document' === $parent_id ) {
			return $this->splice_into( $tree, $index, $element );
		}

		$result = $this->insert_into_tree( $tree, $parent_id, $index, $element );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( false === $result ) {
			return new \WP_Error(
				'elementor_not_found',
				__( 'Parent element not found.', 'elementor' ),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		return $result;
	}

	/**
	 * @return array|\WP_Error
	 */
	public function remove( array $tree, string $id ) {
		$result = $this->remove_from_tree( $tree, $id );

		if ( false === $result ) {
			return new \WP_Error(
				'elementor_not_found',
				__( 'Element not found.', 'elementor' ),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		return $result;
	}

	/**
	 * @return array|\WP_Error
	 */
	public function move( array $tree, string $id, string $new_parent_id, ?int $index ) {
		$node = $this->find_by_id( $tree, $id );

		if ( null === $node ) {
			return new \WP_Error(
				'elementor_not_found',
				__( 'Element not found.', 'elementor' ),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		$tree = $this->remove( $tree, $id );

		if ( is_wp_error( $tree ) ) {
			return $tree;
		}

		return $this->insert_at( $tree, $new_parent_id, $index, $node );
	}

	/**
	 * Duplicate an element in place, inserting the clone right after the source
	 * inside the same parent. All ids in the clone are regenerated.
	 *
	 * @return array|\WP_Error
	 */
	public function duplicate( array $tree, string $id ) {
		$location = $this->locate_parent_and_index( $tree, $id );

		if ( null === $location ) {
			return new \WP_Error(
				'elementor_not_found',
				__( 'Element not found.', 'elementor' ),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		[ $parent_id, $index, $node ] = $location;

		return $this->insert_subtree( $tree, $parent_id, $index + 1, $node );
	}

	/**
	 * Save an elements tree to a document, downgrading `publish` to `draft`
	 * first so no live changes leak out.
	 *
	 * @return true|int|\WP_Error
	 */
	public function save_as_draft( Document $document, array $elements ) {
		if ( 'publish' === get_post_status( $document->get_main_id() ) ) {
			wp_update_post( [
				'ID' => $document->get_main_id(),
				'post_status' => 'draft',
			] );
		}

		return $document->save( [ 'elements' => $elements ] );
	}

	/**
	 * @return array|\WP_Error
	 */
	public function patch_settings( array $tree, string $id, array $partial_settings ) {
		$result = $this->patch_settings_in_tree( $tree, $id, $partial_settings );

		if ( false === $result ) {
			return new \WP_Error(
				'elementor_not_found',
				__( 'Element not found.', 'elementor' ),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		return $result;
	}

	/**
	 * Insert a subtree into the document tree, recursively generating IDs for all elements.
	 *
	 * @param array    $tree      The current document tree.
	 * @param string   $parent_id Parent element ID or 'document' for root.
	 * @param int|null $index     Insertion index (null = append).
	 * @param array    $subtree   The subtree to insert (single element with nested children).
	 *
	 * @return array|\WP_Error The updated tree or error.
	 */
	public function insert_subtree( array $tree, string $parent_id, ?int $index, array $subtree ) {
		$subtree_with_ids = $this->generate_ids_recursive( $subtree );

		return $this->insert_at( $tree, $parent_id, $index, $subtree_with_ids );
	}

	/**
	 * Recursively generate IDs for an element and all its children.
	 * Always generates new IDs to avoid duplicates when inserting subtrees.
	 *
	 * @param array $element The element to process.
	 *
	 * @return array The element with new IDs assigned.
	 */
	private function generate_ids_recursive( array $element ): array {
		$element['id'] = $this->generate_id();

		if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
			$element['elements'] = array_map(
				fn( array $child ) => $this->generate_ids_recursive( $child ),
				$element['elements']
			);
		}

		return $element;
	}

	/**
	 * @return array{0: string, 1: int, 2: array}|null [ parent_id, index, node ] or null when not found.
	 */
	private function locate_parent_and_index( array $tree, string $id, string $parent_id = self::DOCUMENT_ROOT ): ?array {
		foreach ( $tree as $i => $node ) {
			if ( isset( $node['id'] ) && $node['id'] === $id ) {
				return [ $parent_id, $i, $node ];
			}

			if ( ! empty( $node['elements'] ) && is_array( $node['elements'] ) ) {
				$found = $this->locate_parent_and_index( $node['elements'], $id, (string) ( $node['id'] ?? '' ) );
				if ( null !== $found ) {
					return $found;
				}
			}
		}

		return null;
	}

	private function splice_into( array $children, ?int $index, array $element ): array {
		$count = count( $children );

		if ( null === $index || $index >= $count ) {
			$children[] = $element;
			return $children;
		}

		array_splice( $children, $index, 0, [ $element ] );
		return $children;
	}

	/**
	 * @return array|false|\WP_Error
	 */
	private function insert_into_tree( array $tree, string $parent_id, ?int $index, array $element ) {
		foreach ( $tree as $i => $node ) {
			if ( isset( $node['id'] ) && $node['id'] === $parent_id ) {
				if ( isset( $node['elType'] ) && 'widget' === $node['elType'] ) {
					return new \WP_Error(
						'elementor_invalid_parent',
						__( 'Cannot insert into a widget element.', 'elementor' ),
						[ 'status' => \WP_Http::BAD_REQUEST ]
					);
				}

				$child_type_error = $this->check_child_type_allowed( $node, $element );
				if ( is_wp_error( $child_type_error ) ) {
					return $child_type_error;
				}

				$node['elements'] = $this->splice_into( $node['elements'] ?? [], $index, $element );
				$tree[ $i ] = $node;
				return $tree;
			}

			if ( ! empty( $node['elements'] ) ) {
				$result = $this->insert_into_tree( $node['elements'], $parent_id, $index, $element );

				if ( false !== $result ) {
					if ( is_wp_error( $result ) ) {
						return $result;
					}
					$node['elements'] = $result;
					$tree[ $i ] = $node;
					return $tree;
				}
			}
		}

		return false;
	}

	/**
	 * @return array|false
	 */
	private function remove_from_tree( array $tree, string $id ) {
		foreach ( $tree as $i => $node ) {
			if ( isset( $node['id'] ) && $node['id'] === $id ) {
				array_splice( $tree, $i, 1 );
				return $tree;
			}

			if ( ! empty( $node['elements'] ) ) {
				$result = $this->remove_from_tree( $node['elements'], $id );
				if ( false !== $result ) {
					$node['elements'] = $result;
					$tree[ $i ] = $node;
					return $tree;
				}
			}
		}

		return false;
	}

	/**
	 * @return null|\WP_Error
	 */
	private function check_child_type_allowed( array $parent_node, array $child ): ?\WP_Error {
		$parent_instance = $this->element_manager->get_element_types( $parent_node['elType'] ?? '' );

		if ( ! $parent_instance ) {
			return null;
		}

		$config  = $parent_instance->get_config();
		$allowed = $config['allowed_child_types'] ?? [];

		if ( empty( $allowed ) ) {
			return null;
		}

		$child_type = $child['widgetType'] ?? $child['elType'] ?? '';

		if ( ! in_array( $child_type, $allowed, true ) ) {
			return new \WP_Error(
				'elementor_invalid_parent',
				__( 'Element type not allowed as child of this parent.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return null;
	}

	/**
	 * @return array|false
	 */
	private function patch_settings_in_tree( array $tree, string $id, array $partial_settings ) {
		foreach ( $tree as $i => $node ) {
			if ( isset( $node['id'] ) && $node['id'] === $id ) {
				$node['settings'] = array_merge( $node['settings'] ?? [], $partial_settings );
				$tree[ $i ] = $node;
				return $tree;
			}

			if ( ! empty( $node['elements'] ) ) {
				$result = $this->patch_settings_in_tree( $node['elements'], $id, $partial_settings );
				if ( false !== $result ) {
					$node['elements'] = $result;
					$tree[ $i ] = $node;
					return $tree;
				}
			}
		}

		return false;
	}
}
