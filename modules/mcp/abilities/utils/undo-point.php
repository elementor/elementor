<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Undo_Point {

	private int $post_id;

	private string $ability_id;

	private ?int $revision_id;

	private bool $is_new_revision;

	private bool $document_changed = false;

	public function __construct( int $post_id, string $ability_id, ?int $revision_id, bool $is_new_revision ) {
		$this->post_id = $post_id;
		$this->ability_id = $ability_id;
		$this->revision_id = $revision_id;
		$this->is_new_revision = $is_new_revision;
	}

	public function commit(): void {
		$this->document_changed = null === $this->revision_id
			|| ! Document_Revision_Snapshots::matches_current_state( $this->post_id, $this->revision_id );

		if ( ! $this->document_changed ) {
			$this->discard_new_revision();

			return;
		}

		if ( null !== $this->revision_id ) {
			update_metadata( 'post', $this->revision_id, Document_Revision_Snapshots::UNDO_POINT_META_KEY, $this->ability_id );
		}
	}

	public function add_to_response( array $response ): array {
		if ( ! $this->document_changed ) {
			return $response;
		}

		$response['undo_revision_id'] = $this->revision_id;
		$response['llm_instructions'] = trim(
			( $response['llm_instructions'] ?? '' ) . ' ' . Document_Mutation_Links::undo_instructions( $this->post_id, $this->revision_id )
		);

		return $response;
	}

	private function discard_new_revision(): void {
		if ( $this->is_new_revision ) {
			wp_delete_post_revision( $this->revision_id );
		}
	}
}
