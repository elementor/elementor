<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Orchestrator;
use Elementor\Modules\GlobalClasses\Concerns\Has_Preview_Context;
use WP_Post;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Class_Post {
	use Has_Preview_Context;

	const META_KEY_ID = '_elementor_global_class_id';
	const META_KEY_DATA = '_elementor_global_class_data';
	const META_KEY_DATA_PREVIEW = '_elementor_global_class_data_preview';

	protected array $context_keys = [
		'data' => [
			'frontend' => self::META_KEY_DATA,
			'preview' => self::META_KEY_DATA_PREVIEW,
		],
	];

	private WP_Post $post;

	private function __construct( WP_Post $post, bool $is_preview = false ) {
		$this->post = $post;
		$this->is_preview = $is_preview;
	}

	public static function from_post( WP_Post $post, bool $is_preview = false ): self {
		return new self( $post, $is_preview );
	}

	public static function from_post_id( int $post_id, bool $is_preview = false ): ?self {
		$post = get_post( $post_id );

		if ( ! $post || Global_Class_Post_Type::CPT !== $post->post_type ) {
			return null;
		}

		return new self( $post, $is_preview );
	}

	public static function find_by_class_id( string $class_id, bool $is_preview = false ): ?self {
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

		return new self( $posts[0], $is_preview );
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
		$meta_key = $this->get_data_meta_key();

		if ( empty( $data ) && $this->is_preview() ) {
			$data = $this->get_frontend_data();
			$meta_key = self::META_KEY_DATA;
		}

		if ( ! empty( $data ) ) {
			$this->migrate_data( $data, $meta_key );
		}

		return $data;
	}

	private function migrate_data( array &$data, string $meta_key ): void {
		if ( ! Migrations_Orchestrator::is_active() ) {
			return;
		}

		$post_id = $this->post->ID;

		Migrations_Orchestrator::make()->migrate(
			$data,
			$post_id,
			$meta_key,
			function ( $migrated ) use ( $post_id, $meta_key ) {
				update_post_meta( $post_id, $meta_key, $migrated );
				clean_post_cache( $post_id );
			}
		);
	}

	public function to_array(): array {
		$data = $this->get_data();

		$result = [
			'id' => $this->get_class_id(),
			'label' => $this->get_label(),
			'type' => $data['type'] ?? 'class',
			'variants' => $data['variants'] ?? [],
		];

		if ( array_key_exists( 'sync_to_v3', $data ) ) {
			$result['sync_to_v3'] = (bool) $data['sync_to_v3'];
		}

		return $result;
	}

	private function get_context_data(): array {
		$data = get_post_meta( $this->post->ID, $this->get_data_meta_key(), true );

		return is_array( $data ) ? $data : [];
	}

	private function get_data_meta_key(): string {
		return $this->get_context_key( 'data' );
	}

	private function get_frontend_data(): array {
		$data = get_post_meta( $this->post->ID, self::META_KEY_DATA, true );

		return is_array( $data ) ? $data : [];
	}

	public function update_data( array $data, bool $is_preview_update = false ): bool {
		$meta_key = $is_preview_update ? self::META_KEY_DATA_PREVIEW : self::META_KEY_DATA;

		$result = update_post_meta( $this->post->ID, $meta_key, $data );

		if ( ! $is_preview_update ) {
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
		$post_id = wp_insert_post( [
			'post_type' => Global_Class_Post_Type::CPT,
			'post_title' => $label,
			'post_status' => 'publish',
			'menu_order' => $order,
		] );

		if ( is_wp_error( $post_id ) || ! $post_id ) {
			return null;
		}

		update_post_meta( $post_id, self::META_KEY_ID, $class_id );
		update_post_meta( $post_id, self::META_KEY_DATA, $data );

		return self::from_post_id( $post_id );
	}

	public function delete(): bool {
		$result = wp_delete_post( $this->post->ID, true );

		return false !== $result;
	}
}
