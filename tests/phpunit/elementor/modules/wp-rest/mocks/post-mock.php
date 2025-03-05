<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WpRest\Isolation;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Post_Mock {
	public int $ID;
	public string $post_title;
	public string $description;
	public string $status;
	public string $post_type;

	public \WP_Post $post;

	public function __construct( string $post_title, int $ID, string $description, string $status, string $post_type ) {
		$this->post_title = $post_title;
		$this->ID = $ID;
		$this->description = $description;
		$this->status = $status;
		$this->post_type = $post_type;

		$this->insert();
	}

	private function insert() {
		$post_id = wp_insert_post( [
			'post_title' => $this->post_title,
			'ID' => $this->ID,
			'post_content' => $this->description,
			'post_status' => $this->status,
			'post_type' => $this->post_type,
		] );

		$this->post = get_post( $post_id );
	}

	public function delete() {
		wp_delete_post( $this->ID, true );
	}
}
