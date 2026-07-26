<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Document_Render_Url {

	public static function output_schema_property(): array {
		return [
			'type' => 'string',
			'format' => 'uri',
			'description' => 'Authenticated REST URL that returns rendered HTML and text for LLM verification. Fetch with the same MCP credentials.',
		];
	}

	public static function for_post( int $post_id, ?string $element_id = null ): string {
		$url = rest_url( 'elementor/v1/mcp/documents/' . $post_id . '/render' );

		if ( null !== $element_id && '' !== $element_id ) {
			$url = add_query_arg( 'element_id', $element_id, $url );
		}

		return $url;
	}
}
