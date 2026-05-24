<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Orchestrator;
use Elementor\Modules\GlobalClasses\Concerns\Has_Preview_Context;
use Elementor\Plugin;
use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Utils\Global_Class_Data_Normalizer;
use WP_Post;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Class_Post {
	use Has_Preview_Context;

	const META_KEY_VERSION = '_elementor_version';
	const META_KEY_ID = '_elementor_global_class_id';
	const META_KEY_DATA = '_elementor_global_class_data';
	const META_KEY_DATA_PREVIEW = '_elementor_global_class_data_preview';
	const META_KEY_EDITED = '_elementor_global_class_edited';

	protected array $context_keys = [
		'data' => [
			'frontend' => self::META_KEY_DATA,
			'preview' => self::META_KEY_DATA_PREVIEW,
		],
	];

	private WP_Post $post;

	private function __construct( WP_Post $post ) {
		$this->post = $post;
	}

	public static function from_post( WP_Post $post, bool $is_preview = false ): self {
		return ( new static( $post ) )->set_preview( $is_preview );
	}

	public static function from_post_id( int $post_id, bool $is_preview = false ): ?self {
		$post = get_post( $post_id );

		if ( ! $post || Global_Class_Post_Type::CPT !== $post->post_type ) {
			return null;
		}

		return ( new static( $post ) )->set_preview( $is_preview );
	}

	public static function find_by_class_id( string $class_id, bool $is_preview = false, ?Kit $kit = null ): ?self {
		$kit = $kit ?? Plugin::$instance->kits_manager->get_active_kit();

		if ( ! $kit ) {
			return null;
		}

		$post_id = Global_Classes_Post_IDs::make( $kit )->get_post_id( $class_id );

		if ( ! $post_id ) {
			return null;
		}

		return self::from_post_id( $post_id, $is_preview );
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

	public function get_data( bool $skip_migration = false ): array {
		$data = $this->get_context_data();
		$meta_key = $this->get_context_key( 'data' );

		// Empty preview (draft) - use frontend (published) data
		if ( empty( $data ) && $this->is_preview() ) {
			$data = $this->get_frontend_data();
			$meta_key = self::META_KEY_DATA;
		}

		if ( ! empty( $data ) && ( ! $skip_migration ) ) {
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

	public function to_array( bool $skip_migration = false ): array {
		$data = $this->get_data( $skip_migration );

		$class_id = $this->get_class_id();

		return Global_Class_Data_Normalizer::normalize_style(
			$class_id,
			array_merge( $data, [ 'label' => $this->get_label() ] )
		);
	}

	public function was_edited(): bool {
		$last_edited = $this->get_last_edited_timestamp();
		$creation = $this->get_creation_timestamp();

		return $last_edited > $creation;
	}

	public function has_edit_timestamp(): bool {
		return $this->get_last_edited_timestamp() > 0;
	}

	private function get_creation_timestamp(): int {
		$dt = get_post_datetime( $this->post, 'date', 'gmt' );

		if ( $dt ) {
			return (int) $dt->format( 'U' );
		}

		return (int) strtotime( (string) $this->post->post_date );
	}

	private function get_last_edited_timestamp(): int {
		$raw = get_post_meta( $this->post->ID, self::META_KEY_EDITED, true );

		if ( self::is_timestamp( $raw ) ) {
			return (int) $raw;
		}

		return 0;
	}

	private static function is_timestamp( $value ): bool {
		if ( ! is_numeric( $value ) ) {
			return false;
		}

		return (int) $value > 0;
	}

	protected function get_current_timestamp(): int {
		return (int) time();
	}

	public function update_label( string $label ): bool {
		$result = wp_update_post( [
			'ID' => $this->post->ID,
			'post_title' => $label,
		] );

		if ( ! is_wp_error( $result ) && ! $this->is_preview() ) {
			update_post_meta( $this->post->ID, self::META_KEY_EDITED, $this->get_current_timestamp() );
		}

		return ! is_wp_error( $result );
	}

	private function get_context_data(): array {
		$data = get_post_meta( $this->post->ID, $this->get_context_key( 'data' ), true );

		return is_array( $data ) ? $data : [];
	}

	private function get_frontend_data(): array {
		$data = get_post_meta( $this->post->ID, self::META_KEY_DATA, true );

		return is_array( $data ) ? $data : [];
	}

	public function update_data(
		array $data,
		string $version = ELEMENTOR_VERSION
	): bool {
		$meta_key = $this->get_context_key( 'data' );

		$result = update_post_meta( $this->post->ID, $meta_key, $data );

		if ( ! $this->is_preview() ) {
			delete_post_meta( $this->post->ID, self::META_KEY_DATA_PREVIEW );
		}

		update_post_meta( $this->post->ID, self::META_KEY_VERSION, $version );

		if ( ! $this->is_preview() ) {
			update_post_meta( $this->post->ID, self::META_KEY_EDITED, $this->get_current_timestamp() );
		}

		return false !== $result;
	}

	public static function create(
		string $class_id,
		string $label,
		array $data,
		?Kit $kit = null,
		string $version = ELEMENTOR_VERSION
	): ?self {
		$post_id = wp_insert_post( [
			'post_type' => Global_Class_Post_Type::CPT,
			'post_title' => $label,
			'post_status' => 'publish',
		] );

		if ( is_wp_error( $post_id ) || ! $post_id ) {
			return null;
		}

		$normalized_data = Global_Class_Data_Normalizer::normalize_style_fields( $data );

		update_post_meta( $post_id, self::META_KEY_ID, $class_id );
		update_post_meta( $post_id, self::META_KEY_DATA, $normalized_data );
		update_post_meta( $post_id, self::META_KEY_VERSION, $version );

		$kit = $kit ?? Plugin::$instance->kits_manager->get_active_kit();

		if ( $kit ) {
			Global_Classes_Post_IDs::make( $kit )->set( $class_id, (int) $post_id );
		}

		$instance = self::from_post_id( $post_id );

		if ( $instance ) {
			update_post_meta( $post_id, self::META_KEY_EDITED, $instance->get_creation_timestamp() );
		}

		return $instance;
	}

	public function delete(): bool {
		$result = wp_delete_post( $this->post->ID, true );

		return false !== $result;
	}
}
