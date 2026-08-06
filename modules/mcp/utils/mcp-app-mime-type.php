<?php

namespace Elementor\Modules\Mcp\Utils;

use WP\McpSchema\Server\Resources\DTO\Resource as Resource_Dto;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The MCP adapter validates resource MIME types with a regex that rejects RFC 2045
 * parameters, so `text/html;profile=mcp-app` is stripped while the Resource DTO is built.
 * MCP Apps hosts rely on that profile to recognise a resource as a renderable app
 * template, so it has to be reapplied to the finished DTOs.
 */
class Mcp_App_Mime_Type {

	private array $mime_types_by_uri;

	public function __construct( array $mime_types_by_uri ) {
		$this->mime_types_by_uri = $mime_types_by_uri;
	}

	public function restore( array $resources ): array {
		return array_map( [ $this, 'restore_resource' ], $resources );
	}

	private function restore_resource( $resource ) {
		if ( ! $resource instanceof Resource_Dto ) {
			return $resource;
		}

		$mime_type = $this->mime_types_by_uri[ $resource->getUri() ] ?? null;

		if ( null === $mime_type || $mime_type === $resource->getMimeType() ) {
			return $resource;
		}

		return Resource_Dto::fromArray( array_merge( $resource->toArray(), [ 'mimeType' => $mime_type ] ) );
	}
}
