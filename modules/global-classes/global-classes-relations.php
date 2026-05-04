<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Base\Document;
use Elementor\Modules\GlobalClasses\Atomic_Global_Styles;
use Elementor\Modules\GlobalClasses\Concerns\Has_Preview_Context;
use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Classes_Relations {
	use Has_Preview_Context;

	const META_KEY_FRONTEND = '_elementor_used_global_class';
	const META_KEY_PREVIEW = '_elementor_used_global_class_preview';

	const META_KEY_USAGE_INDEXED_FRONTEND = '_elementor_global_class_usage_indexed';
	const META_KEY_USAGE_INDEXED_PREVIEW = '_elementor_global_class_usage_indexed_preview';

	const META_KEY_CLASS_RELATED_POSTS_FRONTEND = '_elementor_global_class_using_documents';
	const META_KEY_CLASS_RELATED_POSTS_PREVIEW = '_elementor_global_class_using_documents_preview';

	protected array $context_keys = [
		'used_classes' => [
			'frontend' => self::META_KEY_FRONTEND,
			'preview' => self::META_KEY_PREVIEW,
		],
		'usage_indexed' => [
			'frontend' => self::META_KEY_USAGE_INDEXED_FRONTEND,
			'preview' => self::META_KEY_USAGE_INDEXED_PREVIEW,
		],
		'related_posts' => [
			'frontend' => self::META_KEY_CLASS_RELATED_POSTS_FRONTEND,
			'preview' => self::META_KEY_CLASS_RELATED_POSTS_PREVIEW,
		],
	];

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
					'key' => $this->get_context_key( 'used_classes' ),
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
		$saved_preview = $this->is_preview();

		try {
			foreach ( [ false, true ] as $preview_flag ) {
				$this->set_preview( $preview_flag );
				$old_ids = $this->get_stored_style_ids( $post_id );

				delete_post_meta( $post_id, $this->get_context_key( 'used_classes' ) );
				delete_post_meta( $post_id, $this->get_context_key( 'usage_indexed' ) );

				foreach ( $old_ids as $class_id ) {
					$this->unlink_post_from_class( $class_id, $post_id );
				}
			}
		} finally {
			$this->set_preview( $saved_preview );
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
			|| Global_Classes_Repository::CONTEXT_PREVIEW !== $this->get_context_key( 'used_classes' )
		) {
			return $ids;
		}

		return ( new self() )->read_reverse_index_for_class( $class_id );
	}

	private function read_reverse_index_for_class( string $class_id ): array {
		$post = Global_Class_Post::find_by_class_id( $class_id );

		if ( ! $post ) {
			return [];
		}

		$ids = get_post_meta( $post->get_post_id(), $this->get_context_key( 'related_posts' ), true );

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
		$ids = get_post_meta( $cpt_id, $this->get_context_key( 'related_posts' ), true );
		$ids = is_array( $ids ) ? array_map( 'intval', $ids ) : [];

		if ( in_array( $document_post_id, $ids, true ) ) {
			return;
		}

		$ids[] = $document_post_id;

		update_post_meta( $cpt_id, $this->get_context_key( 'related_posts' ), $ids );
	}

	private function unlink_post_from_class( string $class_id, int $document_post_id ): void {
		$post = Global_Class_Post::find_by_class_id( $class_id );

		if ( ! $post ) {
			return;
		}

		$cpt_id = $post->get_post_id();
		$ids = get_post_meta( $cpt_id, $this->get_context_key( 'related_posts' ), true );

		if ( ! is_array( $ids ) ) {
			return;
		}

		$ids = array_values(
			array_filter(
				array_map( 'intval', $ids ),
				fn( $id ) => $id !== $document_post_id
			)
		);

		update_post_meta( $cpt_id, $this->get_context_key( 'related_posts' ), $ids );
	}

	private function on_document_save( Document $document ): void {
		$post_id = $document->get_main_id();

		static $in_progress = [];
		if ( isset( $in_progress[ $post_id ] ) ) {
			return;
		}
		$in_progress[ $post_id ] = true;

		$saved_preview = $this->is_preview();

		try {
			$this->invalidate_document_styles_cache( $post_id );

			$this->set_preview( false );
			$this->set_styles_for_post( $post_id, $this->extract_class_ids_from_post( $post_id ) );

			$this->set_preview( true );
			$this->set_styles_for_post( $post_id, $this->extract_class_ids_from_post( $post_id ) );
		} finally {
			$this->set_preview( $saved_preview );
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
		$meta_values = get_post_meta( $post_id, $this->get_context_key( 'used_classes' ), false );

		if ( ! is_array( $meta_values ) ) {
			return [];
		}

		return array_values( array_unique( $meta_values ) );
	}

	private function replace_stored_style_ids( int $post_id, array $style_ids ): void {
		delete_post_meta( $post_id, $this->get_context_key( 'used_classes' ) );

		$unique_ids = array_unique( $style_ids );

		foreach ( $unique_ids as $class_id ) {
			add_post_meta( $post_id, $this->get_context_key( 'used_classes' ), $class_id );
		}
	}

	public static function delete_all_relations(): void {
		global $wpdb;

		$meta_keys = [
			self::META_KEY_FRONTEND,
			self::META_KEY_PREVIEW,
			self::META_KEY_USAGE_INDEXED_FRONTEND,
			self::META_KEY_USAGE_INDEXED_PREVIEW,
			self::META_KEY_CLASS_RELATED_POSTS_FRONTEND,
			self::META_KEY_CLASS_RELATED_POSTS_PREVIEW,
		];

		$placeholders = implode( ',', array_fill( 0, count( $meta_keys ), '%s' ) );

		$wpdb->query(
			$wpdb->prepare(
				"DELETE FROM {$wpdb->postmeta} WHERE meta_key IN ($placeholders)",
				...$meta_keys
			)
		);
	}

	private function is_usage_indexed( int $post_id ): bool {
		return '1' === get_post_meta( $post_id, $this->get_context_key( 'usage_indexed' ), true );
	}

	private function mark_usage_indexed( int $post_id ): void {
		update_post_meta( $post_id, $this->get_context_key( 'usage_indexed' ), '1' );
	}

	private function invalidate_document_styles_cache( int $post_id ): void {
		do_action( 'elementor/atomic-widgets/styles/clear', [ Atomic_Global_Styles::STYLES_KEY, $post_id ] );
		do_action(
			'elementor/atomic-widgets/styles/clear',
			[ Atomic_Global_Styles::STYLES_KEY, $post_id, Global_Classes_Repository::CONTEXT_PREVIEW ]
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

		if ( ! $this->is_preview() ) {
			$document = $documents->get( $post_id );

			if ( ! $document ) {
				return null;
			}

			return $document ?? null;
		}

		$document = $documents->get_doc_or_auto_save( $post_id, get_current_user_id() );

		if ( ! $document ) {
			$document = $documents->get( $post_id );
		}

		return $document ?? null;
	}
}
