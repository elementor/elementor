<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Core\Base\Document;

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
			'description' => 'Mandatory next step: include this text (with the preview link) in your reply to the user.',
		];
	}

	public static function for_document( Document $document, ?string $success_message = null ): array {
		$preview_url = Document_Preview_Url::for_document( $document );

		return [
			'preview_url' => $preview_url,
			'llm_instructions' => self::build_llm_instructions( $preview_url, $success_message ),
		];
	}

	private static function build_llm_instructions( string $preview_url, ?string $success_message = null ): string {
		$prefix = $success_message ?? __( 'Change saved.', 'elementor' );

		return sprintf(
			/* translators: 1: Success message, 2: Preview URL the LLM must share with the user. */
			__( '%1$s You MUST show the human this preview link in your reply (they must be logged into WordPress as an editor): %2$s', 'elementor' ),
			$prefix,
			$preview_url
		);
	}
}
