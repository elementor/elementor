<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WpRest\Providers;

use Elementor\Modules\WpRest\Classes\Post_Query as Post_Query_Class;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

trait Post_Query {
	private $force_delete = true;
	private $count = -1;

	protected array $post_types;
	protected array $posts;
	protected ?\WP_Term $term;

	protected function clean() {
		foreach ( $this->posts as $post ) {
			wp_delete_post( $post->ID, $this->force_delete );
		}

		$this->assertEquals( count( get_posts( [
			'post_type' => [ 'post', 'product', 'page', 'movie' ],
			'numberposts' => $this->count,
		] ) ), 0 );

		foreach ( $this->post_types as $post_type ) {
			unregister_post_type( $post_type );
		}

		$this->count = -1;
		$this->posts = [];
		$this->post_types = [];

		$this->delete_term();
	}

	protected function init() {
		foreach ( get_posts( [
			'post_type' => [ 'post', 'product', 'page', 'movie' ],
			'numberposts' => $this->count,
		] ) as $post ) {
			wp_delete_post( $post->ID, $this->force_delete );
		}

		$this->register_post_types();
		$this->create_posts();
		$this->create_and_set_post_term();
	}

	private function register_post_types() {
		$this->post_types = [
			'product' => register_post_type( 'product', [
				'label' => 'Product',
				'public' => true,
			] ),
			'movie' => register_post_type( 'movie', [
				'label' => 'Movie',
				'public' => true,
			] ),
		];
	}

	private function create_posts() {
		$this->count = 0;

		$this->posts = [
			$this->insert_post( 'Hello World', 'The first post on the site.', 'publish', 'post' ),
			$this->insert_post( 'My Blogging Journey', 'Sharing my experiences as a blogger.', 'publish', 'post', [
				'meta_input' => [
					'very_special_key' => 'not_so_special_value',
				],
			] ),
			$this->insert_post( 'Breaking News: Tech Trends', 'Latest updates in the tech industry.', 'draft', 'post' ),
			$this->insert_post( 'About Us', 'Learn more about our company.', 'publish', 'page' ),
			$this->insert_post( 'Contact Us', 'Reach out to us via this page.', 'publish', 'page' ),
			$this->insert_post( 'Privacy Policy', 'Our privacy policies and terms.', 'private', 'page' ),
			$this->insert_post( 'Super Phone X', 'A powerful smartphone with cutting-edge features.', 'publish', 'product' ),
			$this->insert_post( 'Gaming Laptop Pro', 'High-performance laptop for gamers.', 'publish', 'product' ),
			$this->insert_post( 'Smartwatch 2025', 'The latest smartwatch with health tracking.', 'draft', 'product' ),
			$this->insert_post( 'Epic Movie: Rise of AI', 'A sci-fi thriller about AI taking over.', 'publish', 'movie' ),
			$this->insert_post( 'Horror Night', 'A terrifying horror experience.', 'private', 'movie' ),
			$this->insert_post( 'Comedy Gold', 'A lighthearted comedy for the whole family.', 'publish', 'post', [
				'meta_input' => [
					'very_special_key' => 'very_special_value',
				],
			] ),
		];
	}

	private function insert_post( $post_title, $description, $status, $post_type, $extra_args = [] ) {
		$this->count++;

		return $this->factory()->create_and_get_custom_post( array_merge( [
			'post_title' => $post_title,
			'post_content' => $description,
			'post_status' => $status,
			'post_type' => $post_type,
		], $extra_args ) );
	}

	private function create_and_set_post_term() {
		$this->term = $this->factory()->term->create_and_get( [
			'name' => 'example',
			'taxonomy' => 'category',
		] );

		wp_set_post_terms( $this->posts[7]->ID, [ $this->term->term_id ], 'category' );
	}

	private function delete_term() {
		wp_delete_term( $this->term->term_id, 'category', true );
	}

	public function data_provider_post_query() {
		return [
			[
				'params' => array_merge( Post_Query_Class::build_query_params( [
					Post_Query_Class::KEYS_CONVERSION_MAP_KEY => [
						'ID' => 'id',
						'post_title' => 'label',
					],
				] ), [ Post_Query_Class::SEARCH_TERM_KEY => 'Us' ] ),
				'expected' => [
					[
						'id' => $this->posts[3]->ID,
						'label' => $this->posts[3]->post_title,
					],
					[
						'id' => $this->posts[4]->ID,
						'label' => $this->posts[4]->post_title,
					],
				],
			],
			[
				'params' => array_merge( Post_Query_Class::build_query_params( [
					Post_Query_Class::EXCLUDED_TYPE_KEY => array_merge( Post_Query_Class::DEFAULT_FORBIDDEN_POST_TYPES, [ 'page', 'post' ] ),
					Post_Query_Class::KEYS_CONVERSION_MAP_KEY => [
						'ID' => 'post_id',
						'post_title' => 'random_key',
					],
				] ), [ Post_Query_Class::SEARCH_TERM_KEY => 'X' ] ),
				'expected' => [
					[
						'post_id' => $this->posts[6]->ID,
						'random_key' => $this->posts[6]->post_title,
					],
				],
			],
			[
				'params' => array_merge( Post_Query_Class::build_query_params( [
					Post_Query_Class::EXCLUDED_TYPE_KEY => array_merge( Post_Query_Class::DEFAULT_FORBIDDEN_POST_TYPES, [ 'page', 'post' ] ),
					Post_Query_Class::KEYS_CONVERSION_MAP_KEY => [
						'ID' => 'post_id',
						'post_title' => 'random_key',
					],
				] ), [ Post_Query_Class::SEARCH_TERM_KEY => 'Privacy' ] ),
				'expected' => [],
			],
			[
				'params' => array_merge( Post_Query_Class::build_query_params( [
					Post_Query_Class::KEYS_CONVERSION_MAP_KEY => [
						'ID' => 'post_id',
						'post_title' => 'random_key',
					],
				] ), [ Post_Query_Class::SEARCH_TERM_KEY => 'Horror' ] ),
				'expected' => [],
			],
			[
				'params' => array_merge( Post_Query_Class::build_query_params( [
					Post_Query_Class::EXCLUDED_TYPE_KEY => array_merge( Post_Query_Class::DEFAULT_FORBIDDEN_POST_TYPES, [ 'product', 'post' ] ),
					Post_Query_Class::KEYS_CONVERSION_MAP_KEY => [
						'ID' => 'id',
						'post_title' => 'label',
					],
				] ), [ Post_Query_Class::SEARCH_TERM_KEY => 'a ' ] ),
				'expected' => [
					[
						'label' => $this->posts[9]->post_title,
						'id' => $this->posts[9]->ID,
					],
					[
						'label' => $this->posts[3]->post_title,
						'id' => $this->posts[3]->ID,
					],
					[
						'label' => $this->posts[4]->post_title,
						'id' => $this->posts[4]->ID,
					],
				],
			],
			[
				'params' => array_merge( Post_Query_Class::build_query_params( [
					Post_Query_Class::EXCLUDED_TYPE_KEY => [],
					Post_Query_Class::KEYS_CONVERSION_MAP_KEY => [
						'ID' => 'id',
						'post_title' => 'label',
					],
					Post_Query_Class::META_QUERY_KEY => [
						[
							'key' => 'very_special_key',
						],
					],
				] ), [ Post_Query_Class::SEARCH_TERM_KEY => 'm' ] ),
				'expected' => [
					[
						'id' => $this->posts[1]->ID,
						'label' => $this->posts[1]->post_title,
					],
					[
						'id' => $this->posts[11]->ID,
						'label' => $this->posts[11]->post_title,
					],
				],
			],
			[
				'params' => array_merge( Post_Query_Class::build_query_params( [
					Post_Query_Class::EXCLUDED_TYPE_KEY => [],
					Post_Query_Class::KEYS_CONVERSION_MAP_KEY => [
						'ID' => 'id',
						'post_title' => 'label',
					],
					Post_Query_Class::META_QUERY_KEY => [
						[
							'key' => 'very_special_key',
							'value' => 'very_special_value',
						],
					],
				] ), [ Post_Query_Class::SEARCH_TERM_KEY => 'm' ] ),
				'expected' => [
					[
						'label' => $this->posts[11]->post_title,
						'id' => $this->posts[11]->ID,
					],
				],
			],
			[
				'params' => array_merge( Post_Query_Class::build_query_params( [
					Post_Query_Class::EXCLUDED_TYPE_KEY => [],
					Post_Query_Class::KEYS_CONVERSION_MAP_KEY => [
						'ID' => 'id',
						'post_title' => 'label',
					],
					Post_Query_Class::TAX_QUERY_KEY => [
						[
							'taxonomy' => 'category',
							'field' => 'term_id',
							'terms' => [ $this->term->term_id ],
						],
					],
				] ), [ Post_Query_Class::SEARCH_TERM_KEY => 'm ' ] ),
				'expected' => [
					[
						'label' => $this->posts[7]->post_title,
						'id' => $this->posts[7]->ID,
					],
				],
			],
		];
	}
}
