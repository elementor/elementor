<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class List_Assets_Ability extends Abstract_Ability {

	const MAX_PER_PAGE = 50;
	const DEFAULT_PER_PAGE = 20;

	const TYPE_ALL = 'all';
	const TYPE_IMAGE = 'image';
	const TYPE_SVG = 'svg';
	const TYPE_VIDEO = 'video';

	const IMAGE_MIME_TYPES = [
		'image/jpeg',
		'image/png',
		'image/gif',
		'image/webp',
		'image/avif',
		'image/svg+xml',
	];

	const SVG_MIME_TYPE = 'image/svg+xml';

	const VIDEO_MIME_TYPES = [
		'video/mp4',
		'video/webm',
		'video/ogg',
		'video/quicktime',
	];

	const EMPTY_RESULT_HINT = 'No matching assets are in the Media Library. Ask the user to upload the images or SVG icons they want to use (WP Admin → Media → Add New), then call this tool again. Do not fabricate attachment ids.';

	protected function get_ability_id(): string {
		return 'elementor/list-assets';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'List Media Library Assets', 'elementor' ),
			Prompt_Loader::load( 'list-assets' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'assets' => [
						'type' => 'array',
						'items' => [
							'type' => 'object',
							'properties' => [
								'id' => [ 'type' => 'integer' ],
								'url' => [ 'type' => 'string' ],
								'title' => [ 'type' => 'string' ],
								'alt' => [ 'type' => 'string' ],
								'mime_type' => [ 'type' => 'string' ],
								'width' => [ 'type' => [ 'integer', 'null' ] ],
								'height' => [ 'type' => [ 'integer', 'null' ] ],
							],
						],
					],
					'total' => [ 'type' => 'integer' ],
					'page' => [ 'type' => 'integer' ],
					'per_page' => [ 'type' => 'integer' ],
					'llm_instructions' => [ 'type' => 'string' ],
				],
			],
			[
				'annotations' => [
					'readonly' => true,
					'idempotent' => true,
					'destructive' => false,
				],
			],
			fn() => current_user_can( 'edit_posts' ),
			[
				'type' => 'object',
				'properties' => [
					'search' => [
						'type' => 'string',
						'description' => 'Optional keyword matched against attachment title and filename.',
					],
					'type' => [
						'type' => 'string',
						'enum' => [ self::TYPE_ALL, self::TYPE_IMAGE, self::TYPE_SVG, self::TYPE_VIDEO ],
						'default' => self::TYPE_ALL,
						'description' => 'Filter by asset kind. "svg" returns only SVG assets, which are required to reference from an e-svg widget. "video" returns only uploaded videos for e-self-hosted-video and e-background-video.',
					],
					'page' => [
						'type' => 'integer',
						'minimum' => 1,
						'default' => 1,
					],
					'per_page' => [
						'type' => 'integer',
						'minimum' => 1,
						'maximum' => self::MAX_PER_PAGE,
						'default' => self::DEFAULT_PER_PAGE,
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		if ( ! current_user_can( 'edit_posts' ) ) {
			return new \WP_Error(
				'rest_forbidden',
				__( 'You do not have permission to list media assets.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		$input = is_array( $input ) ? $input : [];

		$page = $this->resolve_page( $input );
		$per_page = $this->resolve_per_page( $input );
		$mime_types = $this->resolve_mime_types( $input );
		$search = isset( $input['search'] ) && is_string( $input['search'] ) ? trim( $input['search'] ) : '';

		$query = new \WP_Query( [
			'post_type' => 'attachment',
			'post_status' => 'inherit',
			'post_mime_type' => $mime_types,
			'orderby' => 'date',
			'order' => 'DESC',
			'paged' => $page,
			'posts_per_page' => $per_page,
			's' => $search,
			'no_found_rows' => false,
		] );

		$assets = array_map( [ $this, 'format_attachment' ], $query->posts );

		$response = [
			'assets' => $assets,
			'total' => (int) $query->found_posts,
			'page' => $page,
			'per_page' => $per_page,
		];

		if ( 0 === $response['total'] ) {
			$response['llm_instructions'] = self::EMPTY_RESULT_HINT;
		}

		return $response;
	}

	private function resolve_page( array $input ): int {
		$page = isset( $input['page'] ) ? (int) $input['page'] : 1;

		return max( 1, $page );
	}

	private function resolve_per_page( array $input ): int {
		$per_page = isset( $input['per_page'] ) ? (int) $input['per_page'] : self::DEFAULT_PER_PAGE;

		return max( 1, min( self::MAX_PER_PAGE, $per_page ) );
	}

	private function resolve_mime_types( array $input ): array {
		$type = isset( $input['type'] ) && is_string( $input['type'] ) ? $input['type'] : self::TYPE_ALL;

		if ( self::TYPE_SVG === $type ) {
			return [ self::SVG_MIME_TYPE ];
		}

		if ( self::TYPE_VIDEO === $type ) {
			return self::VIDEO_MIME_TYPES;
		}

		return self::IMAGE_MIME_TYPES;
	}

	private function format_attachment( \WP_Post $attachment ): array {
		$metadata = wp_get_attachment_metadata( $attachment->ID );

		return [
			'id' => (int) $attachment->ID,
			'url' => (string) wp_get_attachment_url( $attachment->ID ),
			'title' => (string) $attachment->post_title,
			'alt' => (string) get_post_meta( $attachment->ID, '_wp_attachment_image_alt', true ),
			'mime_type' => (string) $attachment->post_mime_type,
			'width' => isset( $metadata['width'] ) ? (int) $metadata['width'] : null,
			'height' => isset( $metadata['height'] ) ? (int) $metadata['height'] : null,
		];
	}
}
