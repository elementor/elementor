<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Snapshot_Recording {

	private $result;

	private bool $document_saved;

	private int $post_id;

	private ?int $undo_revision_id;

	public function __construct( $result, bool $document_saved, int $post_id, ?int $undo_revision_id ) {
		$this->result = $result;
		$this->document_saved = $document_saved;
		$this->post_id = $post_id;
		$this->undo_revision_id = $undo_revision_id;
	}

	public function to_response() {
		if ( ! $this->document_saved || ! is_array( $this->result ) ) {
			return $this->result;
		}

		$response = $this->result;
		$response['undo_revision_id'] = $this->undo_revision_id;
		$response['llm_instructions'] = trim(
			( $response['llm_instructions'] ?? '' ) . ' ' . Document_Mutation_Links::undo_instructions( $this->post_id, $this->undo_revision_id )
		);

		return $response;
	}
}
