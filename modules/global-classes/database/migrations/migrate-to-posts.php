<?php

namespace Elementor\Modules\GlobalClasses\Database\Migrations;

use Elementor\Core\Database\Base_Migration;
use Elementor\Modules\GlobalClasses\Global_Class_Post;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Index;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Migrate_To_Posts extends Base_Migration {
	const META_KEY_USED_CLASS = '_elementor_used_global_class';

	public function up() {
		$this->ensure_cpt_registered();

		$migrated = $this->migrate_global_classes_to_posts();

		if ( ! $migrated ) {
			return;
		}

		$this->update_document_tracking();

		$this->cleanup_kit_meta();

		Global_Classes_Repository::reset_storage_mode_cache();
	}

	private function ensure_cpt_registered(): void {
		if ( ! post_type_exists( Global_Class_Post_Type::CPT ) ) {
			( new Global_Class_Post_Type() )->register_post_type();
		}
	}

	private function migrate_global_classes_to_posts(): bool {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( ! $kit ) {
			return false;
		}

		$global_classes = $kit->get_json_meta( Global_Classes_Repository::META_KEY_FRONTEND );

		if ( empty( $global_classes ) || empty( $global_classes['items'] ) ) {
			return false;
		}

		$existing_posts = $this->get_existing_class_posts();

		if ( ! empty( $existing_posts ) ) {
			return false;
		}

		$items = $global_classes['items'] ?? [];
		$order = $global_classes['order'] ?? array_keys( $items );

		$order_index = array_flip( $order );
		$created_order = [];

		foreach ( $items as $class_id => $class_data ) {
			$menu_order = $order_index[ $class_id ] ?? 0;

			$post = Global_Class_Post::create(
				$class_id,
				$class_data['label'] ?? $class_id,
				[
					'type' => $class_data['type'] ?? 'class',
					'variants' => $class_data['variants'] ?? [],
				],
				$menu_order
			);

			if ( $post ) {
				$created_order[ $menu_order ] = $class_id;
			}
		}

		ksort( $created_order );
		Global_Classes_Index::make()->set_order( array_values( $created_order ) );

		return true;
	}

	private function get_existing_class_posts(): array {
		return get_posts( [
			'post_type' => Global_Class_Post_Type::CPT,
			'post_status' => 'publish',
			'posts_per_page' => 1,
			'fields' => 'ids',
		] );
	}

	private function update_document_tracking(): void {
		$class_ids = Global_Classes_Index::make()->get_order();

		if ( empty( $class_ids ) ) {
			return;
		}

		Plugin::$instance->db->iterate_elementor_documents(
			function ( $document ) use ( $class_ids ) {
				$post_id = $document->get_main_id();
				$used_class_ids = $this->extract_used_class_ids_from_document( $document, $class_ids );

				if ( ! empty( $used_class_ids ) ) {
					$this->set_document_class_ids( $post_id, $used_class_ids );
				}
			}
		);
	}

	private function extract_used_class_ids_from_document( $document, array $valid_class_ids ): array {
		$elements_data = $document->get_elements_raw_data() ?? [];

		if ( empty( $elements_data ) ) {
			return [];
		}

		$used_class_ids = [];

		Plugin::$instance->db->iterate_data(
			$elements_data,
			function ( $element_data ) use ( &$used_class_ids, $valid_class_ids ) {
				$class_values = $element_data['settings']['classes']['value'] ?? [];

				if ( empty( $class_values ) || ! is_array( $class_values ) ) {
					return;
				}

				foreach ( $class_values as $class_id ) {
					if ( in_array( $class_id, $valid_class_ids, true ) ) {
						$used_class_ids[] = $class_id;
					}
				}
			}
		);

		return array_unique( $used_class_ids );
	}

	private function set_document_class_ids( int $post_id, array $class_ids ): void {
		delete_post_meta( $post_id, self::META_KEY_USED_CLASS );

		foreach ( array_unique( $class_ids ) as $class_id ) {
			add_post_meta( $post_id, self::META_KEY_USED_CLASS, $class_id );
		}
	}

	private function cleanup_kit_meta(): void {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( ! $kit ) {
			return;
		}

		$kit->delete_meta( Global_Classes_Repository::META_KEY_FRONTEND );
		$kit->delete_meta( Global_Classes_Repository::META_KEY_PREVIEW );
	}
}
