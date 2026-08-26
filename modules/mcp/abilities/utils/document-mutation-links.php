<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Core\Base\Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Shared response shape for every mutating MCP tool. The LLM-facing surface is `edit_url`
 * (durable editor URL, must be echoed to the user). `preview_url` is retained on the response
 * for agent self-verification (screenshotting the render) but is NOT what the LLM shares with
 * the user — `llm_instructions` reinforces that.
 */
class Document_Mutation_Links {

	public static function edit_url_schema_property(): array {
		return [
			'type' => 'string',
			'format' => 'uri',
			'description' => 'Elementor editor URL for the document. Share with the user when they need a link (they must be logged into WordPress as an editor).',
		];
	}

	public static function preview_schema_property(): array {
		return Document_Preview_Url::output_schema_property() + [
			'description' => 'Agent-internal rendered-preview URL for self-verification only. Do NOT share with the user — always show `edit_url` instead.',
		];
	}

	public static function llm_instructions_schema_property(): array {
		return [
			'type' => 'string',
			'description' => 'Mandatory next step: include this text (with the edit link) in your reply to the user.',
		];
	}

	public static function for_document( Document $document, ?string $success_message = null ): array {
		$edit_url    = $document->get_edit_url();
		$preview_url = Document_Preview_Url::for_document( $document );

		return [
			'edit_url'         => $edit_url,
			'preview_url'      => $preview_url,
			'llm_instructions' => self::build_llm_instructions( $edit_url, $success_message ),
		];
	}

	/**
	 * Component documents have no public permalink, so there is no useful preview URL. Returns
	 * `edit_url` + `llm_instructions` only.
	 */
	public static function for_component( Document $document, ?string $success_message = null ): array {
		$edit_url = $document->get_edit_url();

		return [
			'edit_url'         => $edit_url,
			'llm_instructions' => self::build_llm_instructions( $edit_url, $success_message ),
		];
	}

	private static function build_llm_instructions( string $edit_url, ?string $success_message = null ): string {
		$prefix = $success_message ?? __( 'Change saved.', 'elementor' );

		return sprintf(
			/* translators: 1: Success message, 2: Editor URL the LLM must share with the user. */
			__( '%1$s You MUST show the user this edit link in your reply (they must be logged into WordPress as an editor): %2$s', 'elementor' ),
			$prefix,
			$edit_url
		);
	}
}
