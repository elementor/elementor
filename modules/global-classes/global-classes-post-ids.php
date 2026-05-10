<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Concerns\Has_Kit_Dependency;
use Elementor\Plugin;
use WP_Post;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Post_IDs {
	use Has_Kit_Dependency;

	const META_KEY = '_elementor_global_classes_post_ids';

	const BACKFILL_BATCH_SIZE = 100;

	private ?array $cache = null;

	public static function make( ?Kit $kit = null ): self {
		$instance = new self();

		if ( null !== $kit ) {
			$instance->set_kit( $kit );
		}

		return $instance;
	}

	public function register_hooks(): void {
		add_action( 'deleted_post', [ self::class, 'on_deleted_post' ], 10, 2 );
	}

	public static function on_deleted_post( int $post_id, WP_Post $post ): void {
		if ( Global_Class_Post_Type::CPT !== $post->post_type ) {
			return;
		}

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( ! $kit ) {
			return;
		}

		self::make( $kit )->remove_post_id( $post_id );
	}

	public function get_post_id( string $class_id ): ?int {
		$map = $this->read_map();

		if ( isset( $map[ $class_id ] ) ) {
			return (int) $map[ $class_id ];
		}

		$resolved = $this->backfill( [ $class_id ] );

		return $resolved[ $class_id ] ?? null;
	}

	public function get_post_ids( array $class_ids ): array {
		if ( empty( $class_ids ) ) {
			return [];
		}

		$map = $this->read_map();
		$resolved = [];
		$missing = [];

		foreach ( $class_ids as $class_id ) {
			if ( isset( $map[ $class_id ] ) ) {
				$resolved[ $class_id ] = (int) $map[ $class_id ];
			} else {
				$missing[] = $class_id;
			}
		}

		if ( ! empty( $missing ) ) {
			$resolved += $this->backfill( $missing );
		}

		return $resolved;
	}

	public function set( string $class_id, int $post_id ): void {
		$this->set_many( [ $class_id => $post_id ] );
	}

	public function set_many( array $class_id_to_post_id ): void {
		if ( empty( $class_id_to_post_id ) ) {
			return;
		}

		$map = $this->read_map();
		$changed = false;

		foreach ( $class_id_to_post_id as $class_id => $post_id ) {
			$post_id = (int) $post_id;

			if ( ! is_string( $class_id ) || '' === $class_id || $post_id <= 0 ) {
				continue;
			}

			if ( ! isset( $map[ $class_id ] ) || (int) $map[ $class_id ] !== $post_id ) {
				$map[ $class_id ] = $post_id;
				$changed = true;
			}
		}

		if ( $changed ) {
			$this->write_map( $map );
		}
	}

	public function remove_class_id( string $class_id ): void {
		$map = $this->read_map();

		if ( ! isset( $map[ $class_id ] ) ) {
			return;
		}

		unset( $map[ $class_id ] );
		$this->write_map( $map );
	}

	public function remove_post_id( int $post_id ): void {
		$map = $this->read_map();
		$filtered = array_filter( $map, fn( $id ) => (int) $id !== $post_id );

		if ( count( $filtered ) === count( $map ) ) {
			return;
		}

		$this->write_map( $filtered );
	}

	private function backfill( array $class_ids ): array {
		$resolved = [];

		foreach ( array_chunk( array_values( array_unique( $class_ids ) ), self::BACKFILL_BATCH_SIZE ) as $chunk ) {
			$resolved += $this->resolve_via_query( $chunk );
		}

		if ( ! empty( $resolved ) ) {
			$this->set_many( $resolved );
		}

		return $resolved;
	}

	private function resolve_via_query( array $class_ids ): array {
		if ( empty( $class_ids ) ) {
			return [];
		}

		global $wpdb;

		$placeholders = implode( ',', array_fill( 0, count( $class_ids ), '%s' ) );

		$sql = $wpdb->prepare(
			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- $placeholders is a safe list of %s tokens generated above.
			"SELECT pm.post_id, pm.meta_value
			 FROM {$wpdb->postmeta} pm
			 INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
			 WHERE pm.meta_key = %s
			   AND pm.meta_value IN ($placeholders)
			   AND p.post_type = %s
			   AND p.post_status = %s",
			array_merge(
				[ Global_Class_Post::META_KEY_ID ],
				$class_ids,
				[ Global_Class_Post_Type::CPT, 'publish' ]
			)
		);

		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- $sql is already prepared via $wpdb->prepare() above.
		$rows = $wpdb->get_results( $sql );
		$resolved = [];

		foreach ( $rows as $row ) {
			$resolved[ (string) $row->meta_value ] = (int) $row->post_id;
		}

		return $resolved;
	}

	private function read_map(): array {
		if ( null !== $this->cache ) {
			return $this->cache;
		}

		$kit = $this->get_kit();

		if ( ! $kit ) {
			$this->cache = [];

			return [];
		}

		$raw = $kit->get_meta( self::META_KEY );
		$this->cache = is_array( $raw ) ? $raw : [];

		return $this->cache;
	}

	private function write_map( array $map ): bool {
		$kit = $this->get_kit();

		if ( ! $kit ) {
			return false;
		}

		$result = $kit->update_meta( self::META_KEY, $map );
		$this->cache = $map;

		return false !== $result;
	}
}
