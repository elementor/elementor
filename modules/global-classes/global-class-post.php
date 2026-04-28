<?php

namespace Elementor\Modules\GlobalClasses;

use WP_Post;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Class_Post {
	const META_KEY_ID = '_elementor_global_class_id';
	const META_KEY_DATA = '_elementor_global_class_data';
	const META_KEY_DATA_PREVIEW = '_elementor_global_class_data_preview';

	private WP_Post $post;
	private string $context;

	private function __construct( WP_Post $post, string $context = Global_Classes_Repository::CONTEXT_FRONTEND ) {
		$this->post = $post;
		$this->context = $context;
	}

	public static function from_post( WP_Post $post, string $context = Global_Classes_Repository::CONTEXT_FRONTEND ): self {
		return new self( $post, $context );
	}

	public static function from_post_id( int $post_id, string $context = Global_Classes_Repository::CONTEXT_FRONTEND ): ?self {
		$post = get_post( $post_id );

		if ( ! $post || Global_Class_Post_Type::CPT !== $post->post_type ) {
			return null;
		}

		return new self( $post, $context );
	}

	public static function find_by_class_id( string $class_id, string $context = Global_Classes_Repository::CONTEXT_FRONTEND ): ?self {
		$posts = get_posts( [
			'post_type' => Global_Class_Post_Type::CPT,
			'post_status' => 'publish',
			'posts_per_page' => 1,
			'meta_key' => self::META_KEY_ID,
			'meta_value' => $class_id,
		] );

		if ( empty( $posts ) ) {
			return null;
		}

		return new self( $posts[0], $context );
	}

	public function get_post_id(): int {
		return $this->post->ID;
	}

	public function get_class_id(): string {
		$class_id = get_post_meta( $this->post->ID, self::META_KEY_ID, true );

		if ( ! $class_id ) {
			return '';
		}

		return $class_id;
	}

	public function get_label(): string {
		return $this->post->post_title;
	}

	public function get_order(): int {
		return (int) $this->post->menu_order;
	}

	public function get_data(): array {
		$data = $this->get_context_data();

		if ( empty( $data ) && Global_Classes_Repository::CONTEXT_PREVIEW === $this->context ) {
			$data = $this->get_frontend_data();
		}

		return $data;
	}

	public function to_array(): array {
		$data = $this->get_data();

		return [
			'id' => $this->get_class_id(),
			'label' => $this->get_label(),
			'type' => $data['type'] ?? 'class',
			'variants' => $data['variants'] ?? [],
		];
	}

	private function get_context_data(): array {
		$meta_key = Global_Classes_Repository::CONTEXT_PREVIEW === $this->context
			? self::META_KEY_DATA_PREVIEW
			: self::META_KEY_DATA;

		$data = get_post_meta( $this->post->ID, $meta_key, true );

		return is_array( $data ) ? $data : [];
	}

	private function get_frontend_data(): array {
		$data = get_post_meta( $this->post->ID, self::META_KEY_DATA, true );

		return is_array( $data ) ? $data : [];
	}

	public function update_data( array $data, bool $is_preview = false ): bool {
		$meta_key = $is_preview ? self::META_KEY_DATA_PREVIEW : self::META_KEY_DATA;

		$result = update_post_meta( $this->post->ID, $meta_key, $data );

		if ( ! $is_preview ) {
			delete_post_meta( $this->post->ID, self::META_KEY_DATA_PREVIEW );
		}

		return false !== $result;
	}

	public function update_label( string $label ): bool {
		$result = wp_update_post( [
			'ID' => $this->post->ID,
			'post_title' => $label,
		] );

		return ! is_wp_error( $result );
	}

	public function update_order( int $order ): bool {
		$result = wp_update_post( [
			'ID' => $this->post->ID,
			'menu_order' => $order,
		] );

		return ! is_wp_error( $result );
	}

	public static function create( string $class_id, string $label, array $data, int $order = 0 ): ?self {
		$t = microtime( true );
		$post_id = wp_insert_post( [
			'post_type' => Global_Class_Post_Type::CPT,
			'post_title' => $label,
			'post_status' => 'publish',
			'menu_order' => $order,
		] );
		$t_insert = microtime( true ) - $t;

		if ( is_wp_error( $post_id ) || ! $post_id ) {
			return null;
		}

		$t = microtime( true );
		update_post_meta( $post_id, self::META_KEY_ID, $class_id );
		$t_meta_id = microtime( true ) - $t;

		$t = microtime( true );
		update_post_meta( $post_id, self::META_KEY_DATA, $data );
		$t_meta_data = microtime( true ) - $t;

		$t = microtime( true );
		$result = self::from_post_id( $post_id );
		$t_fetch = microtime( true ) - $t;

		error_log( '[GC Import][Timing] Post::create(' . $class_id . '): insert=' . round( $t_insert * 1000, 2 ) . 'ms, meta_id=' . round( $t_meta_id * 1000, 2 ) . 'ms, meta_data=' . round( $t_meta_data * 1000, 2 ) . 'ms, fetch=' . round( $t_fetch * 1000, 2 ) . 'ms' );

		return $result;
	}

	public function delete(): bool {
		$result = wp_delete_post( $this->post->ID, true );

		return false !== $result;
	}
}
