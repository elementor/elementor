<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Document\Document_Mutator;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Revision_Restorer {

	private Document_Mutator $mutator;

	public function __construct( Document_Mutator $mutator ) {
		$this->mutator = $mutator;
	}

	/**
	 * Restores an MCP undo point onto the document through the staged save path:
	 * published documents receive it in the current user's autosave.
	 *
	 * @return Document|\WP_Error|null The document that was written, or null when it already matched the undo point and nothing was written.
	 */
	public function restore_undo_point( Document $document, int $revision_id ) {
		$main_id = (int) $document->get_main_id();
		$revision_document = $this->resolve_undo_point( $main_id, $revision_id );

		if ( is_wp_error( $revision_document ) ) {
			return $revision_document;
		}

		if ( Document_Revision_Snapshots::matches_current_state( $main_id, $revision_id ) ) {
			return null;
		}

		try {
			$target = Document_Mutation_Save::elements_preserving_live_status(
				$this->mutator,
				$document,
				$revision_document->get_json_meta( Document::ELEMENTOR_DATA_META_KEY )
			);
		} catch ( \Throwable $e ) {
			return new \WP_Error( 'restore_failed', $e->getMessage(), [ 'status' => \WP_Http::UNPROCESSABLE_ENTITY ] );
		}

		if ( is_wp_error( $target ) ) {
			return $target;
		}

		// Synced only after a successful save, so a save that throws leaves the document untouched.
		Document_Revision_Snapshots::restore_meta( $revision_id, (int) $target->get_post()->ID );

		return $target;
	}

	/**
	 * @return Document|\WP_Error
	 */
	private function resolve_undo_point( int $main_id, int $revision_id ) {
		$revision = wp_get_post_revision( $revision_id );

		if ( ! $revision ) {
			return new \WP_Error( 'revision_not_found', __( 'Revision not found.', 'elementor' ), [ 'status' => \WP_Http::NOT_FOUND ] );
		}

		if ( (int) $revision->post_parent !== $main_id ) {
			return $this->bad_request( 'revision_mismatch', __( 'This revision does not belong to the given post_id.', 'elementor' ) );
		}

		if ( wp_is_post_autosave( $revision ) ) {
			return $this->bad_request( 'autosave_not_restorable', __( 'Autosaves cannot be restored.', 'elementor' ) );
		}

		if ( ! Document_Revision_Snapshots::is_undo_point( $revision_id ) ) {
			return $this->bad_request( 'not_an_undo_point', __( 'Only MCP undo points can be restored. Pass an undo_revision_id returned by a previous MCP call.', 'elementor' ) );
		}

		$revision_document = Plugin::$instance->documents->get( $revision_id );

		if ( ! $revision_document || ! $revision_document->is_built_with_elementor() ) {
			return $this->bad_request( 'revision_not_built_with_elementor', __( 'This revision was not built with Elementor, so it cannot be restored here.', 'elementor' ) );
		}

		return $revision_document;
	}

	private function bad_request( string $code, string $message ): \WP_Error {
		return new \WP_Error( $code, $message, [ 'status' => \WP_Http::BAD_REQUEST ] );
	}
}
