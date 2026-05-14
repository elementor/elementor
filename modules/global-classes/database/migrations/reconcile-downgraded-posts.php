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
		$kit = $this->get_kit();

		if ( ! $kit ) {
			return;
		}

		Global_Class_Post_Type::ensure_registered();

		$legacy = $kit->get_json_meta( Global_Classes_Repository::META_KEY_FRONTEND );

		if ( empty( $legacy ) || empty( $legacy['items'] ) ) {
			return;
		}

		$items = Global_Class_Data_Normalizer::normalize_styles( $legacy['items'] );
		$order = $legacy['order'] ?? array_keys( $items );

		$touched_any = false;

		foreach ( $items as $class_id => $item ) {
			$post = Global_Class_Post::find_by_class_id( $class_id, false );

			if ( ! $post ) {
				$created = Global_Class_Post::create( $class_id, $item['label'], $this->storage_data( $item ) );

				if ( $created ) {
					$touched_any = true;
				}

				continue;
			}

			if ( $this->cpt_was_actively_edited( $post ) ) {
				continue;
			}

			$post->update_data( $this->storage_data( $item ) );
			$post->update_label( $item['label'] );
			$touched_any = true;
		}

		if ( ! $touched_any ) {
			return;
		}

		$legacy_ids = array_keys( $items );
		$current_order = Global_Classes_Order::make( $kit )->get_order();
		$merged_order = array_values( array_unique( array_merge( $order, array_diff( $current_order, $legacy_ids ) ) ) );

		Global_Classes_Order::make( $kit )->set_order( $merged_order );

		$label_map = Global_Classes_Labels::make( $kit )->get_labels();

		foreach ( $merged_order as $id ) {
			$class_post = Global_Class_Post::find_by_class_id( $id, false );

			if ( $class_post && $this->cpt_was_actively_edited( $class_post ) ) {
				$label_map[ $id ] = $class_post->get_label();
			} elseif ( isset( $items[ $id ] ) ) {
				$label_map[ $id ] = $items[ $id ]['label'];
			}
		}

		Global_Classes_Labels::make( $kit )->set_labels( $label_map );

		Migrate_To_Posts::run_document_tracking( $kit );
	}

	private function cpt_was_actively_edited( Global_Class_Post $post ): bool {
		return $post->was_edited();
	}

	private function storage_data( array $item ): array {
		return Global_Class_Data_Normalizer::normalize_style_fields( $item );
	}
}
