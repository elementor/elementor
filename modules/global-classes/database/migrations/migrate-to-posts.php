<?php

namespace Elementor\Modules\GlobalClasses\Database\Migrations;

use Elementor\Core\Database\Base_Migration;
use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Global_Class_Post;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Order;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Global_Classes_Relations;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Migrate_To_Posts extends Base_Migration {
	private ?Kit $kit = null;

	public function up() {
		$this->ensure_cpt_registered();

		$kit = $this->get_kit();
		if ( ! $kit ) {
			return;
		}

		$migrated = $this->migrate_global_classes_to_posts();

		if ( ! $migrated ) {
			return;
		}

		$this->update_document_tracking( $kit );

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

		$items = $global_classes['items'] ?? [];
		$order = $global_classes['order'] ?? array_keys( $items );

		$order_index = array_flip( $order );
		$created_order = [];

		foreach ( $items as $class_id => $class_data ) {
			$index = $order_index[ $class_id ] ?? 0;

			$post = Global_Class_Post::create(
				$class_id,
				$class_data['label'] ?? $class_id,
				[
					'type' => $class_data['type'] ?? 'class',
					'variants' => $class_data['variants'] ?? [],
				],
				$index
			);

			if ( $post ) {
				$created_order[ $index ] = $class_id;
			}
		}

		ksort( $created_order );
		Global_Classes_Order::make( $kit )->set_order( array_values( $created_order ) );

		return true;
	}

	private function get_existing_class_posts(): array {
		return get_posts( [
			'post_type' => Global_Class_Post_Type::CPT,
			'post_status' => 'publish',
			'posts_per_page' => -1,
			'fields' => 'ids',
		] );
	}

	private function update_document_tracking( Kit $kit ): void {
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

	private function get_kit(): ?Kit {
		if ( null !== $this->kit ) {
			return $this->kit;
		}

		$this->kit = Plugin::$instance->kits_manager->get_active_kit();

		return $this->kit;
	}
}
