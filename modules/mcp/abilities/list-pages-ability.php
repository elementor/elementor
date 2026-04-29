<?php

namespace Elementor\Modules\Mcp\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class List_Pages_Ability {

	public function register() {
		wp_register_ability(
			'elementor/list-pages',
			[
				'label' => __( 'List Elementor Pages', 'elementor' ),
				'description' => __( 'Returns pages and posts built with Elementor on this WordPress site. Each item includes ID, title, status (publish/draft), URL, and post type. Use this first to discover which pages exist before fetching their structure or modifying settings.', 'elementor' ),
				'category' => 'elementor',
				'input_schema' => [
					'type' => 'object',
					'properties' => [
						'status' => [
							'type' => 'string',
							'enum' => [ 'publish', 'draft', 'any' ],
							'default' => 'any',
						],
						'post_type' => [
							'type' => 'string',
							'description' => 'Filter by post type. Omit for all Elementor-supported types.',
						],
					],
				],
				'output_schema' => [
					'type' => 'array',
					'items' => [
						'type' => 'object',
						'properties' => [
							'id' => [ 'type' => 'integer' ],
							'title' => [ 'type' => 'string' ],
							'status' => [ 'type' => 'string' ],
							'url' => [ 'type' => 'string' ],
							'type' => [ 'type' => 'string' ],
						],
					],
				],
				'meta' => [
					'annotations' => [
						'readonly' => true,
						'idempotent' => true,
						'destructive' => false,
					],
				],
				'permission_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
				'execute_callback' => [ $this, 'execute' ],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];

		$args = [
			'post_type' => get_post_types_by_support( 'elementor' ),
			'meta_key' => '_elementor_edit_mode',
			'meta_value' => 'builder',
			'post_status' => isset( $input['status'] ) ? $input['status'] : 'any',
			'fields' => 'ids',
			'posts_per_page' => -1,
			'orderby' => 'date',
			'order' => 'DESC',
			'suppress_filters' => false,
		];

		if ( ! empty( $input['post_type'] ) ) {
			$args['post_type'] = sanitize_key( $input['post_type'] );
		}

		$ids = get_posts( $args );

		$ids = array_values(
			array_filter(
				array_map( 'absint', $ids ),
				function ( $id ) {
					return $id && current_user_can( 'edit_post', $id );
				}
			)
		);

		return array_map(
			function ( $id ) {
				return [
					'id' => $id,
					'title' => get_the_title( $id ),
					'status' => get_post_status( $id ),
					'url' => (string) get_permalink( $id ),
					'type' => get_post_type( $id ),
				];
			},
			$ids
		);
	}
}
