<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Modules\AtomicWidgets\Styles\CacheValidity\Cache_Validity;
use Elementor\Plugin;
use Elementor\Modules\AtomicWidgets\Styles\Atomic_Styles_Manager;

class Atomic_Global_Styles {
	const STYLES_KEY = 'global';

	/**
	 * Cache_Validity path prefix for forward (parent → children) relation map.
	 * Stored as: ['global', 'related', $parent_post_id] => int[]
	 */
	const RELATED_KEY = 'related';

	/**
	 * Cache_Validity path prefix for reverse (child → parents) relation map.
	 * Stored as: ['global', 'related-reverse', $child_post_id] => int[]
	 */
	const RELATED_REVERSE_KEY = 'related-reverse';

	private Global_Classes_Relations $relations;

	public function __construct( Global_Classes_Relations $relations ) {
		$this->relations = $relations;
	}

	public function register_hooks() {
		add_action(
			'elementor/atomic-widgets/styles/register',
			fn( Atomic_Styles_Manager $styles_manager, array $post_ids ) => $this->register_styles( $styles_manager, $post_ids ),
			20,
			2
		);

		add_action(
			'elementor/global_classes/update',
			fn( string $context, array $changes ) => $this->invalidate_cache_for_updated_classes( $context, $changes ),
			10,
			2
		);

		add_action(
			'deleted_post',
			fn( $post_id ) => $this->on_kit_delete( $post_id )
		);

		add_action(
			'elementor/core/files/clear_cache',
			fn() => $this->invalidate_all_cache(),
		);

		add_filter(
			'elementor/atomic-widgets/settings/transformers/classes',
			fn( $value ) => $this->transform_classes_names( $value )
		);

		add_action(
			'elementor/document/after_save',
			fn( $document ) => $this->on_document_save( $document )
		);
	}

	private function register_styles( Atomic_Styles_Manager $styles_manager, array $post_ids ) {
		$context = $this->get_context();

		// Build parent→embedded map by applying the filter transitively for every
		// requested post id.  We guard against cycles with a visited set.
		$parent_to_embedded = [];
		$visited = [];

		$resolve = null;
		$resolve = function( int $pid ) use ( &$parent_to_embedded, &$visited, &$resolve ): array {
			if ( isset( $visited[ $pid ] ) ) {
				return [];
			}

			$visited[ $pid ] = true;

			/**
			 * Filter: elementor/document/related_posts
			 *
			 * Allows registering embedded post ids whose global classes should be
			 * merged into the parent post's global CSS file instead of producing
			 * a separate file per embedded post.
			 *
			 * @param int[]  $related_post_ids Accumulated child post ids (initially empty).
			 * @param int    $post_id          Parent post id being inspected.
			 * @return int[] Embedded post ids to merge into $post_id's global styles.
			 */
			$children = (array) apply_filters( 'elementor/document/related_posts', [], $pid );
			$children = array_values( array_unique( array_map( 'intval', array_filter( $children, 'is_numeric' ) ) ) );

			$all_descendants = $children;

			foreach ( $children as $child ) {
				$grandchildren = $resolve( $child );
				$all_descendants = array_values( array_unique( array_merge( $all_descendants, $grandchildren ) ) );
			}

			$parent_to_embedded[ $pid ] = $all_descendants;

			return $all_descendants;
		};

		foreach ( $post_ids as $post_id ) {
			$resolve( (int) $post_id );
		}

		// Persist the relation maps so that invalidation can look them up later.
		$this->persist_relation_maps( $parent_to_embedded, $context );

		// Compute all embedded ids (union of all children sets).
		$all_embedded = [];
		foreach ( $parent_to_embedded as $children ) {
			$all_embedded = array_merge( $all_embedded, $children );
		}
		$all_embedded = array_flip( array_unique( $all_embedded ) ); // use as set

		// Register exactly one global CSS entry per "main" (non-embedded) post id.
		foreach ( $post_ids as $post_id ) {
			$post_id_int = (int) $post_id;

			if ( isset( $all_embedded[ $post_id_int ] ) ) {
				// This post is embedded inside another rendered post – skip it so
				// it doesn't produce its own global-{id}-*.css file.
				continue;
			}

			$embedded_ids = $parent_to_embedded[ $post_id_int ] ?? [];
			$aggregate_ids = array_merge( [ $post_id_int ], $embedded_ids );

			$get_styles = fn() => $this->get_document_global_styles( $aggregate_ids, $context );

			$styles_manager->register(
				[ $this->get_cache_root_key(), $post_id, $context ],
				$get_styles
			);
		}
	}

	/**
	 * Returns the merged, ordered global class styles for one or more post ids.
	 *
	 * Previously accepted a single int; now accepts an array so that a parent
	 * post and all its embedded children can be aggregated into one CSS bundle.
	 *
	 * @param int[]  $post_ids One or more post ids whose classes should be merged.
	 * @param string $context  Frontend or preview context.
	 * @return array           Ordered style items ready for serialization.
	 */
	private function get_document_global_styles( array $post_ids, string $context ): array {
		$is_preview = Global_Classes_Repository::CONTEXT_PREVIEW === $context;

		// Union of class ids used across all supplied posts.
		$class_ids = [];
		foreach ( $post_ids as $pid ) {
			$ids = $this->relations->set_preview( $is_preview )->get_styles_by_post( (int) $pid );
			$class_ids = array_merge( $class_ids, $ids );
		}
		$class_ids = array_values( array_unique( $class_ids ) );

		if ( empty( $class_ids ) ) {
			return [];
		}

		$repository = Global_Classes_Repository::make();

		if ( $is_preview ) {
			$repository->set_preview( true );
		}

		$global_order = $repository->all_labels();
		$ordered_class_ids = array_values( array_intersect( array_keys( $global_order ), $class_ids ) );

		if ( empty( $ordered_class_ids ) ) {
			return [];
		}

		$items = $repository->get_by_ids( $ordered_class_ids );
		$reversed_order = array_reverse( $ordered_class_ids );

		$styles = [];

		foreach ( $reversed_order as $class_id ) {
			$item = $items[ $class_id ] ?? null;

			if ( ! $item ) {
				continue;
			}

			$resolved_label = $global_order[ $class_id ] ?? $item['label'];
			$item['id'] = $resolved_label;
			$item['label'] = $resolved_label;
			$styles[] = $item;
		}

		return $styles;
	}

	/**
	 * Persist the forward and reverse relation maps so that invalidation
	 * routines can find parent posts when a child is saved or when a class
	 * definition changes.
	 *
	 * @param array<int,int[]> $parent_to_embedded Forward map: parent_id => child_ids[].
	 */
	private function persist_relation_maps( array $parent_to_embedded, string $context ): void {
		$cache_validity = new Cache_Validity();

		// Build reverse map: child_id => parent_ids[].
		$reverse = [];
		foreach ( $parent_to_embedded as $parent => $children ) {
			foreach ( $children as $child ) {
				$reverse[ $child ][] = $parent;
			}
		}

		// Write the forward map.
		foreach ( $parent_to_embedded as $parent => $children ) {
			$cache_validity->validate( [
				$this->get_cache_root_key( self::RELATED_KEY ),
				$parent,
				$context
			], $children );
		}

		// Write the reverse map.
		foreach ( $reverse as $child => $parents ) {
			$existing_parents = $cache_validity->get_meta( [ 
				$this->get_cache_root_key( self::RELATED_REVERSE_KEY ), 
				$child, 
				$context
			] ) ?? [];

			$merged = array_values( array_unique( array_merge( (array) $existing_parents, $parents ) ) );

			$cache_validity->validate( [ 
				$this->get_cache_root_key( self::RELATED_REVERSE_KEY ), 
				$child, 
				$context 
			], $merged );
		}
	}

	/**
	 * Look up all parent post ids that declared $child_post_id as embedded.
	 *
	 * @param int $child_post_id
	 * @return int[]
	 */
	private function get_parent_post_ids( int $child_post_id, string $context ): array {
		$cache_validity = new Cache_Validity();

		$parents = $cache_validity->get_meta( [
			$this->get_cache_root_key( self::RELATED_REVERSE_KEY ),
			$child_post_id,
			$context
		] );

		if ( ! is_array( $parents ) ) {
			return [];
		}

		return array_values( array_unique( array_map( 'intval', $parents ) ) );
	}

	private function on_kit_delete( $post_id ) {
		if ( ! Plugin::$instance->kits_manager->is_kit( $post_id ) ) {
			return;
		}

		$this->invalidate_all_cache();
	}

	/**
	 * When an embedded post (component/template) is saved, its own CSS cache
	 * is cleared by Global_Classes_Relations.  We additionally need to clear
	 * the parent's global CSS so it is regenerated with the updated child content.
	 *
	 * We also clear the forward-map cache for the saved post so that the next
	 * render re-asks the filter for fresh child ids.
	 */
	private function on_document_save( $document ): void {
		$post_id = (int) $document->get_main_id();
		$context = $this->get_context();
		
		// Invalidate the forward relation entry for this post so it is rebuilt
		// on the next render.
		$cache_validity = new Cache_Validity();
		$cache_validity->invalidate( [ $this->get_cache_root_key( self::RELATED_KEY ), $post_id, $context ] );

		// Propagate to parents.
		foreach ( $this->get_parent_post_ids( $post_id, $context ) as $parent_id ) {
			$this->invalidate_document_cache( $parent_id, $context );

			// Also clear the parent's forward-map entry so it is rebuilt.
			$cache_validity->invalidate( [ $this->get_cache_root_key( self::RELATED_KEY ), $parent_id, $context ] );
		}
	}

	private function invalidate_cache_for_updated_classes( string $context, array $changes ) {
		if ( isset( $changes['order'] ) && $changes['order'] ) {
			$this->invalidate_all_cache( $context );

			return;
		}

		$affected = array_unique( array_merge(
			$changes['added'] ?? [],
			$changes['deleted'] ?? [],
			$changes['modified'] ?? []
		) );

		if ( empty( $affected ) ) {
			return;
		}

		$document_ids = [];
		$is_preview = Global_Classes_Repository::CONTEXT_PREVIEW === $context;

		if ( ! empty( $changes['affected_post_ids'] ) ) {
			foreach ( $changes['affected_post_ids'] as $post_id ) {
				$document_ids[ (int) $post_id ] = true;
			}
		}

		foreach ( $affected as $class_id ) {
			foreach ( $this->relations->set_preview( $is_preview )->get_posts_by_style( $class_id ) as $doc_id ) {
				$document_ids[ $doc_id ] = true;
			}
		}

		if ( empty( $document_ids ) ) {
			return;
		}

		// Also include parent posts of the directly-affected documents so that
		// aggregated CSS bundles are regenerated when a child class changes.
		$with_parents = $document_ids;
		foreach ( array_keys( $document_ids ) as $doc_id ) {
			foreach ( $this->get_parent_post_ids( (int) $doc_id, $context ) as $parent_id ) {
				$with_parents[ $parent_id ] = true;
			}
		}

		foreach ( array_keys( $with_parents ) as $post_id ) {
			$this->invalidate_document_cache( $post_id, $context );
		}
	}

	private function invalidate_document_cache( int $post_id, ?string $context = null ) {
		if ( empty( $context ) ) {
			do_action( 'elementor/atomic-widgets/styles/clear', [ $this->get_cache_root_key(), $post_id ] );
		} else {
			do_action( 'elementor/atomic-widgets/styles/clear', [ $this->get_cache_root_key(), $post_id, $context ] );
		}

		if ( empty( $context )  || Global_Classes_Repository::CONTEXT_FRONTEND === $context ) {
			do_action( 'elementor/atomic-widgets/styles/clear', [ $this->get_cache_root_key( self::RELATED_KEY ), $post_id ] );
			do_action( 'elementor/atomic-widgets/styles/clear', [ $this->get_cache_root_key( self::RELATED_REVERSE_KEY ), $post_id ] );
		}
	}

	private function invalidate_all_cache( ?string $context = null ) {
		if ( empty( $context ) || Global_Classes_Repository::CONTEXT_FRONTEND === $context ) {
			do_action( 'elementor/atomic-widgets/styles/clear', [ $this->get_cache_root_key() ] );

			// Also wipe the relation maps so they are rebuilt on next render.
			( new Cache_Validity() )->invalidate( [ $this->get_cache_root_key( self::RELATED_KEY ) ] );
			( new Cache_Validity() )->invalidate( [ $this->get_cache_root_key( self::RELATED_REVERSE_KEY ) ] );

			return;
		}

		do_action( 'elementor/atomic-widgets/styles/clear', [ $this->get_cache_root_key(), $context ] );
	}

	private function transform_classes_names( $ids ) {

		$labels = Global_Classes_Repository::make()
			->set_preview( $this->is_preview() )
			->all_labels();

		return array_map(
			static function( $id ) use ( $labels ) {
				return $labels[ $id ] ?? $id;
			},
			$ids
		);
	}

	private function get_context(): string {
		return $this->is_preview()
			? Global_Classes_Repository::CONTEXT_PREVIEW
			: Global_Classes_Repository::CONTEXT_FRONTEND;
	}

	private function is_preview(): bool {
		return Plugin::$instance->preview->is_editor_or_preview();
	}

	private function get_cache_root_key( string $key = null ): string {
		return $key ? self::STYLES_KEY . '_' . $key : self::STYLES_KEY;
	}
}
