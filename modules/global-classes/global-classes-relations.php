<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Base\Document;
use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Classes_Relations {
	const META_KEY_FRONTEND = '_elementor_used_global_class';
	const META_KEY_PREVIEW = '_elementor_used_global_class_preview';
	private string $context = self::META_KEY_FRONTEND;

	const META_KEY_USAGE_INDEXED_FRONTEND = '_elementor_global_class_usage_indexed';
	const META_KEY_USAGE_INDEXED_PREVIEW = '_elementor_global_class_usage_indexed_preview';
	private string $usage_indexed_context = self::META_KEY_USAGE_INDEXED_FRONTEND;

	const META_KEY_CLASS_RELATED_POSTS_FRONTEND = '_elementor_global_class_using_documents';
	const META_KEY_CLASS_RELATED_POSTS_PREVIEW = '_elementor_global_class_using_documents_preview';
	private string $related_posts_context = self::META_KEY_CLASS_RELATED_POSTS_FRONTEND;

	private const ATOMIC_GLOBAL_STYLES_KEY = 'global';

	public function context( string $context ): self {
		if ( Global_Classes_Repository::CONTEXT_PREVIEW === $context ) {
			$this->context = $this::META_KEY_PREVIEW;
			$this->related_posts_context = $this::META_KEY_CLASS_RELATED_POSTS_PREVIEW;
			$this->usage_indexed_context = $this::META_KEY_USAGE_INDEXED_PREVIEW;

			return $this;
		}

		$this->context = $this::META_KEY_FRONTEND;
		$this->usage_indexed_context = $this::META_KEY_USAGE_INDEXED_FRONTEND;
		$this->related_posts_context = $this::META_KEY_CLASS_RELATED_POSTS_FRONTEND;

		return $this;
	}

	public function register_hooks(): void {
		add_action(
			'elementor/document/after_save',
			fn( Document $document ) => $this->on_document_save( $document )
		);
	}

	public function collect_class_ids_from_post( int $post_id, ?array $restrict_to_ids = null ): array {
		$ids = $this->extract_class_ids_from_post( $post_id );

		if ( null === $restrict_to_ids ) {
			return $ids;
		}

		return array_values( array_intersect( $ids, $restrict_to_ids ) );
	}

	public function get_posts_by_style( string $style_id ): array {
		$from_index = $this->get_posts_from_reverse_index( $style_id );

		if ( ! empty( $from_index ) ) {
			return $from_index;
		}

		$post_ids = get_posts( [
			'fields' => 'ids',
			'meta_query' => [
				[
					'key' => $this->context,
					'value' => $style_id,
					'compare' => '=',
				],
			],
			'no_found_rows' => true,
			'post_status' => 'any',
			'post_type' => 'any',
			'posts_per_page' => -1,
			'update_post_meta_cache' => false,
		] );

		return array_map( 'intval', $post_ids );
	}

	public function get_styles_by_post( int $post_id ): array {
		$stored_ids = $this->get_stored_style_ids( $post_id );
		$live_ids = array_values( array_unique( $this->extract_class_ids_from_post( $post_id ) ) );
		$has_elementor_data = $this->document_has_elementor_data( $post_id );

		$normalize = static function ( array $ids ): string {
			$ids = array_values( array_unique( $ids ) );
			sort( $ids );

			return wp_json_encode( $ids );
		};

		if ( ! $has_elementor_data ) {
			if ( ! empty( $stored_ids ) ) {
				$this->mark_usage_indexed( $post_id );

				return $stored_ids;
			}

			if ( $this->is_usage_indexed( $post_id ) ) {
				return [];
			}

			$this->mark_usage_indexed( $post_id );

			return [];
		}

		if ( $normalize( $stored_ids ) !== $normalize( $live_ids ) ) {
			$this->set_styles_for_post( $post_id, $live_ids );

			return $live_ids;
		}

		if ( ! empty( $live_ids ) ) {
			$this->mark_usage_indexed( $post_id );
		}

		return $live_ids;
	}

	public function clear_post_styles( int $post_id ): void {
		$saved = $this->context;

		try {
			foreach (
				[
					Global_Classes_Repository::CONTEXT_FRONTEND,
					Global_Classes_Repository::CONTEXT_PREVIEW,
				] as $ctx
			) {
				$this->context = $ctx;
				$old_ids = $this->get_stored_style_ids( $post_id );

				delete_post_meta( $post_id, $this->context );
				delete_post_meta( $post_id, $this->usage_indexed_context );

				foreach ( $old_ids as $class_id ) {
					$this->unlink_post_from_class( $class_id, $post_id );
				}
			}
		} finally {
			$this->context = $saved;
		}
	}

	public function set_styles_for_post( int $post_id, array $style_ids ): void {
		$old_ids = $this->get_stored_style_ids( $post_id );

		foreach ( array_diff( $old_ids, $style_ids ) as $class_id ) {
			$this->unlink_post_from_class( $class_id, $post_id );
		}

		$this->replace_stored_style_ids( $post_id, $style_ids );

		foreach ( array_diff( $style_ids, $old_ids ) as $class_id ) {
			$this->link_post_to_class( $class_id, $post_id );
		}

		$this->mark_usage_indexed( $post_id );
	}

	private function get_posts_from_reverse_index( string $class_id ): array {
		$ids = $this->read_reverse_index_for_class( $class_id );

		if (
			! empty( $ids )
			|| Global_Classes_Repository::CONTEXT_PREVIEW !== $this->context
		) {
			return $ids;
		}

		return ( new self() )
			->context( Global_Classes_Repository::CONTEXT_FRONTEND )
			->read_reverse_index_for_class( $class_id );
	}

	private function read_reverse_index_for_class( string $class_id ): array {
		$post = Global_Class_Post::find_by_class_id( $class_id );

		if ( ! $post ) {
			return [];
		}

		$ids = get_post_meta( $post->get_post_id(), $this->related_posts_context, true );

		if ( ! is_array( $ids ) ) {
			return [];
		}

		return array_values( array_unique( array_map( 'intval', $ids ) ) );
	}

	private function link_post_to_class( string $class_id, int $document_post_id ): void {
		$post = Global_Class_Post::find_by_class_id( $class_id );

		if ( ! $post ) {
			return;
		}

		$cpt_id = $post->get_post_id();
		$ids = get_post_meta( $cpt_id, $this->related_posts_context, true );
		$ids = is_array( $ids ) ? array_map( 'intval', $ids ) : [];

		if ( in_array( $document_post_id, $ids, true ) ) {
			return;
		}

		$ids[] = $document_post_id;

		update_post_meta( $cpt_id, $this->related_posts_context, $ids );
	}

	private function unlink_post_from_class( string $class_id, int $document_post_id ): void {
		$post = Global_Class_Post::find_by_class_id( $class_id );

		if ( ! $post ) {
			return;
		}

		$cpt_id = $post->get_post_id();
		$ids = get_post_meta( $cpt_id, $this->related_posts_context, true );

		if ( ! is_array( $ids ) ) {
			return;
		}

		$ids = array_values(
			array_filter(
				array_map( 'intval', $ids ),
				fn( $id ) => $id !== $document_post_id
			)
		);

		update_post_meta( $cpt_id, $this->related_posts_context, $ids );
	}

	private function on_document_save( Document $document ): void {
		$post_id = $document->get_main_id();

		static $in_progress = [];
		if ( isset( $in_progress[ $post_id ] ) ) {
			return;
		}
		$in_progress[ $post_id ] = true;

		$saved = $this->context;

		try {
			$this->invalidate_document_styles_cache( $post_id );

			$this->context = Global_Classes_Repository::CONTEXT_FRONTEND;
			$this->set_styles_for_post( $post_id, $this->extract_class_ids_from_post( $post_id ) );

			$this->context = Global_Classes_Repository::CONTEXT_PREVIEW;
			$this->set_styles_for_post( $post_id, $this->extract_class_ids_from_post( $post_id ) );
		} finally {
			$this->context = $saved;
			unset( $in_progress[ $post_id ] );
		}
	}

	private function extract_class_ids_from_post( int $post_id ): array {
		$used_class_ids = [];

		$document = $this->get_document_for_post( $post_id );

		if ( ! $document ) {
			return [];
		}

		$elements_data = $document->get_elements_data();

		if ( empty( $elements_data ) ) {
			return [];
		}

		Plugin::$instance->db->iterate_data( $elements_data, function ( $element_data ) use ( &$used_class_ids ) {
			$used_class_ids = array_merge(
				$used_class_ids,
				Atomic_Elements_Utils::collect_class_ids_from_element_data( $element_data )
			);
		} );

		return array_values( array_unique( $used_class_ids ) );
	}

	private function get_stored_style_ids( int $post_id ): array {
		$meta_values = get_post_meta( $post_id, $this->context, false );

		if ( ! is_array( $meta_values ) ) {
			return [];
		}

		return array_values( array_unique( $meta_values ) );
	}

	private function replace_stored_style_ids( int $post_id, array $style_ids ): void {
		delete_post_meta( $post_id, $this->context );

		$unique_ids = array_unique( $style_ids );

		foreach ( $unique_ids as $class_id ) {
			add_post_meta( $post_id, $this->context, $class_id );
		}
	}

	private function is_usage_indexed( int $post_id ): bool {
		return '1' === get_post_meta( $post_id, $this->usage_indexed_context, true );
	}

	private function mark_usage_indexed( int $post_id ): void {
		update_post_meta( $post_id, $this->usage_indexed_context, '1' );
	}

	private function invalidate_document_styles_cache( int $post_id ): void {
		do_action( 'elementor/atomic-widgets/styles/clear', [ self::ATOMIC_GLOBAL_STYLES_KEY, $post_id ] );
		do_action(
			'elementor/atomic-widgets/styles/clear',
			[ self::ATOMIC_GLOBAL_STYLES_KEY, $post_id, Global_Classes_Repository::CONTEXT_PREVIEW ]
		);
	}

	private function document_has_elementor_data( int $post_id ): bool {
		$document = $this->get_document_for_post( $post_id );

		if ( ! $document ) {
			return false;
		}

		$elements_data = $document->get_elements_data();

		return ! empty( $elements_data );
	}

	private function get_document_for_post( int $post_id ): ?Document {
		$documents = Plugin::$instance->documents;

		if ( Global_Classes_Repository::CONTEXT_FRONTEND === $this->context ) {
			$document = $documents->get( $post_id );

			return $document ?: null;
		}

		$document = $documents->get_doc_or_auto_save( $post_id, get_current_user_id() );

		if ( ! $document ) {
			$document = $documents->get( $post_id );
		}

		return $document ?: null;
	}
}
