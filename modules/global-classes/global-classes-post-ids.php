<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Base\Document;
use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Concerns\Has_Kit_Dependency;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
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

		$kit_ids = get_posts( [
			'post_type'              => Source_Local::CPT,
			'post_status'            => 'any',
			'fields'                 => 'ids',
			'posts_per_page'         => -1,
			'no_found_rows'          => true,
			'update_post_meta_cache' => false,
			'meta_query'             => [
				[
					'key'   => Document::TYPE_META_KEY,
					'value' => 'kit',
				],
			],
		] );

		foreach ( $kit_ids as $kit_id ) {
			$kit = Plugin::$instance->kits_manager->get_kit( $kit_id );

			if ( $kit ) {
				self::make( $kit )->remove_post_id( $post_id );
			}
		}
	}

	public function get_post_id( string $class_id ): ?int {
		$map = $this->read_map();

		if ( isset( $map[ $class_id ] ) ) {
			$post_id = (int) $map[ $class_id ];

			if ( get_post( $post_id ) ) {
				return $post_id;
			}

			$this->remove_post_id( $post_id );
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
			if ( ! isset( $map[ $class_id ] ) ) {
				$missing[] = $class_id;
				continue;
			}

			$post_id = (int) $map[ $class_id ];

			if ( get_post( $post_id ) ) {
				$resolved[ $class_id ] = $post_id;
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

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$sql = $wpdb->prepare(
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
		// phpcs:enable

		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- $sql is already prepared via $wpdb->prepare() above.
		$rows = $wpdb->get_results( $sql );

		$candidates = [];

		foreach ( $rows as $row ) {
			$candidates[ (string) $row->meta_value ][] = (int) $row->post_id;
		}

		$resolved = [];

		foreach ( $candidates as $class_id => $post_ids ) {
			sort( $post_ids );
			$resolved[ $class_id ] = $post_ids[0];
			$duplicates = array_slice( $post_ids, 1 );

			foreach ( $duplicates as $duplicate_id ) {
				wp_delete_post( $duplicate_id, true );
			}
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
