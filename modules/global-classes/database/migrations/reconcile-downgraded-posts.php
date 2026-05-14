<?php

namespace Elementor\Modules\GlobalClasses\Database\Migrations;

use Elementor\Core\Database\Base_Migration;
use Elementor\Modules\GlobalClasses\Concerns\Has_Kit_Dependency;
use Elementor\Modules\GlobalClasses\Global_Class_Post;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Labels;
use Elementor\Modules\GlobalClasses\Global_Classes_Order;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Utils\Global_Class_Data_Normalizer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Reconcile_Downgraded_Posts extends Base_Migration {
	use Has_Kit_Dependency;

	public function up() {
		Global_Class_Post_Type::ensure_registered();

		$kit = $this->get_kit();

		if ( ! $kit ) {
			return;
		}

		$legacy = Migrate_To_Posts::get_legacy_global_classes( $kit );

		if ( empty( $legacy ) || empty( $legacy['items'] ) ) {
			return;
		}

		$items = Global_Class_Data_Normalizer::normalize_styles( $legacy['items'] );
		$order = $legacy['order'] ?? array_keys( $items );

		$touched_any = $this->reconcile_posts( $items );

		if ( ! $touched_any ) {
			return;
		}

		$this->sync_order_and_labels( $kit, $items, $order );

		Migrate_To_Posts::run_document_tracking( $kit );
	}

	private function reconcile_posts( array $items ): bool {
		$touched_any = false;

		foreach ( $items as $class_id => $item ) {
			$post = Global_Class_Post::find_by_class_id( $class_id, false );
			$normalized_item = Global_Class_Data_Normalizer::normalize_style( $class_id, $item );

			if ( ! $post ) {
				$created = Global_Class_Post::create(
					$normalized_item['id'],
					$normalized_item['label'],
					$normalized_item
				);

				if ( $created ) {
					$touched_any = true;
				}

				continue;
			}

			if ( $post->was_edited() ) {
				continue;
			}

			$normalized_data = Global_Class_Data_Normalizer::normalize_style_fields( $normalized_item );
			$post->update_data( $normalized_data );
			$post->update_label( $normalized_item['label'] );
			$touched_any = true;
		}

		return $touched_any;
	}

	private function sync_order_and_labels( $kit, array $items, array $order ): void {
		$legacy_ids = array_keys( $items );
		$current_order = Global_Classes_Order::make( $kit )->get_order();
		$merged_order = array_values( array_unique( array_merge( $order, array_diff( $current_order, $legacy_ids ) ) ) );

		Global_Classes_Order::make( $kit )->set_order( $merged_order );

		$label_map = Global_Classes_Labels::make( $kit )->get_labels();

		foreach ( $merged_order as $id ) {
			$class_post = Global_Class_Post::find_by_class_id( $id, false );

			if ( $class_post && $class_post->was_edited() ) {
				$label_map[ $id ] = $class_post->get_label();
			} elseif ( isset( $items[ $id ] ) ) {
				$label_map[ $id ] = $items[ $id ]['label'];
			}
		}

		Global_Classes_Labels::make( $kit )->set_labels( $label_map );
	}
}
