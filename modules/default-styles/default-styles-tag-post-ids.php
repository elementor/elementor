<?php

namespace Elementor\Modules\DefaultStyles;

use Elementor\Core\Kits\Concerns\Has_Kit_Dependency;
use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Utils\Kit_Utils;
use WP_Post;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Default_Styles_Tag_Post_IDs {
	use Has_Kit_Dependency;

	const META_KEY = '_elementor_default_styles_post_ids';

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
		if ( Default_Style_Post_Type::CPT !== $post->post_type ) {
			return;
		}

		foreach ( Kit_Utils::get_all_kit_documents() as $kit ) {
			self::make( $kit )->remove_post_id( $post_id );
		}
	}

	public function get_post_id( string $tag ): ?int {
		$map = $this->read_map();

		if ( ! isset( $map[ $tag ] ) ) {
			return null;
		}

		$post_id = (int) $map[ $tag ];

		if ( get_post( $post_id ) ) {
			return $post_id;
		}

		$this->remove_post_id( $post_id );

		return null;
	}

	public function get_all(): array {
		$map = $this->read_map();
		$resolved = [];

		foreach ( $map as $tag => $post_id ) {
			$post_id = (int) $post_id;

			if ( get_post( $post_id ) ) {
				$resolved[ $tag ] = $post_id;
			} else {
				$this->remove_post_id( $post_id );
			}
		}

		return $resolved;
	}

	public function set( string $tag, int $post_id ): void {
		$map = $this->read_map();

		if ( $post_id <= 0 || '' === $tag ) {
			return;
		}

		$map[ $tag ] = $post_id;
		$this->write_map( $map );
	}

	public function remove_tag( string $tag ): void {
		$map = $this->read_map();

		if ( ! isset( $map[ $tag ] ) ) {
			return;
		}

		unset( $map[ $tag ] );
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
