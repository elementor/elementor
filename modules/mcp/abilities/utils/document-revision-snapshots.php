<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Core\Base\Document;
use Elementor\Core\Settings\Page\Manager as Page_Settings_Manager;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Mcp\Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Document_Revision_Snapshots {

	// Must not start with `_elementor`: `DB::copy_elementor_meta` copies those keys from a revision back to its parent.
	const UNDO_POINT_META_KEY = '_mcp_undo_point';

	// Besides `_elementor_data`, the meta an MCP write can change: page settings and their page template, and a
	// component's overridable props and variants. Other `_elementor_*` meta (CSS, version, edit mode) is rebuilt on save.
	const RESTORABLE_META_KEYS = [
		Page_Settings_Manager::META_KEY,
		'_wp_page_template',
		Component_Document::OVERRIDABLE_PROPS_META_KEY,
		Component_Document::VARIANTS_META_KEY,
	];

	// `Components_Repository::publish_component()` copies these from the autosave with `copy_elementor_meta`, which skips
	// missing keys, so they are emptied instead of deleted. `get_json_meta()` reads an empty value as no props or variants.
	const EMPTIED_NOT_DELETED_META_KEYS = [
		Component_Document::OVERRIDABLE_PROPS_META_KEY,
		Component_Document::VARIANTS_META_KEY,
	];

	const LATEST_REVISIONS_SCAN_LIMIT = 10;

	public static function capture( Document $document, string $ability_id ): ?Undo_Point {
		if ( ! Module::is_revision_snapshots_active() ) {
			return null;
		}

		$main_id = (int) $document->get_main_id();
		$snapshot = self::capture_revision( $main_id );

		return new Undo_Point( $main_id, $ability_id, $snapshot['revision_id'] ?? null, ! empty( $snapshot['is_new'] ) );
	}

	public static function is_undo_point( int $revision_id ): bool {
		return metadata_exists( 'post', $revision_id, self::UNDO_POINT_META_KEY );
	}

	public static function restore_meta( int $from_post_id, int $to_post_id ): void {
		self::sync_meta( $from_post_id, $to_post_id, self::RESTORABLE_META_KEYS );
	}

	public static function matches_current_state( int $main_id, int $revision_id ): bool {
		return self::has_same_content( self::resolve_current_state_id( $main_id ), $revision_id );
	}

	/**
	 * @return array{revision_id: int, is_new: bool}|null
	 */
	private static function capture_revision( int $main_id ): ?array {
		$main_post = get_post( $main_id );

		if ( ! $main_post || ! wp_revisions_enabled( $main_post ) ) {
			return null;
		}

		$source_id = self::resolve_current_state_id( $main_id );

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
		if ( self::get_elements( $post_id ) !== self::get_elements( $revision_id ) ) {
			return false;
		}

		foreach ( self::RESTORABLE_META_KEYS as $meta_key ) {
			if ( get_metadata( 'post', $post_id, $meta_key, true ) !== get_metadata( 'post', $revision_id, $meta_key, true ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * A post that was never saved with Elementor has no `_elementor_data` row, which is the same as an empty tree.
	 */
	private static function get_elements( int $post_id ): array {
		$elements = json_decode( (string) get_metadata( 'post', $post_id, Document::ELEMENTOR_DATA_META_KEY, true ), true );

		return is_array( $elements ) ? $elements : [];
	}

	/**
	 * Unlike `DB::copy_elementor_meta`, keys missing on the source are deleted, and every value is slashed
	 * so meta containing backslashes (custom CSS, component JSON) survives `update_metadata`.
	 */
	private static function sync_meta( int $from_post_id, int $to_post_id, array $meta_keys ): void {
		foreach ( $meta_keys as $meta_key ) {
			if ( ! metadata_exists( 'post', $from_post_id, $meta_key ) ) {
				self::clear_meta( $to_post_id, $meta_key );
				continue;
			}

			update_metadata( 'post', $to_post_id, $meta_key, wp_slash( get_metadata( 'post', $from_post_id, $meta_key, true ) ) );
		}
	}

	private static function clear_meta( int $post_id, string $meta_key ): void {
		if ( ! metadata_exists( 'post', $post_id, $meta_key ) ) {
			return;
		}

		if ( in_array( $meta_key, self::EMPTIED_NOT_DELETED_META_KEYS, true ) ) {
			update_metadata( 'post', $post_id, $meta_key, '' );

			return;
		}

		delete_metadata( 'post', $post_id, $meta_key );
	}

	private static function resolve_current_state_id( int $main_id ): int {
		$source = Plugin::$instance->documents->get_doc_or_auto_save( $main_id, get_current_user_id() );

		return $source ? (int) $source->get_post()->ID : $main_id;
	}
}
