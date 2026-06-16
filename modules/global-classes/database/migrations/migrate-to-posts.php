<?php

namespace Elementor\Modules\GlobalClasses\Database\Migrations;

use Elementor\Core\Database\Base_Migration;
use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Concerns\Has_Kit_Dependency;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Order;
use Elementor\Modules\GlobalClasses\Global_Classes_Relations;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Utils\Global_Class_Data_Normalizer;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Migrate_To_Posts extends Base_Migration {
	use Has_Kit_Dependency;

	public function up() {
		Global_Class_Post_Type::ensure_registered();

		$migrated = $this->migrate_global_classes_to_posts();

		if ( ! $migrated ) {
			return;
		}

		self::run_document_tracking( $this->get_kit() );

		// We'll comment it out for now as we may prefer to avoid data restoration upon downgrading
		// $this->cleanup_kit_meta();
	}

	private function migrate_global_classes_to_posts(): bool {
		$kit = $this->get_kit();
		if ( ! $kit ) {
			return false;
		}

		$global_classes = self::get_aggregate_global_classes( $kit );

		if ( empty( $global_classes ) || empty( $global_classes['items'] ) ) {
			return false;
		}

		$existing_posts = $this->get_existing_class_posts();

		if ( ! empty( $existing_posts ) ) {
			return false;
		}

		$raw_items = $global_classes['items'];
		$order = $global_classes['order'] ?? array_keys( $raw_items );

		$items = Global_Class_Data_Normalizer::normalize_styles( $raw_items );

		Global_Classes_Repository::make( $kit )->put( $items, $order );

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

	public static function get_aggregate_global_classes( ?Kit $kit = null ): array {
		$empty_result = [
			'items' => [],
			'order' => [],
		];

		if ( ! $kit ) {
			return $empty_result;
		}

		return $kit->get_json_meta( Global_Classes_Repository::META_KEY_FRONTEND ) ?? $empty_result;
	}

	public static function run_document_tracking( ?Kit $kit ): void {
		if ( ! $kit ) {
			return;
		}

		$valid_class_ids = Global_Classes_Order::make( $kit )->set_preview( false )->get_order();

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
