<?php
namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
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

	public function get( string $class_id ): ?array {
		$post = Global_Class_Post::find_by_class_id( $class_id, $this->context );

		return $post ? $post->to_array() : null;
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

		// TODO - handle with pagination
		$posts = get_posts( [
			'post_type' => Global_Class_Post_Type::CPT,
			'post_status' => 'publish',
			'posts_per_page' => -1,
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
			$data = $this->build_class_data_for_storage( $item );

			if ( $is_preview ) {
				$post = Global_Class_Post::find_by_class_id( $class_id, true );

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
			$post = Global_Class_Post::find_by_class_id( $class_id, $is_preview );

			if ( ! $post ) {
				continue;
			}

			$data = $this->build_class_data_for_storage( $item );

			$post->update_data( $data, $is_preview );
			$post->update_label( $item['label'] );
		}

		$classes_order = Global_Classes_Order::make( $this->kit );
		$classes_order->set_order( $order );

		if ( ! $is_preview ) {
			foreach ( $new_ids as $class_id ) {
				$post = Global_Class_Post::find_by_class_id( $class_id );

				if ( $post ) {
					delete_post_meta( $post->get_post_id(), Global_Class_Post::META_KEY_DATA_PREVIEW );
				}
			}
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
