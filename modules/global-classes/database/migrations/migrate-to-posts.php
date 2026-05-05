<?php

namespace Elementor\Modules\GlobalClasses\Database\Migrations;

use Elementor\Core\Database\Base_Migration;
use Elementor\Modules\GlobalClasses\Concerns\Has_Kit_Dependency;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Relations;
use Elementor\Modules\GlobalClasses\Global_Classes_Order;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Migrate_To_Posts extends Base_Migration {
	use Has_Kit_Dependency;

	public function up() {
		$this->ensure_cpt_registered();

		$migrated = $this->migrate_global_classes_to_posts();

		if ( ! $migrated ) {
			return;
		}

		$this->update_document_tracking();

		// We'll comment it out for now as we may prefer to avoid data restoration upon downgrading
		// $this->cleanup_kit_meta();
	}

	private function ensure_cpt_registered(): void {
		if ( ! post_type_exists( Global_Class_Post_Type::CPT ) ) {
			( new Global_Class_Post_Type() )->register_post_type();
		}
	}

	private function migrate_global_classes_to_posts(): bool {
		$kit = $this->get_kit();

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

		$raw_items = $global_classes['items'];
		$order = $global_classes['order'] ?? array_keys( $raw_items );

		$items = $this->normalize_items( $raw_items );

		Global_Classes_Repository::make( $kit )->put( $items, $order );

		return true;
	}

	private function normalize_items( array $raw_items ): array {
		$items = [];

		foreach ( $raw_items as $class_id => $class_data ) {
			$item = [
				'id' => $class_id,
				'label' => $class_data['label'] ?? $class_id,
				'type' => $class_data['type'] ?? 'class',
				'variants' => $class_data['variants'] ?? [],
			];

			if ( array_key_exists( 'sync_to_v3', $class_data ) ) {
				$item['sync_to_v3'] = (bool) $class_data['sync_to_v3'];
			}

			$items[ $class_id ] = $item;
		}

		return $items;
	}

	private function get_existing_class_posts(): array {
		return get_posts( [
			'post_type' => Global_Class_Post_Type::CPT,
			'post_status' => 'publish',
			'posts_per_page' => -1,
			'fields' => 'ids',
		] );
	}

	private function update_document_tracking(): void {
		$kit = $this->get_kit();

		if ( ! $kit ) {
			return;
		}

		$valid_class_ids = Global_Classes_Order::make( $kit )->get_order();

		if ( empty( $valid_class_ids ) ) {
			return;
		}

		$relations = new Global_Classes_Relations();

		Plugin::$instance->db->iterate_elementor_documents(
			function ( $document ) use ( $relations, $valid_class_ids ) {
				$post_id = $document->get_main_id();
				$used_class_ids = $relations->collect_class_ids_from_post( $post_id, $valid_class_ids );

				if ( ! empty( $used_class_ids ) ) {
					$relations->set_styles_for_post( $post_id, $used_class_ids );
				}
			}
		);
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
