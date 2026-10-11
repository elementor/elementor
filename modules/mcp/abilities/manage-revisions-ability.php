<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Document\Document_Mutator;
use Elementor\Modules\Mcp\Abilities\Utils\Document_Mutation_Links;
use Elementor\Modules\Mcp\Abilities\Utils\Document_Mutation_Save;
use Elementor\Modules\Mcp\Abilities\Utils\Document_Revision_Snapshots;
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
			__( 'Manages the revisions of an Elementor document (page, post, template, component). action=restore brings the document back to one of its revisions: the element tree, page settings and component overridable props. Use it to undo changes: every MCP write tool returns an undo_revision_id holding the state from before that change, and elementor/list-revisions lists older revisions, including ones saved from the Elementor editor. On published documents the restore is staged in a draft copy like other MCP edits, so the live page is unchanged until you call elementor/publish-document. The response returns a new undo_revision_id; restore it to redo the change you just undid.', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'post_id' => [ 'type' => 'integer' ],
					'restored_revision_id' => [ 'type' => 'integer' ],
					'staged' => [
						'type' => 'boolean',
						'description' => 'True when the restore was written to a draft copy of a published document and still needs elementor/publish-document to go live.',
					],
					'preview_url' => Document_Mutation_Links::preview_schema_property(),
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
						'description' => 'restore: an undo_revision_id from a previous MCP call, or a revision_id from elementor/list-revisions.',
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

		$revision_document = $this->resolve_revision_document( $main_id, $revision_id );

		if ( is_wp_error( $revision_document ) ) {
			return $revision_document;
		}

		$target = Document_Mutation_Save::elements_preserving_live_status(
			$this->get_mutator(),
			$document,
			$revision_document->get_json_meta( Document::ELEMENTOR_DATA_META_KEY ),
			fn( Document $target ) => Document_Revision_Snapshots::restore_meta( $revision_id, (int) $target->get_post()->ID )
		);

		if ( is_wp_error( $target ) ) {
			return $target;
		}

		$is_staged = (int) $target->get_post()->ID !== $main_id;

		return [
			'post_id' => $main_id,
			'restored_revision_id' => $revision_id,
			'staged' => $is_staged,
		] + Document_Mutation_Links::for_document( $document, $this->get_restore_message( $is_staged ) );
	}

	/**
	 * @return Document|\WP_Error
	 */
	private function resolve_revision_document( int $main_id, int $revision_id ) {
		$revision = wp_get_post_revision( $revision_id );

		if ( ! $revision ) {
			return new \WP_Error( 'revision_not_found', __( 'Revision not found.', 'elementor' ), [ 'status' => \WP_Http::NOT_FOUND ] );
		}

		if ( (int) $revision->post_parent !== $main_id ) {
			return $this->invalid_input( __( 'This revision does not belong to the given post_id.', 'elementor' ), 'revision_mismatch' );
		}

		if ( wp_is_post_autosave( $revision ) ) {
			return $this->invalid_input( __( 'Autosaves cannot be restored. Pick a regular revision from elementor/list-revisions.', 'elementor' ), 'autosave_not_restorable' );
		}

		$revision_document = Plugin::$instance->documents->get( $revision_id );

		if ( ! $revision_document || ! $revision_document->is_built_with_elementor() ) {
			return $this->invalid_input( __( 'This revision was not built with Elementor, so it cannot be restored here.', 'elementor' ), 'revision_not_built_with_elementor' );
		}

		return $revision_document;
	}

	private function get_restore_message( bool $is_staged ): string {
		if ( $is_staged ) {
			return __( 'Revision restored to a draft copy. The live page is unchanged until you call elementor/publish-document.', 'elementor' );
		}

		return __( 'Revision restored.', 'elementor' );
	}

	private function invalid_input( string $message, string $code = 'invalid_input' ): \WP_Error {
		return new \WP_Error( $code, $message, [ 'status' => \WP_Http::BAD_REQUEST ] );
	}

	private function get_mutator(): Document_Mutator {
		return $this->mutator ?? Document_Mutator::instance();
	}
}
