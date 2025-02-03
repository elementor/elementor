<?php

namespace Elementor\Testing\Modules\WpRest\Isolation;

use Elementor\Core\Isolation\Wordpress_Adapter as Core_Adapter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Wordpress_Adapter extends Core_Adapter {
	private array $post_types;
	private array $posts;

	public function __construct() {
		$this->post_types = [
			new Post_Type_Mock( 'Post', 'post' ),
			new Post_Type_Mock( 'Page', 'page' ),
			new Post_Type_Mock( 'Product', 'product' ),
			new Post_Type_Mock( 'Movie', 'movie' ),
		];

		$this->posts = [
			new Post_Mock( 'Hello World', '1', 'The first post on the site.', 'https://example.com/?p=1', 'publish', 'post' ),
			new Post_Mock( 'My Blogging Journey', '2', 'Sharing my experiences as a blogger.', 'https://example.com/?p=2', 'publish', 'post' ),
			new Post_Mock( 'Breaking News: Tech Trends', '3', 'Latest updates in the tech industry.', 'https://example.com/?p=3', 'draft', 'post' ),
			new Post_Mock( 'About Us', '4', 'Learn more about our company.', 'https://example.com/?p=4', 'publish', 'page' ),
			new Post_Mock( 'Contact Us', '5', 'Reach out to us via this page.', 'https://example.com/?p=5', 'publish', 'page' ),
			new Post_Mock( 'Privacy Policy', '6', 'Our privacy policies and terms.', 'https://example.com/?p=6', 'private', 'page' ),
			new Post_Mock( 'Super Phone X', '7', 'A powerful smartphone with cutting-edge features.', 'https://example.com/?p=7', 'publish', 'product' ),
			new Post_Mock( 'Gaming Laptop Pro', '8', 'High-performance laptop for gamers.', 'https://example.com/?p=8', 'publish', 'product' ),
			new Post_Mock( 'Smartwatch 2025', '9', 'The latest smartwatch with health tracking.', 'https://example.com/?p=9', 'draft', 'product' ),
			new Post_Mock( 'Epic Movie: Rise of AI', '10', 'A sci-fi thriller about AI taking over.', 'https://example.com/?p=10', 'publish', 'movie' ),
			new Post_Mock( 'Horror Night', '11', 'A terrifying horror experience.', 'https://example.com/?p=11', 'private', 'movie' ),
			new Post_Mock( 'Comedy Gold', '12', 'A lighthearted comedy for the whole family.', 'https://example.com/?p=12', 'publish', 'movie' ),
		];
	}

	public function get_posts( $args ): array {
		return [];
	}

	public function get_post_types( $args = [], $output = 'names', $operator = 'and' ): array {
		return [];
	}
}
