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
	 * @return Document|\WP_Error The undo point's document.
	 */
	public function resolve_undo_point( Document $document, int $revision_id ) {
		$revision = wp_get_post_revision( $revision_id );
		$revision_document = $revision ? Plugin::$instance->documents->get( $revision_id ) : null;

		if ( ! $revision_document ) {
			return new \WP_Error( 'revision_not_found', __( 'Revision not found.', 'elementor' ), [ 'status' => \WP_Http::NOT_FOUND ] );
		}

		if ( (int) $revision->post_parent !== (int) $document->get_main_id() ) {
			return $this->bad_request( 'revision_mismatch', __( 'This revision does not belong to the given post_id.', 'elementor' ) );
		}

		if ( ! Document_Revision_Snapshots::is_undo_point( $revision_id ) ) {
			return $this->bad_request( 'not_an_undo_point', __( 'Only MCP undo points can be restored. Pass an undo_revision_id returned by a previous MCP call.', 'elementor' ) );
		}

		return $revision_document;
	}

	/**
	 * Restores the undo point through the staged save path: published documents receive it in the current user's autosave.
	 *
	 * @return Document|\WP_Error The document that was written.
	 */
	public function restore( Document $document, Document $undo_point_document ) {
		try {
			$target = Document_Mutation_Save::elements_preserving_live_status(
				$this->mutator,
				$document,
				$undo_point_document->get_json_meta( Document::ELEMENTOR_DATA_META_KEY )
			);
		} catch ( \Throwable $e ) {
			return new \WP_Error( 'restore_failed', $e->getMessage(), [ 'status' => \WP_Http::UNPROCESSABLE_ENTITY ] );
		}

		if ( is_wp_error( $target ) ) {
			return $target;
		}

		// Synced only after a successful save, so a save that throws leaves the document untouched.
		Document_Revision_Snapshots::restore_meta( (int) $undo_point_document->get_post()->ID, (int) $target->get_post()->ID );

		return $target;
	}

	private function bad_request( string $code, string $message ): \WP_Error {
		return new \WP_Error( $code, $message, [ 'status' => \WP_Http::BAD_REQUEST ] );
	}
}
