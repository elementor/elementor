<?php

namespace Elementor\Core\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Find_Media_Ability extends Abstract_Ability {

	protected function get_name(): string {
		return 'wordpress/find-media';
	}

	protected function get_config(): array {
		return [
			'label'       => 'WordPress Find Media',
			'description' => 'Searches the WordPress media library and returns matching attachment IDs, URLs, and metadata.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'search' => [
						'type'        => 'string',
						'description' => 'Search term matched against attachment title, filename, and alt text.',
					],
					'mime_type' => [
						'type'        => 'string',
						'description' => 'Filter by MIME type prefix, e.g. "image", "image/jpeg", "video". Omit for all types.',
					],
					'limit' => [
						'type'        => 'integer',
						'description' => 'Maximum number of results. Default: 10. Max: 50.',
					],
				],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'attachments' => [
						'type'        => 'array',
						'description' => 'Matching attachments.',
						'items'       => [
							'type'       => 'object',
							'properties' => [
								'id'        => [ 'type' => 'integer' ],
								'title'     => [ 'type' => 'string' ],
								'filename'  => [ 'type' => 'string' ],
								'url'       => [ 'type' => 'string' ],
								'alt'       => [ 'type' => 'string' ],
								'mime_type' => [ 'type' => 'string' ],
								'width'     => [ 'type' => [ 'integer', 'null' ] ],
								'height'    => [ 'type' => [ 'integer', 'null' ] ],
							],
						],
					],
					'count' => [ 'type' => 'integer' ],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Searches the WordPress media library. Use to resolve attachment IDs before passing image values to Elementor elements.',
						'search: matched against attachment title, filename (post_name), and alt text.',
						'mime_type: filter, e.g. "image" matches all images; "image/png" matches PNGs only.',
						'limit: default 10, max 50.',
						'The returned id is the WordPress attachment ID — use it as image-src.id in Elementor image props.',
						'If the target image is not in the library, use wordpress/upload-media to sideload it from a URL first.',
					] ),
					'readonly'    => true,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$search    = $input['search'] ?? '';
		$mime_type = $input['mime_type'] ?? '';
		$limit     = min( 50, max( 1, (int) ( $input['limit'] ?? 10 ) ) );

		$query_args = [
			'post_type'      => 'attachment',
			'post_status'    => 'inherit',
			'posts_per_page' => $limit,
			'orderby'        => 'relevance',
		];

		if ( '' !== $search ) {
			$query_args['s'] = $search;
		}

		if ( '' !== $mime_type ) {
			$query_args['post_mime_type'] = $mime_type;
		}

		$query       = new \WP_Query( $query_args );
		$attachments = [];

		foreach ( $query->posts as $post ) {
			$meta    = wp_get_attachment_metadata( $post->ID );
			$url     = wp_get_attachment_url( $post->ID );
			$alt     = get_post_meta( $post->ID, '_wp_attachment_image_alt', true );
			$width   = $meta['width'] ?? null;
			$height  = $meta['height'] ?? null;
			$file    = basename( get_attached_file( $post->ID ) ?? '' );

			$attachments[] = [
				'id'        => $post->ID,
				'title'     => $post->post_title,
				'filename'  => $file,
				'url'       => $url ? $url : '',
				'alt'       => is_string( $alt ) ? $alt : '',
				'mime_type' => $post->post_mime_type,
				'width'     => is_int( $width ) ? $width : ( is_numeric( $width ) ? (int) $width : null ),
				'height'    => is_int( $height ) ? $height : ( is_numeric( $height ) ? (int) $height : null ),
			];
		}

		return [
			'attachments' => $attachments,
			'count'       => count( $attachments ),
		];
	}
}
