<?php

namespace Elementor\Modules\DefaultStyles;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Orchestrator;
use Elementor\Modules\DefaultStyles\Utils\Default_Style_Data_Normalizer;
use Elementor\Plugin;
use WP_Post;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Default_Style_Post {
	const META_KEY_VERSION = '_elementor_version';
	const META_KEY_TAG = '_elementor_default_style_tag';
	const META_KEY_DATA = '_elementor_default_style_data';

	private WP_Post $post;

	private function __construct( WP_Post $post ) {
		$this->post = $post;
	}

	public static function from_post( WP_Post $post ): self {
		return new static( $post );
	}

	public static function from_post_id( int $post_id ): ?self {
		$post = get_post( $post_id );

		if ( ! $post || Default_Style_Post_Type::CPT !== $post->post_type ) {
			return null;
		}

		return new static( $post );
	}

	public static function find_by_tag( string $tag, ?Kit $kit = null ): ?self {
		$kit = $kit ?? Plugin::$instance->kits_manager->get_active_kit();

		if ( ! $kit ) {
			return null;
		}

		$post_id = Default_Styles_Tag_Post_IDs::make( $kit )->get_post_id( $tag );

		if ( ! $post_id ) {
			return null;
		}

		return self::from_post_id( $post_id );
	}

	public function get_post_id(): int {
		return $this->post->ID;
	}

	public function get_tag(): string {
		$tag = get_post_meta( $this->post->ID, self::META_KEY_TAG, true );

		return is_string( $tag ) ? $tag : '';
	}

	public function get_data( bool $skip_migration = false ): array {
		$data = get_post_meta( $this->post->ID, self::META_KEY_DATA, true );
		$data = is_array( $data ) ? $data : [];

		if ( ! empty( $data ) && ! $skip_migration ) {
			$this->migrate_data( $data );
		}

		return $data;
	}

	private function migrate_data( array &$data ): void {
		$post_id = $this->post->ID;
		$meta_key = self::META_KEY_DATA;

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

	public function to_array( bool $skip_migration = false ): array {
		$data = $this->get_data( $skip_migration );
		$tag = $this->get_tag();

		return Default_Style_Data_Normalizer::normalize_style( $tag, $data );
	}

	public function update_data( array $data, string $version = ELEMENTOR_VERSION ): bool {
		$normalized_data = Default_Style_Data_Normalizer::normalize_style_fields( $data );

		$result = update_post_meta( $this->post->ID, self::META_KEY_DATA, $normalized_data );

		update_post_meta( $this->post->ID, self::META_KEY_VERSION, $version );

		return false !== $result;
	}

	public static function create( string $tag, array $data, ?Kit $kit = null, string $version = ELEMENTOR_VERSION ): ?self {
		$post_id = wp_insert_post( [
			'post_type' => Default_Style_Post_Type::CPT,
			'post_title' => $tag,
			'post_status' => 'publish',
		] );

		if ( is_wp_error( $post_id ) || ! $post_id ) {
			return null;
		}

		$normalized_data = Default_Style_Data_Normalizer::normalize_style_fields( $data );

		update_post_meta( $post_id, self::META_KEY_TAG, $tag );
		update_post_meta( $post_id, self::META_KEY_DATA, $normalized_data );
		update_post_meta( $post_id, self::META_KEY_VERSION, $version );

		$kit = $kit ?? Plugin::$instance->kits_manager->get_active_kit();

		if ( $kit ) {
			Default_Styles_Tag_Post_IDs::make( $kit )->set( $tag, (int) $post_id );
		}

		return self::from_post_id( $post_id );
	}

	public function delete(): bool {
		$result = wp_delete_post( $this->post->ID, true );

		return false !== $result;
	}

	public static function clone_to_other_kit( string $tag, Kit $source_kit, Kit $target_kit ): ?self {
		$source_post = self::find_by_tag( $tag, $source_kit );

		if ( ! $source_post ) {
			return null;
		}

		$new_post_id = wp_insert_post( [
			'post_type' => Default_Style_Post_Type::CPT,
			'post_title' => $tag,
			'post_status' => 'publish',
		] );

		if ( is_wp_error( $new_post_id ) || ! $new_post_id ) {
			return null;
		}

		update_post_meta( $new_post_id, self::META_KEY_TAG, $tag );
		update_post_meta( $new_post_id, self::META_KEY_VERSION, get_post_meta( $source_post->get_post_id(), self::META_KEY_VERSION, true ) );

		$source_data = $source_post->get_data();

		if ( ! empty( $source_data ) ) {
			update_post_meta( $new_post_id, self::META_KEY_DATA, $source_data );
		}

		Default_Styles_Tag_Post_IDs::make( $target_kit )->set( $tag, (int) $new_post_id );

		return self::from_post_id( $new_post_id );
	}
}
