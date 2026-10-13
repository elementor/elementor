<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Core\Base\Document;
use Elementor\Core\Settings\Page\Manager as Page_Settings_Manager;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Document_Revision_Snapshots {

	// Must not start with `_elementor`: `DB::copy_elementor_meta` copies those keys from a revision back to its parent.
	const UNDO_POINT_META_KEY = '_mcp_undo_point';

	const RESTORABLE_META_KEYS = [
		Page_Settings_Manager::META_KEY,
		'_wp_page_template',
		Component_Document::OVERRIDABLE_PROPS_META_KEY,
		Component_Document::VARIANTS_META_KEY,
	];

	const LATEST_REVISIONS_SCAN_LIMIT = 10;

	public static function record( int $post_id, string $ability_id, callable $operation ): Snapshot_Recording {
		$main_id = self::resolve_main_id( $post_id );
		$saved_target_ids = [];
		$snapshot = null;

		$track_save = function ( Document $document ) use ( &$saved_target_ids ) {
			$saved_target_ids[ (int) $document->get_main_id() ] = (int) $document->get_post()->ID;
		};

		add_action( 'elementor/document/after_save', $track_save );

		try {
			$snapshot = $main_id ? self::capture( $main_id ) : null;
			$result = $operation();
		} catch ( \Throwable $e ) {
			self::discard( $snapshot );

			throw $e;
		} finally {
			remove_action( 'elementor/document/after_save', $track_save );
		}

		$saved_target_id = $saved_target_ids[ $main_id ] ?? 0;

		if ( ! $saved_target_id || self::is_unchanged( $saved_target_id, $snapshot ) ) {
			self::discard( $snapshot );

			return new Snapshot_Recording( $result, false, $main_id, null );
		}

		if ( $snapshot ) {
			update_metadata( 'post', $snapshot['revision_id'], self::UNDO_POINT_META_KEY, $ability_id );
		}

		return new Snapshot_Recording( $result, true, $main_id, $snapshot['revision_id'] ?? null );
	}

	public static function is_undo_point( int $revision_id ): bool {
		return metadata_exists( 'post', $revision_id, self::UNDO_POINT_META_KEY );
	}

	public static function restore_meta( int $from_post_id, int $to_post_id ): void {
		self::sync_meta( $from_post_id, $to_post_id, self::RESTORABLE_META_KEYS );
	}

	/**
	 * @return array{revision_id: int, is_new: bool}|null
	 */
	private static function capture( int $main_id ): ?array {
		$main_post = get_post( $main_id );

		if ( ! $main_post || ! wp_revisions_enabled( $main_post ) ) {
			return null;
		}

		$source = Plugin::$instance->documents->get_doc_or_auto_save( $main_id, get_current_user_id() );
		$source_id = $source ? (int) $source->get_post()->ID : $main_id;

		$latest_revision_id = self::find_latest_revision_id( $main_id );

		if ( $latest_revision_id && self::has_same_content( $source_id, $latest_revision_id ) ) {
			return [
				'revision_id' => $latest_revision_id,
				'is_new' => false,
			];
		}

		$revision_id = self::create_revision( $main_id, $source_id );

		if ( ! $revision_id ) {
			return null;
		}

		return [
			'revision_id' => $revision_id,
			'is_new' => true,
		];
	}

	private static function create_revision( int $main_id, int $source_id ): int {
		// Its own closure, so removing it can't also remove the `__return_false` that `Revisions_Manager` adds to this filter.
		$force_revision = fn() => false;

		add_filter( 'wp_save_post_revision_check_for_changes', $force_revision );

		try {
			$revision_id = wp_save_post_revision( $main_id );
		} finally {
			remove_filter( 'wp_save_post_revision_check_for_changes', $force_revision );
		}

		if ( ! $revision_id || is_wp_error( $revision_id ) ) {
			return 0;
		}

		if ( $source_id !== $main_id ) {
			Plugin::$instance->db->copy_elementor_meta( $source_id, $revision_id );
		}

		self::sync_meta( $source_id, $revision_id, self::RESTORABLE_META_KEYS );

		return (int) $revision_id;
	}

	private static function discard( ?array $snapshot ): void {
		if ( empty( $snapshot['is_new'] ) ) {
			return;
		}

		wp_delete_post_revision( $snapshot['revision_id'] );
	}

	private static function is_unchanged( int $saved_target_id, ?array $snapshot ): bool {
		return $snapshot && self::has_same_content( $saved_target_id, $snapshot['revision_id'] );
	}

	private static function find_latest_revision_id( int $main_id ): int {
		$revision_ids = wp_get_post_revisions( $main_id, [
			'posts_per_page' => self::LATEST_REVISIONS_SCAN_LIMIT,
			'orderby' => 'ID',
			'order' => 'DESC',
			'fields' => 'ids',
		] );

		foreach ( $revision_ids as $revision_id ) {
			if ( ! wp_is_post_autosave( $revision_id ) ) {
				return (int) $revision_id;
			}
		}

		return 0;
	}

	private static function has_same_content( int $post_id, int $revision_id ): bool {
		$compared_keys = array_merge( [ Document::ELEMENTOR_DATA_META_KEY ], self::RESTORABLE_META_KEYS );

		foreach ( $compared_keys as $meta_key ) {
			if ( get_metadata( 'post', $post_id, $meta_key, true ) !== get_metadata( 'post', $revision_id, $meta_key, true ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Unlike `DB::copy_elementor_meta`, keys missing on the source are deleted, and every value is slashed
	 * so meta containing backslashes (custom CSS, component JSON) survives `update_metadata`.
	 */
	private static function sync_meta( int $from_post_id, int $to_post_id, array $meta_keys ): void {
		foreach ( $meta_keys as $meta_key ) {
			if ( ! metadata_exists( 'post', $from_post_id, $meta_key ) ) {
				delete_metadata( 'post', $to_post_id, $meta_key );
				continue;
			}

			update_metadata( 'post', $to_post_id, $meta_key, wp_slash( get_metadata( 'post', $from_post_id, $meta_key, true ) ) );
		}
	}

	private static function resolve_main_id( int $post_id ): int {
		$document = $post_id > 0 ? Plugin::$instance->documents->get( $post_id ) : null;

		return $document ? (int) $document->get_main_id() : 0;
	}
}
