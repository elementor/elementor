<?php

namespace Elementor\Modules\GlobalClasses\Database\Migrations;

use Elementor\Core\Database\Base_Migration;
use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Global_Class_Post;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Order;
use Elementor\Modules\GlobalClasses\Global_Classes_Post_IDs;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Utils\Global_Class_Data_Normalizer;
use Elementor\Modules\GlobalClasses\Utils\Kit_Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Ensures every kit on the site has a complete, exclusive _elementor_global_classes_post_ids map.
 *
 * Pass A — Kits that were never migrated (no order meta, but have the old aggregated meta):
 *           Runs the same migrate-to-posts logic that previously applied only to the active kit.
 *
 * Pass B — Kits that are already migrated but may be missing some entries in their post-id map
 *           (possible due to the old lazy-backfill being shared across kits):
 *           Fills in missing class_id → post_id entries using a conflict-aware resolver that
 *           never reuses a post_id already claimed by another kit.
 *
 * Pass C — Ensures no single post_id is referenced by more than one kit's map.
 *           For each shared post_id, the kit with the smallest ID is kept as the owner; all
 *           other ("loser") kits get a freshly created CPT post cloned from the current data.
 */
class Migrate_All_Kits_Post_IDs extends Base_Migration {

	public function up(): void {
		Global_Class_Post_Type::ensure_registered();

		$kits = Kit_Utils::get_all_kit_documents();

		if ( empty( $kits ) ) {
			return;
		}

		// Pass A: restructure kits that still use the old aggregate meta.
		$this->restructure_unmigrated_kits( $kits );

		// Pass B: fill any gaps in the post-id map for each kit.
		$claimed = $this->build_claimed_post_ids( $kits );
		$this->fill_missing_post_ids( $kits, $claimed );

		// Pass C: break any remaining sharing — one post_id must belong to exactly one kit.
		$this->deduplicate_shared_post_ids( $kits );
	}

	// -------------------------------------------------------------------------
	// Pass A
	// -------------------------------------------------------------------------

	/**
	 * @param Kit[] $kits
	 */
	private function restructure_unmigrated_kits( array $kits ): void {
		foreach ( $kits as $kit ) {
			$order = Global_Classes_Order::make( $kit )->set_preview( false )->get_order();

			if ( ! empty( $order ) ) {
				// Already migrated — skip.
				continue;
			}

			$aggregate = Migrate_To_Posts::get_aggregate_global_classes( $kit );

			if ( empty( $aggregate ) || empty( $aggregate['items'] ) ) {
				continue;
			}

			$raw_items = $aggregate['items'];
			$order     = $aggregate['order'] ?? array_keys( $raw_items );
			$items     = Global_Class_Data_Normalizer::normalize_styles( $raw_items );

			Global_Classes_Repository::make( $kit )->put( $items, $order );
		}
	}

	// -------------------------------------------------------------------------
	// Pass B
	// -------------------------------------------------------------------------

	/**
	 * Build the union of all post_ids already mapped by any kit on this site.
	 *
	 * @param Kit[] $kits
	 * @return array<int, true> post_id => true
	 */
	private function build_claimed_post_ids( array $kits ): array {
		$claimed = [];

		foreach ( $kits as $kit ) {
			$map = $this->read_post_ids_map( $kit );

			foreach ( $map as $post_id ) {
				$claimed[ (int) $post_id ] = true;
			}
		}

		return $claimed;
	}

	/**
	 * @param Kit[]            $kits
	 * @param array<int, true> $claimed  Mutable — updated as we resolve entries.
	 */
	private function fill_missing_post_ids( array $kits, array &$claimed ): void {
		foreach ( $kits as $kit ) {
			$order = Global_Classes_Order::make( $kit )->set_preview( false )->get_order();

			if ( empty( $order ) ) {
				continue;
			}

			$map     = $this->read_post_ids_map( $kit );
			$missing = array_diff( $order, array_keys( $map ) );

			if ( empty( $missing ) ) {
				continue;
			}

			$aggregate_items = Migrate_To_Posts::get_aggregate_global_classes( $kit )['items'] ?? [];
			$resolved        = [];

			foreach ( $missing as $class_id ) {
				$post_id = $this->resolve_post_id_for_class( $class_id, $kit, $aggregate_items, $claimed );

				if ( null !== $post_id ) {
					$resolved[ $class_id ] = $post_id;
					$claimed[ $post_id ]   = true;
				}
			}

			// Persist reused CPT entries. Entries created via Global_Class_Post::create() are
			// already written by that call, but set_many() is idempotent so it's safe to include them.
			if ( ! empty( $resolved ) ) {
				Global_Classes_Post_IDs::make( $kit )->set_many( $resolved );
			}
		}
	}

	/**
	 * Find or create a post_id for a class_id that belongs exclusively to $kit.
	 *
	 * Priority:
	 *  1. Find an existing CPT post for this class_id that is not yet claimed by any kit.
	 *  2. Create a fresh CPT post from the kit's aggregate data.
	 *  3. If no aggregate data exists, skip (returns null).
	 *
	 * @param string               $class_id
	 * @param ?Kit                 $kit
	 * @param array<string, array> $aggregate_items
	 * @param array<int, true>     $claimed  Passed by reference so the caller can mark reused ids.
	 * @return int|null
	 */
	private function resolve_post_id_for_class(
		string $class_id,
		?Kit $kit,
		array $aggregate_items,
		array &$claimed
	): ?int {
		// Try to reuse an unclaimed CPT post for this class_id.
		$candidates = $this->query_cpt_post_ids_for_class( $class_id );

		foreach ( $candidates as $candidate_id ) {
			if ( ! isset( $claimed[ $candidate_id ] ) ) {
				return $candidate_id;
			}
		}

		// All candidates are claimed (or there are none) — create a fresh post.
		if ( empty( $aggregate_items[ $class_id ] ) ) {
			// Nothing to create from; skip.
			return null;
		}

		$item = $aggregate_items[ $class_id ];
		$data = Global_Class_Data_Normalizer::normalize_style_fields( $item );

		$label = $item['label'] ?? $class_id;

		$created = Global_Class_Post::create( $class_id, $label, $data, $kit );

		if ( ! $created ) {
			return null;
		}

		return $created->get_post_id();
	}

	/**
	 * Query all published CPT post IDs that carry the given class_id, ordered ascending.
	 *
	 * @return int[]
	 */
	private function query_cpt_post_ids_for_class( string $class_id ): array {
		global $wpdb;

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$sql = $wpdb->prepare(
			"SELECT pm.post_id
			 FROM {$wpdb->postmeta} pm
			 INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
			 WHERE pm.meta_key = %s
			   AND pm.meta_value = %s
			   AND p.post_type = %s
			   AND p.post_status = %s
			 ORDER BY pm.post_id ASC",
			Global_Class_Post::META_KEY_ID,
			$class_id,
			Global_Class_Post_Type::CPT,
			'publish'
		);
		// phpcs:enable

		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- prepared above.
		$rows = $wpdb->get_col( $sql );

		return array_map( 'intval', $rows );
	}

	// -------------------------------------------------------------------------
	// Pass C
	// -------------------------------------------------------------------------

	/**
	 * @param Kit[] $kits
	 */
	private function deduplicate_shared_post_ids( array $kits ): void {
		// Build: post_id -> [(kit, class_id), ...]  sorted by kit ID asc (lowest = owner).
		$post_id_to_references = $this->build_post_id_reference_map( $kits );

		foreach ( $post_id_to_references as $post_id => $references ) {
			if ( count( $references ) <= 1 ) {
				continue;
			}

			// First reference (lowest kit ID) is the owner. All others are losers.
			$losers = array_slice( $references, 1 );

			$source_post = Global_Class_Post::from_post_id( $post_id, false );

			if ( ! $source_post ) {
				continue;
			}

			$source_data  = $source_post->get_data( true );
			$source_label = $source_post->get_label();

			foreach ( $losers as [ 'kit' => $loser_kit, 'class_id' => $class_id ] ) {
				$forked = Global_Class_Post::create( $class_id, $source_label, $source_data, null );

				if ( ! $forked ) {
					continue;
				}

				Global_Classes_Post_IDs::make( $loser_kit )->set( $class_id, $forked->get_post_id() );
			}
		}
	}

	/**
	 * Returns an array keyed by post_id. Each value is a list of references:
	 * [ ['kit' => Kit, 'class_id' => string], ... ]
	 * sorted by kit post ID ascending so index 0 is always the "owner".
	 *
	 * @param Kit[] $kits  Already sorted ascending by ID (Kit_Utils::get_all_kit_documents uses get_posts default order).
	 * @return array<int, array<int, array{kit: Kit, class_id: string}>>
	 */
	private function build_post_id_reference_map( array $kits ): array {
		// Sort kits ascending so the first reference is always the lowest-ID kit.
		usort( $kits, fn( $a, $b ) => $a->get_id() <=> $b->get_id() );

		$map = [];

		foreach ( $kits as $kit ) {
			$post_ids_map = $this->read_post_ids_map( $kit );

			foreach ( $post_ids_map as $class_id => $post_id ) {
				$post_id = (int) $post_id;

				$map[ $post_id ][] = [
					'kit'      => $kit,
					'class_id' => (string) $class_id,
				];
			}
		}

		return $map;
	}

	// -------------------------------------------------------------------------
	// Helpers
	// -------------------------------------------------------------------------

	/**
	 * Read the raw class_id -> post_id map stored on a kit's meta.
	 *
	 * @return array<string, int>
	 */
	private function read_post_ids_map( Kit $kit ): array {
		$raw = $kit->get_meta( Global_Classes_Post_IDs::META_KEY );

		return is_array( $raw ) ? $raw : [];
	}
}
