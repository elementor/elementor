<?php
namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\DesignSystemSync\Classes\Global_Classes_Sync_Map;
use Elementor\Modules\GlobalClasses\Concerns\Has_Kit_Dependency;
use Elementor\Modules\GlobalClasses\Concerns\Has_Preview_Context;
use Elementor\Modules\GlobalClasses\Utils\Global_Class_Data_Normalizer;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Classes_Repository {
	use Has_Kit_Dependency;
	use Has_Preview_Context;

	const META_KEY_FRONTEND = '_elementor_global_classes';
	const META_KEY_PREVIEW = '_elementor_global_classes_preview';

	const CONTEXT_FRONTEND = 'frontend';
	const CONTEXT_PREVIEW = 'preview';

	const READ_BATCH_SIZE = 100;
	const PERSIST_BATCH_SIZE = 100;

	protected array $context_keys = [
		'event' => [
			'frontend' => self::CONTEXT_FRONTEND,
			'preview' => self::CONTEXT_PREVIEW,
		],
		'meta_key' => [
			'frontend' => self::META_KEY_FRONTEND,
			'preview' => self::META_KEY_PREVIEW,
		],
	];

	private ?Global_Classes $cache = null;

	public function __construct( ?Kit $kit = null ) {
		if ( null !== $kit ) {
			$this->set_kit( $kit );
		}
	}

	public static function make( ?Kit $kit = null ): Global_Classes_Repository {
		return new self( $kit );
	}

	protected function on_preview_change(): void {
		$this->cache = null;
	}

	/**
	 * This method may be too heavy to use
	 * Be mindful as this call would cause the server to freeze for as much time as needed until it fetches
	 * all global classes
	 */
	public function all( bool $force = false ): Global_Classes {
		if ( ! $force && null !== $this->cache ) {
			return $this->cache;
		}

		$this->cache = $this->all_from_posts();

		return $this->cache;
	}

	public function all_labels(): array {
		return $this->labels()->get_ordered_labels();
	}

	public function get_order(): array {
		return Global_Classes_Order::make( $this->get_kit() )->get_order();
	}

	public function update_order_and_labels( array $order, array $new_labels ): void {
		Global_Classes_Order::make( $this->get_kit() )->set_order( $order );

		$labels = $this->labels();
		$existing_labels = $labels->get_labels();

		foreach ( $new_labels as $id => $label ) {
			$existing_labels[ $id ] = $label;
		}

		$labels->set_labels( $existing_labels );

		$this->cache = null;
	}

	private function labels(): Global_Classes_Labels {
		return Global_Classes_Labels::make( $this->get_kit() )->set_preview( $this->is_preview() );
	}

	public function get( string $class_id ): ?array {
		$post = Global_Class_Post::find_by_class_id( $class_id, $this->is_preview() );

		return $post ? $post->to_array() : null;
	}

	public function get_by_ids( array $class_ids ): array {
		if ( empty( $class_ids ) ) {
			return [];
		}

		$post_ids = Global_Classes_Post_IDs::make( $this->get_kit() )->get_post_ids( $class_ids );
		$items = [];

		foreach ( $post_ids as $class_id => $post_id ) {
			$post = Global_Class_Post::from_post_id( $post_id, $this->is_preview() );

			if ( $post ) {
				$items[ $class_id ] = $post->to_array();
			}
		}

		return $items;
	}

	public function apply_changes( array $touched_items, array $changes, array $order ): void {
		$labels = $this->labels();
		$before = $labels->get_labels();
		$is_preview = $this->is_preview();
		$to_delete = $changes['deleted'] ?? [];
		$to_create = $changes['added'] ?? [];
		$to_update = $changes['modified'] ?? [];
		$order_changed = isset( $changes['order'] ) && $changes['order'];

		$final_label_map = [];
		foreach ( $order as $id ) {
			if ( isset( $touched_items[ $id ] ) ) {
				$final_label_map[ $id ] = $touched_items[ $id ]['label'];
			} elseif ( isset( $before[ $id ] ) ) {
				$final_label_map[ $id ] = $before[ $id ];
			}
		}

		$this->persist_class_batch_mutations( $to_delete, $to_create, $to_update, $touched_items, $is_preview );

		$classes_order = Global_Classes_Order::make( $this->get_kit() );
		$classes_order->set_order( $order );
		$labels->set_labels( $final_label_map );

		if ( ! $is_preview ) {
			Global_Classes_Sync_Map::make( $this->get_kit() )->apply_changes( $touched_items, $to_delete );

			$this->bulk_clear_preview_meta( array_values( $to_update ) );
			$this->clear_preview_labels_for_ids( array_merge(
				array_values( $to_create ),
				array_values( $to_update ),
				array_values( $to_delete )
			) );
		}

		$this->cache = null;
		$this->flush_runtime_cache();

		do_action( 'elementor/global_classes/update', $this->get_context_key( 'event' ), [
			'added' => $to_create,
			'deleted' => $to_delete,
			'modified' => $to_update,
			'order' => $order_changed,
		] );
	}

	public function each_item( callable $cb, bool $skip_migration = false, int $batch_size = self::READ_BATCH_SIZE ): void {
		$order = Global_Classes_Order::make( $this->get_kit() )->get_order();

		if ( empty( $order ) ) {
			return;
		}

		foreach ( array_chunk( $order, $batch_size ) as $chunk ) {
			foreach ( $this->iterate_class_posts_for_ids( $chunk ) as $class_post ) {
				$cb( $class_post->to_array( $skip_migration ) );
			}
		}
	}

	public function put( array $items, array $order ) {
		$current_ids = Global_Classes_Order::make( $this->get_kit() )->get_order();

		$new_ids = array_keys( $items );

		$current_order_string = implode( ';', $current_ids );

		$changes = [
			'added' => array_values( array_diff( $new_ids, $current_ids ) ),
			'deleted' => array_values( array_diff( $current_ids, $new_ids ) ),
			'modified' => array_values( array_intersect( $new_ids, $current_ids ) ),
			'order' => implode( ';', $order ) !== $current_order_string,
		];

		$this->put_to_posts( $items, $order, $current_ids );

		$this->cache = null;

		do_action( 'elementor/global_classes/update', $this->get_context_key( 'event' ), $changes );
	}

	private function all_from_posts(): Global_Classes {
		$classes_order = Global_Classes_Order::make( $this->get_kit() );
		$order = $classes_order->get_order();

		if ( empty( $order ) ) {
			return Global_Classes::make( [], [] );
		}

		$items = [];

		foreach ( $this->iterate_class_posts_for_ids( $order ) as $class_post ) {
			$class_data = $class_post->to_array();
			$items[ $class_data['id'] ] = $class_data;
		}

		$order = Global_Classes_Parser::sanitize_order( $items, $order );

		return Global_Classes::make( $items, $order );
	}

	private function put_to_posts( array $items, array $order, array $current_ids ): void {
		$is_preview = $this->is_preview();
		$new_ids = array_keys( $items );

		$to_delete = array_diff( $current_ids, $new_ids );
		$to_create = array_diff( $new_ids, $current_ids );
		$to_update = array_intersect( $new_ids, $current_ids );

		$this->persist_class_batch_mutations( $to_delete, $to_create, $to_update, $items, $is_preview );

		$classes_order = Global_Classes_Order::make( $this->get_kit() );
		$classes_order->set_order( $order );

		$label_map = [];
		foreach ( $order as $id ) {
			if ( isset( $items[ $id ]['label'] ) ) {
				$label_map[ $id ] = $items[ $id ]['label'];
			}
		}
		$this->labels()->set_labels( $label_map );

		if ( ! $is_preview ) {
			$touched_ids = array_merge( array_values( $to_create ), array_values( $to_update ) );
			$touched_items = array_intersect_key(
				$items,
				array_flip( $touched_ids )
			);
			Global_Classes_Sync_Map::make( $this->get_kit() )->apply_changes( $touched_items, array_values( $to_delete ) );

			$this->bulk_clear_preview_meta( array_values( $to_update ) );
			$this->clear_preview_labels_for_ids( array_merge(
				array_values( $to_create ),
				array_values( $to_update ),
				array_values( $to_delete )
			) );
		}
	}

	private function iterate_class_posts_for_ids( array $class_ids ): \Generator {
		foreach ( array_chunk( $class_ids, self::READ_BATCH_SIZE ) as $chunk ) {
			$posts = get_posts( [
				'post_type' => Global_Class_Post_Type::CPT,
				'post_status' => 'publish',
				'posts_per_page' => -1,
				'meta_query' => [
					[
						'key' => Global_Class_Post::META_KEY_ID,
						'value' => $chunk,
						'compare' => 'IN',
					],
				],
			] );

			foreach ( $posts as $post ) {
				yield Global_Class_Post::from_post( $post, $this->is_preview() );
				clean_post_cache( $post->ID );
			}
			unset( $posts );
			$this->flush_runtime_cache();
		}
	}

	private function persist_class_batch_mutations(
		array $to_delete,
		array $to_create,
		array $to_update,
		array $items_by_id,
		bool $is_preview
	): void {
		$relations = new Global_Classes_Relations();
		$post_ids_map = Global_Classes_Post_IDs::make( $this->get_kit() );

		$ids_to_resolve = array_values( array_merge(
			array_values( $to_delete ),
			array_values( $to_update ),
			array_values( $to_create )
		) );
		$post_ids = $post_ids_map->get_post_ids( $ids_to_resolve );

		$this->each_class_id_batch(
			array_values( $to_delete ),
			function ( string $class_id ) use ( $is_preview, $relations, $post_ids ) {
				$post = isset( $post_ids[ $class_id ] )
					? Global_Class_Post::from_post_id( $post_ids[ $class_id ], false )
					: null;

				if ( ! $post ) {
					return;
				}

				if ( $is_preview ) {
					$post->set_preview( true );
					$post->update_data( [] );
					clean_post_cache( $post->get_post_id() );
				} else {
					$relations->clear_class_relations( $class_id );
					$post->delete();
				}
			}
		);

		$this->each_class_id_batch( $to_create, function ( string $class_id ) use ( $items_by_id, $is_preview, $post_ids, $post_ids_map ) {
			if ( ! isset( $items_by_id[ $class_id ] ) ) {
				return;
			}

			$item = $items_by_id[ $class_id ];
			$data = Global_Class_Data_Normalizer::normalize_style_fields( $item );
			$kit = $this->get_kit();
			$existing_post_id = $post_ids[ $class_id ] ?? null;
			$existing_post = $existing_post_id ? Global_Class_Post::from_post_id( $existing_post_id, $is_preview ) : null;

			if ( $existing_post ) {
				$existing_post->update_data( $data );

				if ( ! $is_preview ) {
					$existing_post->update_label( $item['label'] );
				}

				clean_post_cache( $existing_post->get_post_id() );

				return;
			}

			$created = Global_Class_Post::create( $class_id, $item['label'], $data, $kit );

			if ( $created ) {
				$post_ids_map->set( $class_id, $created->get_post_id() );
				clean_post_cache( $created->get_post_id() );
			}
		} );

		$this->each_class_id_batch(
			$to_update,
			function ( string $class_id ) use ( $items_by_id, $is_preview, $post_ids ) {
				if ( ! isset( $items_by_id[ $class_id ] ) || ! isset( $post_ids[ $class_id ] ) ) {
					return;
				}

				$item = $items_by_id[ $class_id ];
				$post = Global_Class_Post::from_post_id( $post_ids[ $class_id ], $is_preview );

				if ( ! $post ) {
					return;
				}

				$data = Global_Class_Data_Normalizer::normalize_style_fields( $item );
				$post->update_data( $data );

				if ( ! $is_preview ) {
					$post->update_label( $item['label'] );
				}

				clean_post_cache( $post->get_post_id() );
			}
		);
	}

	public function delete_all(): void {
		$order = $this->get_order();

		$this->each_class_id_batch( $order, function ( string $class_id ) {
			$post = Global_Class_Post::find_by_class_id( $class_id );

			if ( $post ) {
				$post->delete();
			}
		} );

		Global_Classes_Order::make( $this->get_kit() )->set_order( [] );
		$this->labels()->set_labels( [] );
	}

	private function clear_preview_labels_for_ids( array $class_ids ): void {
		if ( empty( $class_ids ) ) {
			return;
		}

		$preview_labels = Global_Classes_Labels::make( $this->get_kit() )->set_preview( true );
		$labels_map = $preview_labels->get_labels();

		if ( empty( $labels_map ) ) {
			return;
		}

		$ids_to_remove = array_intersect( array_unique( $class_ids ), array_keys( $labels_map ) );

		if ( empty( $ids_to_remove ) ) {
			return;
		}

		foreach ( $ids_to_remove as $id ) {
			unset( $labels_map[ $id ] );
		}

		$preview_labels->set_labels( $labels_map );
	}

	private function bulk_clear_preview_meta( array $class_ids ): void {
		if ( empty( $class_ids ) ) {
			return;
		}

		$post_ids_map = Global_Classes_Post_IDs::make( $this->get_kit() );

		foreach ( array_chunk( $class_ids, self::PERSIST_BATCH_SIZE ) as $chunk ) {
			$post_ids = $post_ids_map->get_post_ids( $chunk );

			foreach ( $post_ids as $post_id ) {
				delete_post_meta( $post_id, Global_Class_Post::META_KEY_DATA_PREVIEW );
				clean_post_cache( $post_id );
			}

			$this->flush_runtime_cache();
		}
	}

	private function each_class_id_batch( $class_ids, callable $callback, int $batch_size = self::PERSIST_BATCH_SIZE ): void {
		$class_ids = is_array( $class_ids ) ? $class_ids : iterator_to_array( $class_ids, false );
		foreach ( array_chunk( array_values( $class_ids ), $batch_size ) as $batch ) {
			foreach ( $batch as $class_id ) {
				$callback( $class_id );
			}
			$this->flush_runtime_cache();
		}
	}

	private function flush_runtime_cache(): void {
		if ( function_exists( 'wp_cache_flush_runtime' ) ) {
			wp_cache_flush_runtime();
		}
	}
}
