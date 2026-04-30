<?php
namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Classes_Repository {

	const META_KEY_FRONTEND = '_elementor_global_classes';
	const META_KEY_PREVIEW = '_elementor_global_classes_preview';

	const CONTEXT_FRONTEND = 'frontend';
	const CONTEXT_PREVIEW = 'preview';

	const READ_BATCH_SIZE = 100;
	const PERSIST_BATCH_SIZE = 100;

	private string $context = self::CONTEXT_FRONTEND;

	private ?Global_Classes $cache = null;

	private ?Kit $kit = null;

	public function __construct( ?Kit $kit = null ) {
		$this->kit = $kit ?? Plugin::$instance->kits_manager->get_active_kit();
	}

	public static function make( ?Kit $kit = null ): Global_Classes_Repository {
		return new self( $kit );
	}

	public function context( string $context ): self {
		$this->context = $context;
		$this->cache = null;

		return $this;
	}

	public function all( bool $force = false ): Global_Classes {
		if ( ! $force && null !== $this->cache ) {
			return $this->cache;
		}

		$this->cache = $this->all_from_posts();

		return $this->cache;
	}

	public function get_order(): array {
		return Global_Classes_Order::make( $this->kit )->get_order();
	}

	public function all_labels(): array {
		return Global_Classes_Labels::make( $this->kit )
			->context( $this->context )
			->get_ordered_labels();
	}

	public function update_order_and_labels( array $order, array $new_labels ): void {
		Global_Classes_Order::make( $this->kit )->set_order( $order );

		$labels = Global_Classes_Labels::make( $this->kit )->context( $this->context );
		$existing_labels = $labels->get_labels();

		foreach ( $new_labels as $id => $label ) {
			$existing_labels[ $id ] = $label;
		}

		$labels->set_labels( $existing_labels );

		$this->cache = null;
	}

	public function get( string $class_id ): ?array {
		$post = Global_Class_Post::find_by_class_id( $class_id, $this->context );

		return $post ? $post->to_array() : null;
	}

	public function get_by_ids( array $class_ids ): array {
		if ( empty( $class_ids ) ) {
			return [];
		}

		$items = [];

		foreach ( $this->iterate_class_posts_for_ids( $class_ids ) as $class_post ) {
			$class_data = $class_post->to_array();
			$items[ $class_data['id'] ] = $class_data;
		}

		return $items;
	}

	public function apply_changes( array $touched_items, array $changes, array $order ): void {
		$labels = Global_Classes_Labels::make( $this->kit )->context( $this->context );
		$before = $labels->get_labels();
		$is_preview = self::CONTEXT_PREVIEW === $this->context;
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

		$classes_order = Global_Classes_Order::make( $this->kit );
		$classes_order->set_order( $order );
		$labels->set_labels( $final_label_map );

		if ( ! $is_preview ) {
			$ids_to_clear_preview = array_values( array_diff( $order, $to_create ) );
			$this->each_class_id_batch( $ids_to_clear_preview, function ( string $class_id ) {
				$post = Global_Class_Post::find_by_class_id( $class_id, self::CONTEXT_FRONTEND );
				if ( $post ) {
					delete_post_meta( $post->get_post_id(), Global_Class_Post::META_KEY_DATA_PREVIEW );
					clean_post_cache( $post->get_post_id() );
				}
			} );
		}

		$this->cache = null;
		$this->flush_runtime_cache();

		do_action( 'elementor/global_classes/update', $this->context, [
			'added' => $to_create,
			'deleted' => $to_delete,
			'modified' => $to_update,
			'order' => $order_changed,
		] );
	}

	public function each_item( callable $cb, int $batch_size = self::READ_BATCH_SIZE ): void {
		$order = Global_Classes_Order::make( $this->kit )->get_order();

		if ( empty( $order ) ) {
			return;
		}

		foreach ( array_chunk( $order, $batch_size ) as $chunk ) {
			foreach ( $this->iterate_class_posts_for_ids( $chunk ) as $class_post ) {
				$cb( $class_post->to_array() );
			}
		}
	}

	public function put( array $items, array $order ) {
		$current_value = $this->all()->get();

		$updated_value = [
			'items' => $items,
			'order' => $order,
		];

		if ( $current_value === $updated_value ) {
			return;
		}

		$current_ids = array_keys( $current_value['items'] );
		$new_ids = array_keys( $items );

		$changes = [
			'added' => array_values( array_diff( $new_ids, $current_ids ) ),
			'deleted' => array_values( array_diff( $current_ids, $new_ids ) ),
			'modified' => array_values( array_filter(
				array_intersect( $new_ids, $current_ids ),
				fn( $id ) => $items[ $id ] !== $current_value['items'][ $id ]
			) ),
			'order' => implode( ';', $current_value['order'] ?? [] ) !== implode( ';', $order ),
		];

		$this->put_to_posts( $items, $order, $current_value );

		$this->cache = null;

		do_action( 'elementor/global_classes/update', $this->context, $changes );
	}

	private function all_from_posts(): Global_Classes {
		$classes_order = Global_Classes_Order::make( $this->kit );
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

	private function put_to_posts( array $items, array $order, array $current_value ): void {
		$is_preview = self::CONTEXT_PREVIEW === $this->context;
		$current_ids = array_keys( $current_value['items'] );
		$new_ids = array_keys( $items );

		$to_delete = array_diff( $current_ids, $new_ids );
		$to_create = array_diff( $new_ids, $current_ids );
		$to_update = array_intersect( $new_ids, $current_ids );

		$this->persist_class_batch_mutations( $to_delete, $to_create, $to_update, $items, $is_preview );

		$classes_order = Global_Classes_Order::make( $this->kit );
		$classes_order->set_order( $order );

		$label_map = [];
		foreach ( $order as $id ) {
			if ( isset( $items[ $id ]['label'] ) ) {
				$label_map[ $id ] = $items[ $id ]['label'];
			}
		}
		Global_Classes_Labels::make( $this->kit )
			->context( $this->context )
			->set_labels( $label_map );

		if ( ! $is_preview ) {
			$existing_ids_to_clear = array_values( array_intersect( $new_ids, $current_ids ) );
			$this->each_class_id_batch( $existing_ids_to_clear, function ( string $class_id ) {
				$post = Global_Class_Post::find_by_class_id( $class_id, self::CONTEXT_FRONTEND );
				if ( $post ) {
					delete_post_meta( $post->get_post_id(), Global_Class_Post::META_KEY_DATA_PREVIEW );
					clean_post_cache( $post->get_post_id() );
				}
			} );
		}
	}

	public function add_class( string $class_id, string $label, array $data, array $order ): void {
		$t = microtime( true );
		$created = Global_Class_Post::create( $class_id, $label, $data );
		$t_create = microtime( true ) - $t;

		if ( $created ) {
			clean_post_cache( $created->get_post_id() );
			$t = microtime( true );
			

			$classes_order = Global_Classes_Order::make( $this->kit );
			$classes_order->set_order( $order );
	
			$classes_labels = Global_Classes_Labels::make( $this->kit );
			$existing_labels = $classes_labels->get_labels();
			$existing_labels[ $class_id ] = $label;
			$classes_labels->set_labels( $existing_labels );


			$t_index = microtime( true ) - $t;

			error_log( '[GC Import][Timing] add_class(' . $class_id . '): post_create=' . round( $t_create * 1000, 2 ) . 'ms, index_add=' . round( $t_index * 1000, 2 ) . 'ms' );
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
				yield Global_Class_Post::from_post( $post, $this->context );
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
		$context = $is_preview ? self::CONTEXT_PREVIEW : self::CONTEXT_FRONTEND;

		$this->each_class_id_batch( $to_delete, function ( string $class_id ) use ( $is_preview ) {
			$post = Global_Class_Post::find_by_class_id( $class_id, self::CONTEXT_FRONTEND );

			if ( $post ) {
				if ( $is_preview ) {
					$post->update_data( [], true );
					clean_post_cache( $post->get_post_id() );
				} else {
					$post->delete();
				}
			}
		} );

		$this->each_class_id_batch( $to_create, function ( string $class_id ) use ( $items_by_id, $is_preview ) {
			if ( ! isset( $items_by_id[ $class_id ] ) ) {
				return;
			}

			$item = $items_by_id[ $class_id ];
			$data = $this->build_class_data_for_storage( $item );

			if ( $is_preview ) {
				$post = Global_Class_Post::find_by_class_id( $class_id, self::CONTEXT_PREVIEW );

				if ( $post ) {
					$post->update_data( $data, true );
					$post->update_label( $item['label'] );
					clean_post_cache( $post->get_post_id() );
				} else {
					$created = Global_Class_Post::create( $class_id, $item['label'], $data );
					if ( $created ) {
						clean_post_cache( $created->get_post_id() );
					}
				}
			} else {
				$created = Global_Class_Post::create( $class_id, $item['label'], $data );
				if ( $created ) {
					clean_post_cache( $created->get_post_id() );
				}
			}
		} );

		$this->each_class_id_batch( $to_update, function ( string $class_id ) use ( $items_by_id, $is_preview, $context ) {
			if ( ! isset( $items_by_id[ $class_id ] ) ) {
				return;
			}

			$item = $items_by_id[ $class_id ];
			$post = Global_Class_Post::find_by_class_id( $class_id, $context );

			if ( ! $post ) {
				return;
			}

			$data = $this->build_class_data_for_storage( $item );
			$post->update_data( $data, $is_preview );
			$post->update_label( $item['label'] );
			clean_post_cache( $post->get_post_id() );
		} );
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

	private function build_class_data_for_storage( array $item ): array {
		$data = [
			'type' => $item['type'] ?? 'class',
			'variants' => $item['variants'] ?? [],
		];

		if ( array_key_exists( 'sync_to_v3', $item ) ) {
			$data['sync_to_v3'] = (bool) $item['sync_to_v3'];
		}

		return $data;
	}
}
