<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Snapshot_Recording {

	private $result;

	private bool $document_changed;

	private int $post_id;

	private ?int $undo_revision_id;

	public function __construct( $result, bool $document_changed, int $post_id, ?int $undo_revision_id ) {
		$this->result = $result;
		$this->document_changed = $document_changed;
		$this->post_id = $post_id;
		$this->undo_revision_id = $undo_revision_id;
	}

	public function get_result() {
		return $this->result;
	}

	public function add_to_response( array $response ): array {
		if ( ! $this->document_changed ) {
			return $response;
		}

		$response['undo_revision_id'] = $this->undo_revision_id;
		$response['llm_instructions'] = trim(
			( $response['llm_instructions'] ?? '' ) . ' ' . Document_Mutation_Links::undo_instructions( $this->post_id, $this->undo_revision_id )
		);

		return $response;
	}
}
