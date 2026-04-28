<?php
namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Orchestrator;
use Elementor\Modules\GlobalClasses\Global_Classes_Parser;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Classes_Repository {

	const META_KEY_FRONTEND = '_elementor_global_classes';
	const META_KEY_PREVIEW = '_elementor_global_classes_preview';

	const CONTEXT_FRONTEND = 'frontend';
	const CONTEXT_PREVIEW = 'preview';

	private string $context = self::CONTEXT_FRONTEND;

	private static ?bool $uses_posts = null;

	private ?Global_Classes $cache = null;

	private ?Kit $kit = null;

	public function __construct( ?Kit $kit = null ) {
		$this->kit = $kit;
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

		if ( $this->is_using_posts() ) {
			$this->cache = $this->all_from_posts();
		} else {
			$this->cache = $this->all_from_kit_meta();
		}

		return $this->cache;
	}

	public function get( string $class_id ): ?array {
		if ( $this->is_using_posts() ) {
			$post = Global_Class_Post::find_by_class_id( $class_id, $this->context );

			return $post ? $post->to_array() : null;
		}

		return $this->all()->get_items()->get( $class_id );
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
		];

		if ( $this->is_using_posts() ) {
			$this->put_to_posts( $items, $order, $current_value );
		} else {
			$this->put_to_kit_meta( $items, $order );
		}

		$this->cache = null;

		do_action( 'elementor/global_classes/update', $this->context, $changes );
	}

	public function is_using_posts(): bool {
		return true;
		if ( null !== self::$uses_posts ) {
			return self::$uses_posts;
		}

		$posts = get_posts( [
			'post_type' => Global_Class_Post_Type::CPT,
			'posts_per_page' => 1,
			'fields' => 'ids',
		] );

		self::$uses_posts = ! empty( $posts );

		return self::$uses_posts;
	}

	public static function reset_storage_mode_cache(): void {
		self::$uses_posts = null;
	}

	public function invalidate_cache(): void {
		$this->cache = null;
	}

	private function all_from_posts(): Global_Classes {
		$index = Global_Classes_Index::make();
		$order = $index->get_order();

		if ( empty( $order ) ) {
			return Global_Classes::make( [], [] );
		}

		$posts = get_posts( [
			'post_type' => Global_Class_Post_Type::CPT,
			'post_status' => 'publish',
			'posts_per_page' => 100,
			'meta_query' => [
				[
					'key' => Global_Class_Post::META_KEY_ID,
					'value' => $order,
					'compare' => 'IN',
				],
			],
		] );

		$items = [];

		foreach ( $posts as $post ) {
			$class_post = Global_Class_Post::from_post( $post, $this->context );
			$class_data = $class_post->to_array();
			$items[ $class_data['id'] ] = $class_data;
		}

		$order = Global_Classes_Parser::sanitize_order( $items, $order );

		return Global_Classes::make( $items, $order );
	}

	private function all_from_kit_meta(): Global_Classes {
		$meta_key = $this->get_meta_key();
		$kit = $this->get_kit();
		$all = $kit->get_json_meta( $meta_key );

		$is_preview = static::META_KEY_PREVIEW === $meta_key;
		$is_empty = empty( $all );

		if ( $is_preview && $is_empty ) {
			$all = $kit->get_json_meta( static::META_KEY_FRONTEND );
		}

		$all['order'] = Global_Classes_Parser::sanitize_order( $all['items'] ?? [], $all['order'] ?? [] );

		Migrations_Orchestrator::make()->migrate(
			$all,
			$kit->get_id(),
			$meta_key,
			function( $migrated_data ) use ( $kit, $meta_key ) {
				$kit->update_json_meta( $meta_key, $migrated_data );
			}
		);

		return Global_Classes::make( $all['items'] ?? [], $all['order'] ?? [] );
	}

	private function put_to_posts( array $items, array $order, array $current_value ): void {
		$is_preview = self::CONTEXT_PREVIEW === $this->context;
		$current_ids = array_keys( $current_value['items'] );
		$new_ids = array_keys( $items );

		$to_delete = array_diff( $current_ids, $new_ids );
		$to_create = array_diff( $new_ids, $current_ids );
		$to_update = array_intersect( $new_ids, $current_ids );

		foreach ( $to_delete as $class_id ) {
			$post = Global_Class_Post::find_by_class_id( $class_id );

			if ( $post ) {
				if ( $is_preview ) {
					$post->update_data( [], true );
				} else {
					$post->delete();
				}
			}
		}

		foreach ( $to_create as $class_id ) {
			$item = $items[ $class_id ];
			$data = [
				'type' => $item['type'] ?? 'class',
				'variants' => $item['variants'] ?? [],
			];

			if ( $is_preview ) {
				$post = Global_Class_Post::find_by_class_id( $class_id );

				if ( $post ) {
					$post->update_data( $data, true );
					$post->update_label( $item['label'] );
				} else {
					Global_Class_Post::create( $class_id, $item['label'], $data );
				}
			} else {
				Global_Class_Post::create( $class_id, $item['label'], $data );
			}
		}

		foreach ( $to_update as $class_id ) {
			$item = $items[ $class_id ];
			$post = Global_Class_Post::find_by_class_id( $class_id );

			if ( ! $post ) {
				continue;
			}

			$data = [
				'type' => $item['type'] ?? 'class',
				'variants' => $item['variants'] ?? [],
			];

			$post->update_data( $data, $is_preview );
			$post->update_label( $item['label'] );
		}

		$index = Global_Classes_Index::make();
		$index->set_order( $order );

		if ( ! $is_preview ) {
			foreach ( $new_ids as $class_id ) {
				$post = Global_Class_Post::find_by_class_id( $class_id );

				if ( $post ) {
					delete_post_meta( $post->get_post_id(), Global_Class_Post::META_KEY_DATA_PREVIEW );
				}
			}
		}
	}

	/**
	 * Bulk-add classes using direct DB inserts in a single batch.
	 * Updates the index once at the end instead of per-class.
	 *
	 * @param array $items Array of [ 'class_id' => string, 'label' => string, 'data' => array ].
	 * @return string[] Class IDs that were successfully created.
	 */
	public function bulk_add_classes( array $items ): array {
		$t = microtime( true );
		$created_ids = Global_Class_Post::bulk_create( $items );
		$t_bulk = microtime( true ) - $t;

		if ( ! empty( $created_ids ) ) {
			$t = microtime( true );
			$index = Global_Classes_Index::make();
			$order = $index->get_order();
			$order = array_merge( $order, $created_ids );
			$index->set_order( $order );
			$t_index = microtime( true ) - $t;

			error_log( '[GC Import][Timing] bulk_add_classes: count=' . count( $created_ids ) . ', bulk_create=' . round( $t_bulk * 1000, 2 ) . 'ms, index_update=' . round( $t_index * 1000, 2 ) . 'ms' );
		}

		return $created_ids;
	}

	public function add_class( string $class_id, string $label, array $data ): void {
		$t = microtime( true );
		$post = Global_Class_Post::create( $class_id, $label, $data );
		$t_create = microtime( true ) - $t;

		if ( $post ) {
			$t = microtime( true );
			$index = Global_Classes_Index::make();
			$index->add_class( $class_id );
			$t_index = microtime( true ) - $t;

			error_log( '[GC Import][Timing] add_class(' . $class_id . '): post_create=' . round( $t_create * 1000, 2 ) . 'ms, index_add=' . round( $t_index * 1000, 2 ) . 'ms' );
		}
	}

	private function put_to_kit_meta( array $items, array $order ): void {
		$meta_key = $this->get_meta_key();

		$updated_value = [
			'items' => $items,
			'order' => $order,
		];

		$value = $this->get_kit()->update_json_meta( $meta_key, $updated_value );

		$should_delete_preview = static::META_KEY_FRONTEND === $meta_key;

		if ( $should_delete_preview ) {
			$this->get_kit()->delete_meta( static::META_KEY_PREVIEW );
		}

		if ( ! $value ) {
			throw new \Exception( 'Failed to update global classes' );
		}
	}

	private function get_meta_key(): string {
		return static::CONTEXT_FRONTEND === $this->context
			? static::META_KEY_FRONTEND
			: static::META_KEY_PREVIEW;
	}

	private function get_kit(): Kit {
		return $this->kit ?? Plugin::$instance->kits_manager->get_active_kit();
	}
}
