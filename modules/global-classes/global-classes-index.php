<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Classes_Index {
	const META_KEY = '_elementor_global_classes_index';

	private ?array $cache = null;

	public static function make(): self {
		return new self();
	}

	public function get_order(): array {
		$index = $this->get_index();

		return $index['order'] ?? [];
	}

	public function set_order( array $ids ): bool {
		$kit = $this->get_kit();

		if ( ! $kit ) {
			return false;
		}

		$index = [
			'order' => array_values( $ids ),
		];

		$result = $kit->update_meta( self::META_KEY, $index );
		$this->cache = null;

		return false !== $result;
	}

	public function add_class( string $id ): bool {
		$order = $this->get_order();

		if ( in_array( $id, $order, true ) ) {
			return true;
		}

		$order[] = $id;

		return $this->set_order( $order );
	}

	public function prepend_class( string $id ): bool {
		$order = $this->get_order();

		if ( in_array( $id, $order, true ) ) {
			return true;
		}

		array_unshift( $order, $id );

		return $this->set_order( $order );
	}

	public function remove_class( string $id ): bool {
		$order = $this->get_order();
		$order = array_filter( $order, fn( $item ) => $item !== $id );

		return $this->set_order( $order );
	}

	public function get_labels(): array {
		$order = $this->get_order();

		if ( empty( $order ) ) {
			return [];
		}

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

		$labels = [];

		foreach ( $posts as $post ) {
			$class_id = get_post_meta( $post->ID, Global_Class_Post::META_KEY_ID, true );

			if ( $class_id ) {
				$labels[ $class_id ] = $post->post_title;
			}
		}

		return $labels;
	}

	public function build_from_posts(): bool {
		$posts = get_posts( [
			'post_type' => Global_Class_Post_Type::CPT,
			'post_status' => 'publish',
			'posts_per_page' => -1,
			'orderby' => 'menu_order',
			'order' => 'ASC',
		] );

		$order = [];

		foreach ( $posts as $post ) {
			$class_id = get_post_meta( $post->ID, Global_Class_Post::META_KEY_ID, true );

			if ( $class_id ) {
				$order[] = $class_id;
			}
		}

		return $this->set_order( $order );
	}

	private function get_index(): array {
		if ( null !== $this->cache ) {
			return $this->cache;
		}

		$kit = $this->get_kit();

		if ( ! $kit ) {
			return [];
		}

		$index = $kit->get_meta( self::META_KEY );
		$this->cache = is_array( $index ) ? $index : [];

		return $this->cache;
	}

	private function get_kit() {
		return Plugin::$instance->kits_manager->get_active_kit();
	}
}
