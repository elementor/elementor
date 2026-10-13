<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Document\Document_Mutator;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Mcp\Abilities\Utils\Document_Mutation_Links;
use Elementor\Modules\Mcp\Abilities\Utils\Revision_Restorer;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Manage_Revisions_Ability extends Abstract_Ability {

	const ACTION_RESTORE = 'restore';

	const ACTIONS = [ self::ACTION_RESTORE ];

	private ?Document_Mutator $mutator;

	public function __construct( ?Document_Mutator $mutator = null ) {
		$this->mutator = $mutator;
	}

	protected function get_ability_id(): string {
		return 'elementor/manage-revisions';
	}

	public function is_exposed_via_proxy(): bool {
		return false;
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Manage Elementor Revisions', 'elementor' ),
			__( 'Undoes MCP changes to an Elementor document (page, post, template, component). Every MCP write tool returns an undo_revision_id holding the document state from before that change; action=restore with that revision_id brings back that state: the element tree, page settings and component overridable props. A restore replaces the whole document with that state, so every change made after it (including unrelated settings) is discarded; to undo several changes, restore the undo_revision_id of the earliest one. On published documents the restore is staged in a draft copy like other MCP edits: pages stay unchanged until you call elementor/publish-document, and components until you call elementor/manage-component with action=publish. The response returns a new undo_revision_id; restore it to redo the change you just undid. When the document already matches the undo point, nothing is changed (changed=false). Only undo_revision_id values returned by MCP calls can be restored, and WordPress revision limits can remove old ones (the restore then returns "Revision not found").', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'post_id' => [ 'type' => 'integer' ],
					'restored_revision_id' => [ 'type' => 'integer' ],
					'changed' => [
						'type' => 'boolean',
						'description' => 'False when the document already matched the undo point and nothing was written.',
					],
					'staged' => [
						'type' => 'boolean',
						'description' => 'True when the restore was written to a draft copy of a published document and still needs publishing to go live.',
					],
					'preview_url' => Document_Mutation_Links::preview_schema_property(),
					'edit_url' => [
						'type' => 'string',
						'format' => 'uri',
						'description' => 'Elementor editor URL, returned instead of preview_url for documents without a front-end preview (e.g. components).',
					],
					'llm_instructions' => Document_Mutation_Links::llm_instructions_schema_property(),
					'undo_revision_id' => Document_Mutation_Links::undo_revision_id_schema_property(),
				],
			],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => false,
					'destructive' => true,
				],
			],
			fn() => current_user_can( 'edit_posts' ),
			[
				'type' => 'object',
				'required' => [ 'action', 'post_id' ],
				'properties' => [
					'action' => [
						'type' => 'string',
						'enum' => self::ACTIONS,
					],
					'post_id' => [
						'type' => 'integer',
						'description' => 'WordPress post ID of the Elementor document.',
					],
					'revision_id' => [
						'type' => 'integer',
						'description' => 'restore: an undo_revision_id returned by a previous MCP call for this post_id.',
					],
				],
			]
		);
	}

	public function get_snapshot_post_id( array $input ): int {
		if ( self::ACTION_RESTORE !== ( $input['action'] ?? null ) ) {
			return 0;
		}

		return isset( $input['post_id'] ) ? absint( $input['post_id'] ) : 0;
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];

		switch ( $input['action'] ?? null ) {
			case self::ACTION_RESTORE:
				return $this->handle_restore( $input );
		}

		return $this->invalid_input(
			sprintf(
				/* translators: %s: Comma-separated list of supported actions. */
				__( 'action must be one of: %s.', 'elementor' ),
				implode( ', ', self::ACTIONS )
			)
		);
	}

	private function handle_restore( array $input ) {
		$post_id = isset( $input['post_id'] ) ? absint( $input['post_id'] ) : 0;
		$revision_id = isset( $input['revision_id'] ) ? absint( $input['revision_id'] ) : 0;

		if ( ! $post_id || ! $revision_id ) {
			return $this->invalid_input( __( 'restore requires post_id and revision_id.', 'elementor' ) );
		}

		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			return new \WP_Error( 'document_not_found', __( 'Document not found.', 'elementor' ), [ 'status' => \WP_Http::NOT_FOUND ] );
		}

		$main_id = (int) $document->get_main_id();

		if ( ! current_user_can( 'edit_post', $main_id ) ) {
			return new \WP_Error( 'rest_cannot_edit', __( 'Sorry, you are not allowed to edit this document.', 'elementor' ), [ 'status' => \WP_Http::FORBIDDEN ] );
		}

		$target = ( new Revision_Restorer( $this->get_mutator() ) )->restore_undo_point( $document, $revision_id );

		if ( is_wp_error( $target ) ) {
			return $target;
		}

		if ( null === $target ) {
			return [
				'post_id' => $main_id,
				'restored_revision_id' => $revision_id,
				'changed' => false,
				'staged' => false,
				'llm_instructions' => __( 'The document already matches this undo point, so nothing was changed.', 'elementor' ),
			];
		}

		$is_staged = (int) $target->get_post()->ID !== $main_id;

		return [
			'post_id' => $main_id,
			'restored_revision_id' => $revision_id,
			'changed' => true,
			'staged' => $is_staged,
		] + Document_Mutation_Links::for_document( $document, $this->get_restore_message( $document, $is_staged ) );
	}

	private function get_restore_message( Document $document, bool $is_staged ): string {
		if ( ! $is_staged ) {
			return __( 'Revision restored.', 'elementor' );
		}

		if ( $document instanceof Component_Document ) {
			return __( 'Revision restored to a draft copy of the component. Pages using it are unchanged until you call elementor/manage-component with action=publish.', 'elementor' );
		}

		return __( 'Revision restored to a draft copy. The live page is unchanged until you call elementor/publish-document.', 'elementor' );
	}

	private function invalid_input( string $message ): \WP_Error {
		return new \WP_Error( 'invalid_input', $message, [ 'status' => \WP_Http::BAD_REQUEST ] );
	}

	private function get_mutator(): Document_Mutator {
		return $this->mutator ?? Document_Mutator::instance();
	}
}
