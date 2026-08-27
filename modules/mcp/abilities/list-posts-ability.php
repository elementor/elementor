<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class List_Posts_Ability extends Abstract_Ability {

	const MAX_PER_PAGE = 25;
	const DEFAULT_PER_PAGE = 10;

	const POST_TYPE_ALL = 'all';
	const POST_TYPE_POST = 'post';
	const POST_TYPE_PAGE = 'page';
	const POST_TYPE_PRODUCT = 'product';

	const SUPPORTED_POST_TYPES = [ self::POST_TYPE_POST, self::POST_TYPE_PAGE, self::POST_TYPE_PRODUCT ];

	const EMPTY_RESULT_HINT = 'No matching posts found. The site may have no published content yet, or you need to adjust your search terms.';

	protected function get_ability_id(): string {
		return 'elementor/list-posts';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'List WordPress Posts', 'elementor' ),
			Prompt_Loader::load( 'list-posts' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'posts' => [
						'type' => 'array',
						'items' => [
							'type' => 'object',
							'properties' => [
								'id' => [ 'type' => 'integer' ],
								'title' => [ 'type' => 'string' ],
								'post_type' => [ 'type' => 'string' ],
								'date' => [ 'type' => 'string' ],
								'modified' => [ 'type' => 'string' ],
								'url' => [ 'type' => 'string' ],
								'author' => [
									'type' => 'object',
									'properties' => [
										'id' => [ 'type' => 'integer' ],
										'name' => [ 'type' => 'string' ],
									],
								],
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
						'description' => 'Optional keyword matched against post title and content.',
					],
					'post_type' => [
						'type' => 'string',
						'enum' => array_merge( [ self::POST_TYPE_ALL ], self::SUPPORTED_POST_TYPES ),
						'default' => self::POST_TYPE_ALL,
						'description' => 'Filter by post type. "all" returns posts, pages and products (when available).',
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
				__( 'You do not have permission to list posts.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		$input = is_array( $input ) ? $input : [];

		$page = $this->resolve_page( $input );
		$per_page = $this->resolve_per_page( $input );
		$post_types = $this->resolve_post_types( $input );
		if ( is_wp_error( $post_types ) ) {
			return $post_types;
		}
		$search = isset( $input['search'] ) && is_string( $input['search'] ) ? trim( $input['search'] ) : '';

		$query_args = [
			'post_type' => $post_types,
			'post_status' => 'publish',
			'orderby' => 'date',
			'order' => 'DESC',
			'paged' => $page,
			'posts_per_page' => $per_page,
			'no_found_rows' => false,
		];

		if ( '' !== $search ) {
			$query_args['s'] = $search;
		}

		$query = new \WP_Query( $query_args );

		$posts = array_map( [ $this, 'format_post' ], $query->posts );

		$response = [
			'posts' => $posts,
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

	private function resolve_post_types( array $input ) {
		$type = isset( $input['post_type'] ) && is_string( $input['post_type'] )
			? sanitize_key( $input['post_type'] )
			: self::POST_TYPE_ALL;

		if ( self::POST_TYPE_ALL === $type ) {
			return array_values( array_filter( self::SUPPORTED_POST_TYPES, 'post_type_exists' ) );
		}

		if ( ! in_array( $type, self::SUPPORTED_POST_TYPES, true ) || ! post_type_exists( $type ) ) {
			return new \WP_Error(
				'invalid_post_type',
				__( 'Unsupported post type. Allowed values: all, post, page, product.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return [ $type ];
	}

	private function format_post( \WP_Post $post ): array {
		$author = get_user_by( 'id', $post->post_author );

		return [
			'id' => (int) $post->ID,
			'title' => (string) $post->post_title,
			'post_type' => (string) $post->post_type,
			'date' => (string) $post->post_date_gmt,
			'modified' => (string) $post->post_modified_gmt,
			'url' => (string) get_permalink( $post->ID ),
			'author' => [
				'id' => $author ? (int) $author->ID : 0,
				'name' => $author ? (string) $author->display_name : '',
			],
		];
	}
}
