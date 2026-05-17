<?php

namespace Elementor\Modules\GlobalClasses\Database\Migrations;

use Elementor\Core\Database\Base_Migration;
use Elementor\Core\Upgrade\Manager;
use Elementor\Modules\GlobalClasses\Concerns\Has_Kit_Dependency;
use Elementor\Modules\GlobalClasses\Global_Class_Post;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Labels;
use Elementor\Modules\GlobalClasses\Global_Classes_Order;
use Elementor\Modules\GlobalClasses\Utils\Global_Class_Data_Normalizer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Reconciles global class posts for users who already ran the posts migration.
 *
 * Upgrade states:
 * - A: still on legacy structure, handled by `Migrate_To_Posts` (which now sets an initial edit timestamp).
 * - B: upgraded, downgraded to legacy, then edited legacy classes.
 * - C: upgraded and kept editing classes in posts.
 *
 * B and C already have DB version 2, so they skip `Migrate_To_Posts`.
 * This migration aligns legacy kit meta with class posts when a site shows
 * document saves on a build older than the post-storage intro (see
 * `should_overwrite_existing_posts_from_legacy`); otherwise existing CPT rows
 * are left as the source of truth.
 */
class Reconcile_Downgraded_Posts extends Base_Migration {
	use Has_Kit_Dependency;

	private const LEGACY_EDIT_SIGNAL_QUERY_LIMIT = 200;

	private const POST_STORAGE_INTRO_VERSION = '4.1.0';

	private $should_overwrite_existing_from_legacy = null;

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

			if ( $post->has_edit_timestamp() ) {
				// Skip posts already went through the updated migration
				continue;
			}

			if ( ! $this->should_overwrite_existing_posts_from_legacy() ) {
				continue;
			}

			$normalized_data = Global_Class_Data_Normalizer::normalize_style_fields( $normalized_item );
			$post->update_data( $normalized_data );
			$post->update_label( $normalized_item['label'] );
			$touched_any = true;
		}

		return $touched_any;
	}

	private function should_overwrite_existing_posts_from_legacy(): bool {
		if ( null !== $this->should_overwrite_existing_from_legacy ) {
			return $this->should_overwrite_existing_from_legacy;
		}

		$history = Manager::get_installs_history();
		$intro_ts = $history[ self::POST_STORAGE_INTRO_VERSION ] ?? null;

		if ( ! $intro_ts ) {
			$this->should_overwrite_existing_from_legacy = true;

			return true;
		}

		global $wpdb;

		$cutoff = gmdate( 'Y-m-d H:i:s', (int) $intro_ts );
		$cpt = Global_Class_Post_Type::CPT;

		$versions = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT pm.meta_value
				FROM {$wpdb->postmeta} pm
				INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
					AND p.post_type <> %s
				WHERE pm.meta_key = '_elementor_version'
					AND pm.meta_value <> %s
					AND p.post_modified_gmt > %s
				LIMIT %d",
				$cpt,
				self::POST_STORAGE_INTRO_VERSION,
				$cutoff,
				self::LEGACY_EDIT_SIGNAL_QUERY_LIMIT
			)
		);

		foreach ( $versions as $version ) {
			if ( ! is_string( $version ) || '' === $version ) {
				continue;
			}

			if ( version_compare( $version, self::POST_STORAGE_INTRO_VERSION, '<' ) ) {
				$this->should_overwrite_existing_from_legacy = true;

				return true;
			}
		}

		$this->should_overwrite_existing_from_legacy = false;

		return false;
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
