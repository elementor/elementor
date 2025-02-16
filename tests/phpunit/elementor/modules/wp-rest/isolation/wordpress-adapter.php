<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WpRest\Isolation;

use Elementor\Core\Isolation\Wordpress_Adapter as Core_Adapter;
use Elementor\Core\Isolation\Wordpress_Adapter_Interface;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Wordpress_Adapter extends Core_Adapter implements Wordpress_Adapter_Interface {
	private array $post_types;
	private array $posts;

	public function __construct() {
		$this->post_types = [
			'post' => new Post_Type_Mock( 'Post', 'post' ),
			'page' => new Post_Type_Mock( 'Page', 'page' ),
			'product' => new Post_Type_Mock( 'Product', 'product' ),
			'movie' => new Post_Type_Mock( 'Movie', 'movie' ),
		];

		$this->posts = [
			new Post_Mock( 'Hello World', 1001, 'The first post on the site.', 'https://example.com/?p=1', 'publish', 'post' ),
			new Post_Mock( 'My Blogging Journey', 1002, 'Sharing my experiences as a blogger.', 'https://example.com/?p=2', 'publish', 'post' ),
			new Post_Mock( 'Breaking News: Tech Trends', 1003, 'Latest updates in the tech industry.', 'https://example.com/?p=3', 'draft', 'post' ),
			new Post_Mock( 'About Us', 1004, 'Learn more about our company.', 'https://example.com/?p=4', 'publish', 'page' ),
			new Post_Mock( 'Contact Us', 1005, 'Reach out to us via this page.', 'https://example.com/?p=5', 'publish', 'page' ),
			new Post_Mock( 'Privacy Policy', 1006, 'Our privacy policies and terms.', 'https://example.com/?p=6', 'private', 'page' ),
			new Post_Mock( 'Super Phone X', 1007, 'A powerful smartphone with cutting-edge features.', 'https://example.com/?p=7', 'publish', 'product' ),
			new Post_Mock( 'Gaming Laptop Pro', 1008, 'High-performance laptop for gamers.', 'https://example.com/?p=8', 'publish', 'product' ),
			new Post_Mock( 'Smartwatch 2025', 1009, 'The latest smartwatch with health tracking.', 'https://example.com/?p=9', 'draft', 'product' ),
			new Post_Mock( 'Epic Movie: Rise of AI', 1010, 'A sci-fi thriller about AI taking over.', 'https://example.com/?p=10', 'publish', 'movie' ),
			new Post_Mock( 'Horror Night', 1011, 'A terrifying horror experience.', 'https://example.com/?p=11', 'private', 'movie' ),
			new Post_Mock( 'Comedy Gold', 1012, 'A lighthearted comedy for the whole family.', 'https://example.com/?p=12', 'publish', 'movie' ),
		];
	}

	public function get_posts( $args ): array {
		$default_args = [
			'post_type' => [],
			'numberposts' => -1,
			'search_term' => '',
		];

		$args = wp_parse_args( $args, $default_args );
		$search_term = trim( $args['search_term'] );
		$post_types = (array) $args['post_type'];

		$filtered_posts = array_filter( $this->posts, function ( $post ) use ( $search_term, $post_types ) {
			$post_id = is_object( $post ) ? $post->ID : ( $post['ID'] ?? 0 );
			$post_title = is_object( $post ) ? $post->post_title : ( $post['post_title'] ?? '' );
			$post_type = is_object( $post ) ? $post->post_type : ( $post['post_type'] ?? '' );

			if ( ! empty( $post_types ) && ! in_array( $post_type, array_keys( $post_types ), true ) ) {
				return false;
			}

			if ( $search_term !== '' ) {
				return ( stripos( $post_title, $search_term ) !== false )
					|| ( stripos( (string) $post_id, $search_term ) !== false );
			}

			return true;
		} );

		return array_slice( array_values( $filtered_posts ), 0, $args['numberposts'] > 0 ? $args['numberposts'] : null );
	}

	public function get_post_types( $args = [], $output = 'names', $operator = 'and' ): array {
		return $this->post_types;
	}
}
