<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Core\Base\Document;
use Elementor\Modules\Components\Documents\Component as Component_Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Document_Mutation_Links {

	public static function preview_schema_property(): array {
		return Document_Preview_Url::output_schema_property();
	}

	public static function llm_instructions_schema_property(): array {
		return [
			'type' => 'string',
			'description' => 'Mandatory next step: include this text (with the preview or editor link) in your reply to the user.',
		];
	}
	public static function staged_schema_property(): array {
		return [
			'type' => 'boolean',
			'description' => 'True when the document is a draft copy of a published page: changes are not live until elementor/publish-document.',
		];
	}

	public static function staged_write_instructions( Document $document ): string {
		if ( $document instanceof Component_Document ) {
			return __( 'Change saved to a draft copy of the component. Pages using it are unchanged until you call elementor/manage-component with action=publish.', 'elementor' );
		}

		return __( 'Change saved to a draft copy. The live page is unchanged until you call elementor/publish-document.', 'elementor' );
	}

	public static function staged_read_instructions(): string {
		return __( 'This structure includes staged changes that are not live yet. The live page shows them only after you call elementor/publish-document.', 'elementor' );
	}

	public static function undo_revision_id_schema_property(): array {
		return [
			'type' => [ 'integer', 'null' ],
			'description' => 'Revision holding the document state from before this change. Pass it as revision_id to elementor/manage-revisions with action=restore to undo the change. Null when revisions are disabled for this post.',
		];
	}

	public static function undo_instructions( int $post_id, ?int $undo_revision_id ): string {
		if ( null === $undo_revision_id ) {
			return __( 'Undo is unavailable for this change because revisions are disabled for this post.', 'elementor' );
		}

		return sprintf(
			/* translators: 1: Post ID, 2: Revision ID. */
			__( 'To undo this change, call elementor/manage-revisions with action=restore, post_id %1$d and revision_id %2$d.', 'elementor' ),
			$post_id,
			$undo_revision_id
		);
	}

	public static function for_document( Document $document, ?string $success_message = null ): array {
		$prefix = $success_message ?? __( 'Change saved.', 'elementor' );
		$preview_url = Document_Preview_Url::for_document( $document );

		if ( '' === $preview_url ) {
			return self::for_editor_link( $prefix, (string) $document->get_edit_url() );
		}

		return [
			'preview_url' => $preview_url,
			'llm_instructions' => self::build_preview_link_instructions( $prefix, $preview_url ),
		];
	}

	private static function for_editor_link( string $prefix, string $edit_url ): array {
		if ( '' === $edit_url ) {
			return [ 'llm_instructions' => $prefix ];
		}

		return [
			'edit_url' => $edit_url,
			'llm_instructions' => self::build_edit_link_instructions( $prefix, $edit_url ),
		];
	}

	private static function build_preview_link_instructions( string $prefix, string $preview_url ): string {
		return sprintf(
			/* translators: 1: Success message, 2: Preview URL the LLM must share with the user. */
			__( '%1$s You MUST show the user this preview link in your reply (they must be logged into WordPress as an editor): %2$s', 'elementor' ),
			$prefix,
			$preview_url
		);
	}

	private static function build_edit_link_instructions( string $prefix, string $edit_url ): string {
		return sprintf(
			/* translators: 1: Success message, 2: Elementor editor URL the LLM must share with the user. */
			__( '%1$s You MUST show the user this link to review the change in the Elementor editor: %2$s', 'elementor' ),
			$prefix,
			$edit_url
		);
	}
}
