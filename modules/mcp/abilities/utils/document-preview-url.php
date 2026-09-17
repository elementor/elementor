<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Core\Base\Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Document_Preview_Url {

	public static function output_schema_property(): array {
		return [
			'type' => 'string',
			'format' => 'uri',
			'description' => 'Human preview URL. Open in a browser while logged into WordPress as an editor; relies on session cookies, not preview_nonce.',
		];
	}

	public static function for_document( Document $document ): string {
		return remove_query_arg( 'preview_nonce', $document->get_wp_preview_url() );
	}
}
