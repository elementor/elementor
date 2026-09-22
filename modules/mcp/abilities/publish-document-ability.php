<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\History\Revisions_Manager;
use Elementor\Modules\Mcp\Abilities\Utils\Document_Mutation_Links;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Publish_Document_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/publish-document';
	}

	public function is_exposed_via_proxy(): bool {
		return false;
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Publish Elementor Document', 'elementor' ),
			__( 'Transitions an Elementor document (page, post, theme template, popup) to `publish` so it appears on the front end. Call this AFTER all element edits are complete. Edits via manage-elements or build-composition on published pages are staged in an autosave; calling this promotes the staged autosave to the live document. When there are no pending edits on an already-published document, the call is a no-op success.', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'post_id' => [ 'type' => 'integer' ],
					'status' => [ 'type' => 'string' ],
					'previous_status' => [ 'type' => 'string' ],
					'preview_url' => Document_Mutation_Links::preview_schema_property(),
					'llm_instructions' => Document_Mutation_Links::llm_instructions_schema_property(),
				],
			],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => true,
					'destructive' => true,
				],
			],
			function () {
				return current_user_can( 'edit_posts' );
			},
			[
				'type' => 'object',
				'required' => [ 'post_id' ],
				'properties' => [
					'post_id' => [
						'type' => 'integer',
						'description' => 'WordPress post ID of the Elementor document to publish.',
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$post_id = isset( $input['post_id'] ) ? absint( $input['post_id'] ) : 0;

		if ( ! $post_id ) {
			return new \WP_Error(
				'invalid_post_id',
				__( 'A valid post_id is required.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( wp_is_post_revision( $post_id ) ) {
			return new \WP_Error(
				'invalid_post_id',
				__( 'Revision IDs cannot be published. Pass the parent document ID.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			return new \WP_Error(
				'document_not_found',
				__( 'Document not found.', 'elementor' ),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		$main_id = $document->get_main_id();

		if ( ! current_user_can( 'publish_post', $main_id ) ) {
			return new \WP_Error(
				'rest_cannot_publish',
				__( 'Sorry, you are not allowed to publish this document.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		$previous_status = get_post_status( $main_id );

		$this->promote_pending_autosave( $main_id );

		if ( 'publish' !== $previous_status ) {
			$updated = wp_update_post(
				[
					'ID' => $main_id,
					'post_status' => 'publish',
				],
				true
			);

			if ( is_wp_error( $updated ) ) {
				return $updated;
			}
		}

		return $this->build_success_response( $document, get_post_status( $main_id ), $previous_status );
	}

	/**
	 * Promote the current user's pending autosave (created by MCP element writes on live posts)
	 * onto the main document, then discard the autosave slot — mirroring what the editor's own
	 * publish flow does in `Page\Manager::save`.
	 *
	 * Reuses `Revisions_Manager::restore_revision` so ALL `_elementor*` meta (data, page settings,
	 * CSS cache, etc.) is copied consistently and Post CSS is regenerated. Running before the
	 * `wp_update_post` status transition means listeners on `transition_post_status` (Post CSS,
	 * CDN purges, sitemaps, etc.) see the promoted content on the very same request.
	 */
	private function promote_pending_autosave( int $main_id ): void {
		$autosave_post = wp_get_post_autosave( $main_id, get_current_user_id() );

		if ( ! $autosave_post ) {
			return;
		}

		Revisions_Manager::restore_revision( $main_id, $autosave_post->ID );

		wp_delete_post_revision( $autosave_post->ID );
	}

	private function build_success_response( $document, string $status, string $previous_status ): array {
		return [
			'post_id' => (int) $document->get_main_id(),
			'status' => $status,
			'previous_status' => $previous_status,
		] + Document_Mutation_Links::for_document(
			$document,
			__( 'Document published.', 'elementor' )
		);
	}
}
