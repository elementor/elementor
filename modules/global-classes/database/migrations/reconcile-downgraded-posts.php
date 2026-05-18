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
 * - A: still on aggregate structure, handled by `Migrate_To_Posts` (which now sets an initial edit timestamp).
 * - B: upgraded, downgraded to the aggregated structure, then edited classes.
 * - C: upgraded and kept editing classes in posts.
 *
 * B and C already have DB version 2, so they skip `Migrate_To_Posts`.
 * This migration aligns aggregate kit meta with class posts, for group B
 */
class Reconcile_Downgraded_Posts extends Base_Migration {
	use Has_Kit_Dependency;

	private const QUERY_LIMIT = 10; // Just a safety measurement to make sure we have a big-enough sample size of new edits' versions

	private const POST_STORAGE_INTRO_VERSION = '4.1.0';

	private $should_overwrite = null;

	public function up() {
		Global_Class_Post_Type::ensure_registered();

		$kit = $this->get_kit();

		if ( ! $kit ) {
			return;
		}

		$aggregate = Migrate_To_Posts::get_aggregate_global_classes( $kit );

		if ( empty( $aggregate ) || empty( $aggregate['items'] ) ) {
			return;
		}

		$items = Global_Class_Data_Normalizer::normalize_styles( $aggregate['items'] );
		$order = $aggregate['order'] ?? array_keys( $items );

		$touched_any = $this->reconcile_posts( $items );

		if ( ! $touched_any ) {
			return;
		}

		$this->sync_order_and_labels( $kit, $items, $order );

		Migrate_To_Posts::run_document_tracking( $kit );
	}

	private function reconcile_posts( array $items ): bool {
		$post_map = $this->build_post_map( $items );

		if ( null === $post_map ) {
			return false;
		}

		if ( ! $this->should_overwrite_existing_posts() ) {
			return false;
		}

		return $this->apply_reconciliation( $items, $post_map );
	}

	/**
	 * @return array<string, Global_Class_Post|null>|null Null when a Group A post is detected (edit timestamp found).
	 */
	private function build_post_map( array $items ): ?array {
		$post_map = [];

		foreach ( $items as $class_id => $item ) {
			$post = Global_Class_Post::find_by_class_id( $class_id, false );

			if ( $post && $post->has_edit_timestamp() ) {
				$this->set_should_overwrite( false );

				return null;
			}

			$post_map[ $class_id ] = $post;
		}

		return $post_map;
	}

	private function apply_reconciliation( array $items, array $post_map ): bool {
		$touched_any = false;

		foreach ( $items as $class_id => $item ) {
			$post = $post_map[ $class_id ];
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

			$normalized_data = Global_Class_Data_Normalizer::normalize_style_fields( $normalized_item );
			$post->update_data( $normalized_data );
			$post->update_label( $normalized_item['label'] );
			$touched_any = true;
		}

		return $touched_any;
	}

	private function set_should_overwrite( bool $should_overwrite ): void {
		$this->should_overwrite = $should_overwrite;
	}

	private function should_overwrite_existing_posts(): bool {
		if ( null !== $this->should_overwrite ) {
			return $this->should_overwrite;
		}

		$history = Manager::get_installs_history();
		$intro_ts = $history[ self::POST_STORAGE_INTRO_VERSION ] ?? null;

		if ( ! $intro_ts ) {
			$this->set_should_overwrite( true );

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
				ORDER BY pm.meta_value ASC
				LIMIT %d",
				$cpt,
				self::POST_STORAGE_INTRO_VERSION,
				$cutoff,
				self::QUERY_LIMIT
			)
		);

		foreach ( $versions as $version ) {
			if ( ! is_string( $version ) || '' === $version ) {
				continue;
			}

			if ( version_compare( $version, self::POST_STORAGE_INTRO_VERSION, '<' ) ) {
				$this->should_overwrite = true;

				return true;
			}
		}

		$this->set_should_overwrite( false );

		return false;
	}

	private function sync_order_and_labels( $kit, array $items, array $order ): void {
		$aggregated_ids = array_keys( $items );
		$current_order = Global_Classes_Order::make( $kit )->get_order();
		$merged_order = array_values( array_unique( array_merge( $order, array_diff( $current_order, $aggregated_ids ) ) ) );

		Global_Classes_Order::make( $kit )->set_order( $merged_order );

		$labels = Global_Classes_Labels::make( $kit );
		$label_map = $labels->get_labels();
		$label_to_id = array_flip( $label_map );

		foreach ( $merged_order as $id ) {
			$class_post = Global_Class_Post::find_by_class_id( $id, false );

			if ( $class_post && $class_post->was_edited() ) {
				$candidate = $class_post->get_label();
			} elseif ( isset( $items[ $id ] ) ) {
				$candidate = $items[ $id ]['label'];
			} else {
				continue;
			}

			// Original style using the current style's label
			$owner_id = $label_to_id[ $candidate ] ?? null;

			if ( $owner_id === $id ) {
				continue;
			}

			if ( null !== $owner_id ) {
				// Duplicate label - generate a unique one
				$candidate = Global_Classes_Labels::generate_unique_label( $candidate, array_values( $label_map ) );
			}

			if ( $class_post && $class_post->get_label() !== $candidate ) {
				$class_post->update_label( $candidate );
			}

			unset( $label_to_id[ $label_map[ $id ] ?? '' ] );
			$label_map[ $id ] = $candidate;
			$label_to_id[ $candidate ] = $id;
		}

		$labels->set_labels( $label_map );
	}
}
