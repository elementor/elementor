<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Plugin;
use Elementor\Modules\AtomicWidgets\Styles\Atomic_Styles_Manager;

class Atomic_Global_Styles {
	const STYLES_KEY = 'global';

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
			fn( $post_id ) => $this->on_post_delete( $post_id )
		);

		add_action(
			'elementor/core/files/clear_cache',
			fn() => $this->invalidate_all_cache(),
		);

		add_filter(
			'elementor/atomic-widgets/settings/transformers/classes',
			fn( $value ) => $this->transform_classes_names( $value )
		);
	}

	private function register_styles( Atomic_Styles_Manager $styles_manager, array $post_ids ) {
		$context = $this->get_context();

		foreach ( $post_ids as $post_id ) {
			$get_styles = fn() => $this->get_document_global_styles( $post_id, $context );

			$styles_manager->register(
				[ self::STYLES_KEY, $post_id, $context ],
				$get_styles
			);
		}
	}

	private function get_document_global_styles( int $post_id, string $context ): array {
		$class_ids = $this->relations->get_styles_by_post( $post_id );

		if ( empty( $class_ids ) ) {
			return [];
		}

		$repository = Global_Classes_Repository::make()->context( $context );
		$all_classes = $repository->all();
		$items = $all_classes->get_items();

		$styles = [];

		$ordered_class_ids = array_intersect( $all_classes->get_order()->all(), $class_ids );
		$reversed_order = array_reverse( $ordered_class_ids );

		foreach ( $reversed_order as $class_id ) {
			$item = $items->get( $class_id );

			if ( ! $item ) {
				continue;
			}

			$item['id'] = $item['label'];
			$styles[] = $item;
		}

		return $styles;
	}

	private function on_post_delete( $post_id ) {
		if ( Global_Class_Post_Type::CPT === get_post_type( $post_id ) ) {
			$class_id = get_post_meta( $post_id, Global_Class_Post::META_KEY_ID, true );

			if ( $class_id ) {
				$this->invalidate_cache_for_class( $class_id );
			}

			return;
		}

		if ( Plugin::$instance->kits_manager->is_kit( $post_id ) ) {
			$this->invalidate_all_cache();
		}
	}

	private function invalidate_cache_for_updated_classes( string $context, array $changes ) {
		$affected = array_unique( array_merge(
			$changes['added'] ?? [],
			$changes['deleted'] ?? [],
			$changes['modified'] ?? []
		) );

		if ( empty( $affected ) ) {
			return;
		}

		$document_ids = [];

		foreach ( $affected as $class_id ) {
			foreach ( $this->relations->get_posts_by_style( $class_id ) as $doc_id ) {
				$document_ids[ $doc_id ] = true;
			}
		}

		if ( empty( $document_ids ) ) {
			$this->invalidate_all_cache( $context );

			return;
		}

		foreach ( array_keys( $document_ids ) as $post_id ) {
			$this->invalidate_document_cache( $post_id, $context );
		}
	}

	private function invalidate_cache_for_class( string $class_id, ?string $context = null ) {
		$document_ids = $this->relations->get_posts_by_style( $class_id );

		foreach ( $document_ids as $doc_id ) {
			$this->invalidate_document_cache( $doc_id, $context );
		}
	}

	private function invalidate_document_cache( int $post_id, ?string $context = null ) {
		if ( empty( $context ) ) {
			do_action( 'elementor/atomic-widgets/styles/clear', [ self::STYLES_KEY, $post_id ] );
		} else {
			do_action( 'elementor/atomic-widgets/styles/clear', [ self::STYLES_KEY, $post_id, $context ] );
		}
	}

	private function invalidate_all_cache( ?string $context = null ) {
		if ( empty( $context ) || Global_Classes_Repository::CONTEXT_FRONTEND === $context ) {
			do_action( 'elementor/atomic-widgets/styles/clear', [ self::STYLES_KEY ] );

			return;
		}

		do_action( 'elementor/atomic-widgets/styles/clear', [ self::STYLES_KEY, $context ] );
	}

	private function transform_classes_names( $ids ) {
		$context = $this->get_context();

		$classes = Global_Classes_Repository::make()
			->context( $context )
			->all()
			->get_items();

		return array_map(
			function( $id ) use ( $classes ) {
				$class = $classes->get( $id );

				return $class ? $class['label'] : $id;
			},
			$ids
		);
	}

	private function get_context(): string {
		return Plugin::$instance->preview->is_editor_or_preview()
			? Global_Classes_Repository::CONTEXT_PREVIEW
			: Global_Classes_Repository::CONTEXT_FRONTEND;
	}
}
