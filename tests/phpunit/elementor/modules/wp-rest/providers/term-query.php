<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WpRest\Providers;

use Elementor\Modules\WpRest\Classes\Term_Query as Term_Query_Class;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

trait Term_Query {
	private $uncategorized_term_id = 1;
	
	private $force_delete = true;
	private $count = -1;

	protected array $taxonomies;
	protected array $terms;

	protected function clean() {
		foreach ( $this->terms as $term ) {
			wp_delete_term( $term->term_id, $term->taxonomy, $this->force_delete );
		}

		foreach ( get_terms( [
			'exclude' => [ $this->uncategorized_term_id ],
			'number' => $this->count,
			'hide_empty' => false,
		] ) as $term ) {
			var_dump( $term->name );
		}

		foreach ( $this->taxonomies as $taxonomy ) {
			unregister_taxonomy( $taxonomy );
		}

		$this->terms = [];
		$this->taxonomies = [];
	}

	protected function init() {
		foreach ( get_terms( [
			'exclude' => [ $this->uncategorized_term_id ],
			'number' => $this->count,
			'hide_empty' => false,
		] ) as $term ) {
			wp_delete_term( $term->term_id, $term->taxonomy, $this->force_delete );
		}

		$this->register_taxonomies();
		$this->create_terms();
	}

	private function register_taxonomies() {
		$this->taxonomies = [
			'genre' => register_taxonomy( 'genre', 'post', [
				'hierarchical' => true,
				'public' => true,
				'labels' => [
					'name' => 'Genres',
					'singular_name' => 'Genre'
				]
			] ),
			'misc' => register_taxonomy( 'misc', 'product', [
				'hierarchical' => false,
				'public' => true,
				'labels' => [
					'name' => 'Misc',
					'singular_name' => 'Misc'
				]
			] ),
		];
	}

	private function create_terms() {
		$this->count = 0;

		$this->terms = [
			$this->insert_term( 'Technology Reviews', 'category' ),
			$this->insert_term( 'Travel Adventures', 'category' ),
			$this->insert_term( 'Food & Recipes', 'category' ),
			$this->insert_term( 'trending', 'post_tag' ),
			$this->insert_term( 'featured-content', 'post_tag' ),
			$this->insert_term( 'must-read', 'post_tag' ),
			$this->insert_term( 'Science Fiction', 'genre' ),
			$this->insert_term( 'Mystery Thriller', 'genre' ),
			$this->insert_term( 'Historical Drama', 'genre' ),
			$this->insert_term( 'Limited Edition', 'misc' ),
			$this->insert_term( 'Seasonal Special', 'misc' ),
			$this->insert_term( 'Premium Collection', 'misc' ),
		];
	}

	private function insert_term( $name, $taxonomy ) {
		$term_id = $this->factory()->term->create( [
			'name' => $name,
			'taxonomy' => $taxonomy,
		] );

		if ( $term_id ) {
			$this->count++;
		}

		return get_term( $term_id );
	}

	public function data_provider_term_query() {
		return [
			[
				'params' => array_merge( Term_Query_Class::build_query_params( [
					Term_Query_Class::EXCLUDED_TYPE_KEY => [],
					Term_Query_Class::KEYS_CONVERSION_MAP_KEY => [
						'term_id' => 'id',
						'name' => 'label',
						'taxonomy' => 'groupLabel',
					],
				] ), [ Term_Query_Class::SEARCH_TERM_KEY => 'ea' ] ),
				'expected' => [
					[
						'id' => $this->terms[4]->term_id,
						'label' => $this->terms[4]->name,
						'groupLabel' => $this->terms[4]->taxonomy,
					],
					[
						'id' => $this->terms[5]->term_id,
						'label' => $this->terms[5]->name,
						'groupLabel' => $this->terms[5]->taxonomy,
					],
					[
						'id' => $this->terms[10]->term_id,
						'label' => $this->terms[10]->name,
						'groupLabel' => $this->terms[10]->taxonomy,
					],
				],
			],
			[
				'params' => array_merge( Term_Query_Class::build_query_params( [
					Term_Query_Class::EXCLUDED_TYPE_KEY => [ 'genre', 'post_tag' ],
					Term_Query_Class::KEYS_CONVERSION_MAP_KEY => [
						'term_id' => 'my_id',
						'name' => 'my_name',
					],
				] ), [ Term_Query_Class::SEARCH_TERM_KEY => 'e' ] ),
				'expected' => [
					[
						'my_id' => $this->terms[9]->term_id,
						'my_name' => $this->terms[9]->name,
					],
					[
						'my_id' => $this->terms[11]->term_id,
						'my_name' => $this->terms[11]->name,
					],
				],
			],
			[
				'params' => array_merge( Term_Query_Class::build_query_params( [
					Term_Query_Class::EXCLUDED_TYPE_KEY => [ 'misc', 'category' ],
					Term_Query_Class::KEYS_CONVERSION_MAP_KEY => [
						'term_id' => 'my_id',
						'name' => 'my_name',
					],
				] ), [ Term_Query_Class::SEARCH_TERM_KEY => 'co' ] ),
				'expected' => [
					[
						'my_id' => $this->terms[11]->term_id,
						'my_name' => $this->terms[11]->name,
					],
				],
			],
			[
				'params' => array_merge( Term_Query_Class::build_query_params( [
					Term_Query_Class::EXCLUDED_TYPE_KEY => [ 'category', 'post_tag', 'genre', 'misc' ],
					Term_Query_Class::KEYS_CONVERSION_MAP_KEY => [
						'term_id' => 'my_id',
						'name' => 'my_name',
					],
				] ), [ Term_Query_Class::SEARCH_TERM_KEY => 'a ' ] ),
				'expected' => [],
			],
		];
	}
}
