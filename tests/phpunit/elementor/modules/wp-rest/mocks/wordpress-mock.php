<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WpRest\Mocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class WordpressMock {
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
			new Post_Mock( 'Hello World', 1001, 'The first post on the site.', 'publish', 'post' ),
			new Post_Mock( 'My Blogging Journey', 1002, 'Sharing my experiences as a blogger.', 'publish', 'post' ),
			new Post_Mock( 'Breaking News: Tech Trends', 1003, 'Latest updates in the tech industry.', 'draft', 'post' ),
			new Post_Mock( 'About Us', 1004, 'Learn more about our company.', 'publish', 'page' ),
			new Post_Mock( 'Contact Us', 1005, 'Reach out to us via this page.', 'publish', 'page' ),
			new Post_Mock( 'Privacy Policy', 1006, 'Our privacy policies and terms.', 'private', 'page' ),
			new Post_Mock( 'Super Phone X', 1007, 'A powerful smartphone with cutting-edge features.', 'publish', 'product' ),
			new Post_Mock( 'Gaming Laptop Pro', 1008, 'High-performance laptop for gamers.', 'publish', 'product' ),
			new Post_Mock( 'Smartwatch 2025', 1009, 'The latest smartwatch with health tracking.', 'draft', 'product' ),
			new Post_Mock( 'Epic Movie: Rise of AI', 1010, 'A sci-fi thriller about AI taking over.', 'publish', 'movie' ),
			new Post_Mock( 'Horror Night', 1011, 'A terrifying horror experience.', 'private', 'movie' ),
			new Post_Mock( 'Comedy Gold', 1012, 'A lighthearted comedy for the whole family.', 'publish', 'movie' ),
		];
	}

	public function clean() {
		foreach ( $this->posts as $post ) {
			$post->delete();
		}

		foreach ( $this->post_types as $post_type ) {
			$post_type->unregister();
		}

		$this->posts = [];
		$this->post_types = [];
	}
}
